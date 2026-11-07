/**
 * Career Compass - Master Job Ingestion Orchestrator
 * 
 * Executes full ETL pipeline for configured external job sources:
 * Adapters -> Normalization -> Validation -> Duplicate Detection -> Upsert -> Lifecycle Reconcile -> Audit Log
 */

const JobSource = require('../../models/JobSource');
const JobIngestionLog = require('../../models/JobIngestionLog');
const Company = require('../../models/Company');
const GreenhouseAdapter = require('./adapters/greenhouseAdapter');
const LeverAdapter = require('./adapters/leverAdapter');
const JsonFeedAdapter = require('./adapters/jsonFeedAdapter');
const { normalizeJob } = require('./sourceNormalizer');
const { validateJob } = require('./jobValidator');
const { IngestBatchTracker } = require('./duplicateDetector');
const { upsertJob } = require('./jobUpsertService');
const { reconcileMissingJobs } = require('./jobExpiryService');
const { processAlertsForJob } = require('./alertNotifierService');

/**
 * Creates the appropriate adapter instance for a source
 */
function createAdapterForSource(source) {
    switch (source.sourceType) {
        case 'ATS_GREENHOUSE':
            return new GreenhouseAdapter({ boardToken: source.boardToken });
        case 'ATS_LEVER':
            return new LeverAdapter({ boardToken: source.boardToken });
        case 'JSON_FEED':
            return new JsonFeedAdapter({ feedUrl: source.feedUrl });
        default:
            throw new Error(`Unsupported source type: ${source.sourceType}`);
    }
}

/**
 * Executes ingestion for a single JobSource record
 * 
 * @param {Object|string} sourceOrId - JobSource document or sourceId string
 * @param {'SCHEDULED'|'MANUAL'} [triggerType='SCHEDULED']
 * @returns {Promise<Object>} Execution telemetry summary
 */
