/**
 * Career Compass - Job Ingestion Validator
 * 
 * Verifies that incoming normalized jobs meet strict quality and safety thresholds.
 * Malformed or insecure records are rejected with descriptive reasons.
 */

function isValidUrl(string) {
    if (!string || typeof string !== 'string') return false;
    try {
        const parsed = new URL(string);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

/**
 * Validates a normalized job object
 * @param {Object} job 
 * @returns {{ isValid: boolean, error?: string }}
 */
function validateJob(job) {
    if (!job || typeof job !== 'object') {
        return { isValid: false, error: 'Job payload is null or not an object' };
    }

    if (!job.title || typeof job.title !== 'string' || job.title.trim().length < 2) {
        return { isValid: false, error: 'Job title is missing or too short' };
    }

    if (!job.companyName || typeof job.companyName !== 'string' || job.companyName.trim().length < 2) {
        return { isValid: false, error: 'Company name is missing or too short' };
    }

    if (!job.sourceJobId || typeof job.sourceJobId !== 'string' || job.sourceJobId.trim().length === 0) {
        return { isValid: false, error: 'Source job ID is missing' };
    }

    if (!job.officialApplyUrl || !isValidUrl(job.officialApplyUrl)) {
        return { isValid: false, error: `Invalid official application URL: ${job.officialApplyUrl}` };
    }

    // Ensure valid status enum
    const validStatuses = ['Active', 'Pending', 'Closed', 'Expired'];
    if (job.status && !validStatuses.includes(job.status)) {
        return { isValid: false, error: `Invalid job status: ${job.status}` };
    }

    return { isValid: true };
}

module.exports = {
    isValidUrl,
    validateJob
};

