/**
 * Career Compass - Safe Database Job Upsert Service
 * 
 * Safely inserts new job records and updates existing ones while preserving
 * existing MongoDB _id values, SavedJob relationships, and JobApplication tracking records.
 */

const Job = require('../../models/Job');
const Company = require('../../models/Company');
const { findExistingJob } = require('./duplicateDetector');
const { evaluateJobQuality } = require('./jobQualityService');

/**
 * Upserts a normalized job record into the database
 * 
 * @param {Object} normalizedJob - Validated and normalized job data
 * @returns {Promise<{ action: 'CREATED'|'UPDATED'|'REJECTED', job: Object, error?: string }>}
 */
async function upsertJob(normalizedJob) {
    try {
        // Link with Company record if exists in database
        let companyDoc = null;
        if (normalizedJob.companyName) {
            companyDoc = await Company.findOne({
                companyName: new RegExp(`^${normalizedJob.companyName.trim()}$`, 'i')
            });
        }

        const existingJob = await findExistingJob(normalizedJob);

        if (existingJob) {
            // Update source-controlled fields while preserving _id, student bookmarks, applications
            existingJob.title = normalizedJob.title;
            existingJob.department = normalizedJob.department || existingJob.department;
            existingJob.category = normalizedJob.category || existingJob.category;
            existingJob.location = normalizedJob.location;
            existingJob.workMode = normalizedJob.workMode;
            existingJob.type = normalizedJob.type;
            existingJob.experience = normalizedJob.experience;
            existingJob.freshersEligible = normalizedJob.freshersEligible;
            existingJob.description = normalizedJob.description;
            existingJob.officialApplyUrl = normalizedJob.officialApplyUrl;
            existingJob.externalApplyUrl = normalizedJob.officialApplyUrl;
            existingJob.sourceName = normalizedJob.sourceName;
            existingJob.sourceUrl = normalizedJob.officialApplyUrl;
            existingJob.sourceType = normalizedJob.sourceType;
            existingJob.sourceJobId = normalizedJob.sourceJobId;
            
            // If the job was previously marked Closed or Under Review, it is confirmed alive now
            if (existingJob.status === 'Closed' || existingJob.status === 'Pending') {
                existingJob.status = 'Active';
            }

            // Refresh verification and freshness timestamps
            existingJob.lastSeenAt = new Date();
            existingJob.lastVerifiedDate = new Date();
            existingJob.consecutiveMissingCount = 0;
            existingJob.updatedAt = new Date();

            if (normalizedJob.skills && normalizedJob.skills.length > 0) {
                // Merge unique skills
                const mergedSkills = Array.from(new Set([...(existingJob.skills || []), ...normalizedJob.skills]));
                existingJob.skills = mergedSkills;
            }

            if (companyDoc && !existingJob.company) {
                existingJob.company = companyDoc._id;
            }

            // Stamped with Data Quality assessment
            const qualityEval = evaluateJobQuality(existingJob);
            existingJob.dataQualityStatus = qualityEval.status;
            existingJob.validationErrors = qualityEval.errors;
            existingJob.qualityDetails = qualityEval.details;
            existingJob.lastQualityCheck = new Date();

            await existingJob.save();

            return {
                action: 'UPDATED',
                job: existingJob
            };
        }

        // Stamped with Data Quality assessment for new job
        const qualityEval = evaluateJobQuality(normalizedJob);

        // Create a new Job record
        const newJobData = {
            ...normalizedJob,
            company: companyDoc ? companyDoc._id : undefined,
            dataQualityStatus: qualityEval.status,
            validationErrors: qualityEval.errors,
            qualityDetails: qualityEval.details,
            lastQualityCheck: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            firstSeenAt: new Date(),
            lastSeenAt: new Date(),
            lastVerifiedDate: new Date(),
            consecutiveMissingCount: 0,
            status: 'Active'
        };

        const createdJob = await Job.create(newJobData);

        return {
            action: 'CREATED',
            job: createdJob
        };
    } catch (err) {
        return {
            action: 'REJECTED',
            error: err.message
        };
    }
}

module.exports = {
    upsertJob
};