async function syncSource(sourceOrId, triggerType = 'SCHEDULED') {
    let source = sourceOrId;
    if (typeof sourceOrId === 'string') {
        source = await JobSource.findOne({ sourceId: sourceOrId });
        if (!source) {
            throw new Error(`Job source not found: ${sourceOrId}`);
        }
    }

    const startTime = Date.now();
    source.lastAttemptedSync = new Date();

    const result = {
        sourceId: source.sourceId,
        sourceName: source.sourceName,
        sourceType: source.sourceType,
        companyName: source.companyName,
        triggerType,
        status: 'FAILED',
        jobsFetched: 0,
        jobsAccepted: 0,
        jobsRejected: 0,
        newJobsCreated: 0,
        existingJobsUpdated: 0,
        duplicateJobsDetected: 0,
        jobsExpired: 0,
        executionDurationMs: 0,
        errorLog: []
    };

    try {
        const adapter = createAdapterForSource(source);
        const fetchRes = await adapter.fetchJobs();

        if (!fetchRes.success) {
            result.status = 'FAILED';
            result.errorLog.push({
                timestamp: new Date(),
                message: fetchRes.error || 'Fetch operation failed'
            });

            // Update source telemetry on failure without breaking database
            source.failureCount = (source.failureCount || 0) + 1;
            source.lastError = fetchRes.error;
            await source.save();

            // Update Company sync status if exists
            await Company.updateOne(
                { companyName: new RegExp(`^${source.companyName.trim()}$`, 'i') },
                { $set: { lastSyncStatus: 'FAILED' } }
            );

            result.executionDurationMs = Date.now() - startTime;
            await JobIngestionLog.create(result);
            return result;
        }

        const rawListings = fetchRes.jobs || [];
        result.jobsFetched = rawListings.length;

        const batchTracker = new IngestBatchTracker();
        const seenSourceJobIds = [];

        // Process listings
        for (const rawItem of rawListings) {
            try {
                const normalized = normalizeJob(rawItem, {
                    sourceType: source.sourceType,
                    sourceName: source.sourceName,
                    companyName: source.companyName
                });

                // Validation
                const valResult = validateJob(normalized);
                if (!valResult.isValid) {
                    result.jobsRejected++;
                    result.errorLog.push({
                        timestamp: new Date(),
                        message: `Validation rejected job '${rawItem.title}': ${valResult.error}`
                    });
                    continue;
                }

                // Batch duplicate check
                if (batchTracker.isDuplicateInBatch(normalized)) {
                    result.duplicateJobsDetected++;
                    continue;
                }

                seenSourceJobIds.push(normalized.sourceJobId);

                // Upsert into MongoDB
                const upsertRes = await upsertJob(normalized);
                if (upsertRes.action === 'CREATED') {
                    result.newJobsCreated++;
                    result.jobsAccepted++;
                    // Trigger asynchronous alert matching for new job
                    processAlertsForJob(upsertRes.job).catch(e => console.error('Alert processing error:', e.message));
                } else if (upsertRes.action === 'UPDATED') {
                    result.existingJobsUpdated++;
                    result.jobsAccepted++;
                } else {
                    result.jobsRejected++;
                    if (upsertRes.error) {
                        result.errorLog.push({
                            timestamp: new Date(),
                            message: `Upsert error: ${upsertRes.error}`
                        });
                    }
                }
            } catch (err) {
                result.jobsRejected++;
                result.errorLog.push({
                    timestamp: new Date(),
                    message: `Item processing error: ${err.message}`
                });
            }
        }

        // Run reconciliation for missing jobs (grace period & closures)
        const reconRes = await reconcileMissingJobs(source.companyName, source.sourceType, seenSourceJobIds);
        result.jobsExpired = reconRes.closedCount;

        // Mark success
        result.status = result.errorLog.length > 0 && result.jobsAccepted === 0 ? 'FAILED' : (result.errorLog.length > 0 ? 'PARTIAL' : 'SUCCESS');
        result.executionDurationMs = Date.now() - startTime;

        // Update JobSource
        source.lastSuccessfulSync = new Date();
        source.failureCount = 0;
        source.lastError = null;
        source.totalJobsDiscovered = result.jobsAccepted;
        source.activeJobsCount = reconRes.activeCount;
        source.nextScheduledSync = new Date(Date.now() + (source.syncFrequencyMinutes || 360) * 60000);
        await source.save();

        // Update Company directory record
        await Company.updateOne(
            { companyName: new RegExp(`^${source.companyName.trim()}$`, 'i') },
            {
                $set: {
                    hasLiveIntegration: true,
                    integrationType: source.sourceType === 'ATS_GREENHOUSE' ? 'GREENHOUSE' : (source.sourceType === 'ATS_LEVER' ? 'LEVER' : 'FEED'),
                    boardToken: source.boardToken || '',
                    lastSyncAt: new Date(),
                    lastSyncJobCount: result.jobsAccepted,
                    lastSyncStatus: 'SUCCESS',
                    availableJobCount: reconRes.activeCount
                }
            }
        );

        // Save audit log
        await JobIngestionLog.create(result);

        return result;
    } catch (unhandledErr) {
        result.status = 'FAILED';
        result.executionDurationMs = Date.now() - startTime;
        result.errorLog.push({
            timestamp: new Date(),
            message: `Unhandled exception during sync: ${unhandledErr.message}`
        });

        source.failureCount = (source.failureCount || 0) + 1;
        source.lastError = unhandledErr.message;
        await source.save();

        await JobIngestionLog.create(result);
        return result;
    }
}

/**
 * Synchronizes all active configured sources sequentially
 * @returns {Promise<Array<Object>>}
 */
async function syncAllActiveSources(triggerType = 'SCHEDULED') {
    const activeSources = await JobSource.find({ isActive: true });
    const results = [];

    for (const source of activeSources) {
        const res = await syncSource(source, triggerType);
        results.push(res);
    }

    return results;
}

module.exports = {
    syncSource,
    syncAllActiveSources,
    createAdapterForSource
};

