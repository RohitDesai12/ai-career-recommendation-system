/**
 * Career Compass - Automated Job Ingestion Scheduler
 * 
 * Periodically checks configured job sources and triggers synchronization for due sources.
 * Features:
 * - Mutex lock to prevent overlapping runs.
 * - Handles exponential backoff on consecutive failures.
 * - Singleton guard to prevent multiple scheduler instances across restarts.
 * - Runs completely decoupled from student HTTP requests.
 */

const JobSource = require('../../models/JobSource');
const { syncSource } = require('./ingestionService');
const { checkDeadlines } = require('./jobExpiryService');
const { initializeSourceRegistry } = require('./sourceRegistry');

class SchedulerService {
    constructor() {
        this.isRunning = false;
        this.timerId = null;
        this.checkIntervalMs = 60 * 1000; // Check every 60 seconds for due sources
        this.isInitialized = false;
    }

    /**
     * Starts the background scheduler singleton
     */
    async start() {
        if (this.timerId) {
            console.log('[SchedulerService] Background scheduler already active');
            return;
        }

        try {
            // Seed verified sources into database if empty
            await initializeSourceRegistry();
            this.isInitialized = true;
            console.log('[SchedulerService] Source registry initialized');
        } catch (err) {
            console.error('[SchedulerService] Error initializing source registry:', err.message);
        }

        console.log(`[SchedulerService] Starting periodic job sync loop (${this.checkIntervalMs / 1000}s check interval)`);
        
        // Immediate check on startup for any overdue sources
        this.runDueSyncs();

        // Recurring loop
        this.timerId = setInterval(() => {
            this.runDueSyncs();
        }, this.checkIntervalMs);
    }

    /**
     * Stops the background scheduler
     */
    stop() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
            console.log('[SchedulerService] Scheduler stopped');
        }
    }

    /**
     * Executes check for sources due for synchronization
     */
    async runDueSyncs() {
        if (this.isRunning) {
            console.log('[SchedulerService] Previous sync cycle still running; skipping tick');
            return;
        }

        this.isRunning = true;
        try {
            const now = new Date();

            // Run deadline expiration checks once per cycle
            try {
                await checkDeadlines();
            } catch (e) {
                console.error('[SchedulerService] Error running checkDeadlines:', e.message);
            }

            // Find all active sources where nextScheduledSync is null or <= now
            const dueSources = await JobSource.find({
                isActive: true,
                $or: [
                    { nextScheduledSync: null },
                    { nextScheduledSync: { $lte: now } }
                ]
            });

            if (dueSources.length === 0) {
                return;
            }

            console.log(`[SchedulerService] Found ${dueSources.length} sources due for synchronization`);

            for (const source of dueSources) {
                try {
                    // Exponential backoff check: if consecutive failures > 0, back off
                    if (source.failureCount > 0) {
                        const backoffMinutes = Math.min(60 * Math.pow(2, source.failureCount - 1), 720); // Cap at 12 hours
                        const lastAttempt = source.lastAttemptedSync ? new Date(source.lastAttemptedSync).getTime() : 0;
                        if (Date.now() - lastAttempt < backoffMinutes * 60000) {
                            console.log(`[SchedulerService] Skipping source '${source.sourceId}' due to backoff (${backoffMinutes}m)`);
                            continue;
                        }
                    }

                    console.log(`[SchedulerService] Ingesting due source '${source.sourceName}'...`);
                    const telemetry = await syncSource(source, 'SCHEDULED');
                    console.log(`[SchedulerService] Ingestion completed for '${source.sourceId}': Status=${telemetry.status}, Fetched=${telemetry.jobsFetched}, Accepted=${telemetry.jobsAccepted}`);
                } catch (sourceErr) {
                    console.error(`[SchedulerService] Error running sync for source '${source.sourceId}':`, sourceErr.message);
                }
            }
        } catch (loopErr) {
            console.error('[SchedulerService] Uncaught error in scheduler loop:', loopErr.message);
        } finally {
            this.isRunning = false;
        }
    }
}

// Export singleton instance
const schedulerInstance = new SchedulerService();
module.exports = schedulerInstance;

