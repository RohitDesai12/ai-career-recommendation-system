/**
 * Career Compass - Multi-Factor Duplicate Detector
 * 
 * Accurately determines if an incoming job record already exists in the database
 * or in the current ingestion batch using multi-factor heuristics.
 */

const Job = require('../../models/Job');

/**
 * Normalizes title string for duplicate comparison
 */
function normalizeTitleForComparison(title = '') {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Normalizes URL by stripping trailing slashes, query parameters like utm_*, etc.
 */
function canonicalizeUrl(url = '') {
    if (!url || typeof url !== 'string') return '';
    try {
        const parsed = new URL(url);
        // Retain pathname without trailing slash
        const pathname = parsed.pathname.replace(/\/+$/, '');
        return `${parsed.protocol}//${parsed.host}${pathname}`;
    } catch (_) {
        return url.trim().toLowerCase();
    }
}

/**
 * Finds an existing job in the database that matches the incoming normalized job
 * @param {Object} job - Normalized job candidate
 * @returns {Promise<Object|null>} Matching Job document or null
 */
async function findExistingJob(job) {
    // Factor 1: Primary match on sourceJobId + companyName
    if (job.sourceJobId && job.companyName) {
        const matchBySource = await Job.findOne({
            sourceJobId: job.sourceJobId,
            companyName: new RegExp(`^${job.companyName.trim()}$`, 'i')
        });
        if (matchBySource) return matchBySource;
    }

    // Factor 2: Secondary match on exact officialApplyUrl
    if (job.officialApplyUrl) {
        const canonical = canonicalizeUrl(job.officialApplyUrl);
        const matchByUrl = await Job.findOne({
            $or: [
                { officialApplyUrl: job.officialApplyUrl },
                { officialApplyUrl: canonical },
                { externalApplyUrl: job.officialApplyUrl },
                { sourceUrl: job.officialApplyUrl }
            ]
        });
        if (matchByUrl) return matchByUrl;
    }

    // Factor 3: Tertiary match on companyName + normalized title + location prefix
    if (job.companyName && job.title) {
        const cleanTitle = normalizeTitleForComparison(job.title);
        // Find potential company candidates
        const candidates = await Job.find({
            companyName: new RegExp(`^${job.companyName.trim()}$`, 'i'),
            status: { $in: ['Active', 'Pending', 'Closed'] }
        }).select('_id title location status officialApplyUrl');

        for (const candidate of candidates) {
            const candTitle = normalizeTitleForComparison(candidate.title);
            if (candTitle === cleanTitle) {
                // If location matches or one is Remote
                const locA = (candidate.location || '').toLowerCase();
                const locB = (job.location || '').toLowerCase();
                if (locA === locB || locA.includes('remote') || locB.includes('remote')) {
                    return candidate;
                }
            }
        }
    }

    return null;
}

/**
 * In-memory batch duplicate detection to prevent duplicate entries inside a single payload
 */
class IngestBatchTracker {
    constructor() {
        this.seenSourceIds = new Set();
        this.seenUrls = new Set();
    }

    isDuplicateInBatch(job) {
        const sourceKey = `${job.companyName}_${job.sourceJobId}`;
        const urlKey = canonicalizeUrl(job.officialApplyUrl);

        if (this.seenSourceIds.has(sourceKey)) {
            return true;
        }
        if (urlKey && this.seenUrls.has(urlKey)) {
            return true;
        }

        this.seenSourceIds.add(sourceKey);
        if (urlKey) this.seenUrls.add(urlKey);
        return false;
    }
}

module.exports = {
    findExistingJob,
    canonicalizeUrl,
    normalizeTitleForComparison,
    IngestBatchTracker
};

