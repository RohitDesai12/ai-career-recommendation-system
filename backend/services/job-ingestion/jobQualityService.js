/**
 * Career Compass - Advanced Job Data Quality Intelligence Service
 * 
 * Evaluates job opportunity data quality against deterministic rules:
 * - High Quality: Complete details, rich description, explicit skills, clear location, valid URL.
 * - Acceptable: Valid title, company, URL, and adequate description.
 * - Needs Review: Minimal description, zero skills, or missing critical fields.
 * - Invalid: Malformed URL, missing title, or missing company name.
 */

const { isValidUrl } = require('./jobValidator');

/**
 * Evaluates a job listing against strict deterministic data quality rules
 * @param {Object} job - Job record
 * @returns {{
 *   status: 'High Quality'|'Acceptable'|'Needs Review'|'Invalid',
 *   errors: string[],
 *   details: Object,
 *   score: number
 * }}
 */
function evaluateJobQuality(job = {}) {
    const errors = [];
    let score = 0;

    const hasTitle = Boolean(job.title && typeof job.title === 'string' && job.title.trim().length >= 2);
    const hasCompany = Boolean(job.companyName && typeof job.companyName === 'string' && job.companyName.trim().length >= 2);
    const hasValidUrl = Boolean(job.officialApplyUrl && isValidUrl(job.officialApplyUrl));
    
    const descText = (job.description || '').trim();
    const descLen = descText.length;
    const hasDescription = descLen >= 40;
    const isRichDescription = descLen >= 200;

    const skillsCount = Array.isArray(job.skills) ? job.skills.length : 0;
    const hasSkills = skillsCount > 0;
    const hasMultipleSkills = skillsCount >= 2;

    const locStr = (job.location || '').trim().toLowerCase();
    const hasLocation = Boolean(locStr && locStr !== 'unknown' && locStr !== 'unspecified');

    const hasExperience = Boolean(job.experience && job.experience !== 'Unspecified');
    const hasWorkMode = Boolean(job.workMode && ['Remote', 'Hybrid', 'On-site'].includes(job.workMode));

    // Rule 1: Fatal criteria -> Invalid
    if (!hasTitle) errors.push('Missing or invalid job title.');
    if (!hasCompany) errors.push('Missing or invalid company name.');
    if (!hasValidUrl) errors.push('Missing or invalid official application URL.');

    if (!hasTitle || !hasCompany || !hasValidUrl) {
        return {
            status: 'Invalid',
            errors,
            details: {
                hasTitle,
                hasCompany,
                hasDescription,
                hasValidUrl,
                hasSkills,
                hasLocation,
                hasExperience,
                qualityScore: 10
            },
            score: 10
        };
    }

    // Baseline points for passing fatal checks
    score = 50;

    // Rule 2: Content quality bonuses
    if (isRichDescription) {
        score += 15;
    } else if (hasDescription) {
        score += 8;
    } else {
        errors.push('Description is very short or missing detail.');
    }

    if (hasMultipleSkills) {
        score += 15;
    } else if (hasSkills) {
        score += 8;
    } else {
        errors.push('No recognized technical skills found in listing.');
    }

    if (hasLocation) {
        score += 10;
    } else {
        errors.push('Location is unspecified.');
    }

    if (hasExperience) score += 5;
    if (hasWorkMode) score += 5;

    // Classification mapping
    let status = 'Acceptable';
    if (score >= 80 && errors.length === 0) {
        status = 'High Quality';
    } else if (score < 60 || !hasDescription) {
        status = 'Needs Review';
    } else {
        status = 'Acceptable';
    }

    return {
        status,
        errors,
        details: {
            hasTitle,
            hasCompany,
            hasDescription,
            hasValidUrl,
            hasSkills,
            hasLocation,
            hasExperience,
            qualityScore: score
        },
        score
    };
}

module.exports = {
    evaluateJobQuality
};

