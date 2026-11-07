/**
 * Career Compass - Job Expiry and Freshness Lifecycle Service
 * 
 * Manages the lifecycle of active listings:
 * - Deadline expiration: marks jobs whose deadlines have elapsed as 'Expired'.
 * - Missing-job grace period: increments consecutiveMissingCount for jobs not returned in a successful sync.
 *   Only after a configurable grace period (e.g. 3 consecutive successful sync runs) is a job transitioned to 'Closed'.
 * - Temporary source outages never trigger closures.
 * - Student bookmark and application tracking records are permanently preserved.
 */

const Job = require('../../models/Job');

const GRACE_PERIOD_MISSES = 3;

/**
 * Reconciles listings for a specific source after a successful fetch run.
 * 
 * @param {string} companyName - Target company
 * @param {string} sourceType - Ingestion source type
 * @param {Array<string>} seenSourceJobIds - All sourceJobIds present in current fetch
 * @returns {Promise<{ activeCount: number, closedCount: number, expiredCount: number }>}
 */
async function reconcileMissingJobs(companyName, sourceType, seenSourceJobIds = []) {
    if (!companyName) return { activeCount: 0, closedCount: 0, expiredCount: 0 };

    const seenSet = new Set(seenSourceJobIds.map(String));

    // Find all currently Active jobs belonging to this company and source type
    const existingActiveJobs = await Job.find({
        companyName: new RegExp(`^${companyName.trim()}$`, 'i'),
        sourceType,
        status: 'Active'
    });

    let closedCount = 0;
    let expiredCount = 0;
    let activeCount = 0;

    for (const job of existingActiveJobs) {
        // If job was returned in current sync, it is actively verified
        if (job.sourceJobId && seenSet.has(String(job.sourceJobId))) {
            activeCount++;
            continue;
        }

        // Job was NOT seen in this successful sync
        const nextMissingCount = (job.consecutiveMissingCount || 0) + 1;
        job.consecutiveMissingCount = nextMissingCount;

        if (nextMissingCount >= GRACE_PERIOD_MISSES) {
            job.status = 'Closed';
            job.updatedAt = new Date();
            await job.save();
            closedCount++;
        } else {
            // Still in grace period
            job.updatedAt = new Date();
            await job.save();
            activeCount++;
        }
    }

    return {
        activeCount,
        closedCount,
        expiredCount
    };
}

/**
 * Runs a periodic pass across all active jobs checking published deadlines
 * @returns {Promise<{ expiredCount: number }>}
 */
async function checkDeadlines() {
    const now = new Date();
    const activeJobs = await Job.find({
        status: 'Active',
        deadline: { $ne: 'Open / Ongoing' }
    });

    let expiredCount = 0;
    for (const job of activeJobs) {
        if (!job.deadline) continue;
        const parsed = Date.parse(job.deadline);
        if (!isNaN(parsed) && parsed < now.getTime()) {
            job.status = 'Expired';
            job.updatedAt = now;
            await job.save();
            expiredCount++;
        }
    }

    return { expiredCount };
}

module.exports = {
    GRACE_PERIOD_MISSES,
    reconcileMissingJobs,
    checkDeadlines
};

