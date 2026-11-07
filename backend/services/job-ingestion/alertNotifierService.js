/**
 * Career Compass - Smart Job Alert Matching & Notification Service
 * 
 * Evaluates newly ingested or updated jobs against active student JobAlerts:
 * - Matches on role, company, skills, location, workMode, and minMatchScore.
 * - Prevents duplicate notifications by tracking notifiedJobIds.
 * - Generates persistent Notification records in MongoDB for the student.
 * - Updates JobAlert telemetry.
 */

const JobAlert = require('../../models/JobAlert');
const Notification = require('../../models/Notification');
const Profile = require('../../models/Profile');
const { calculateJobMatch } = require('../matchingEngine');

/**
 * Checks if a job matches an alert's query criteria
 */
function isJobMatchingAlert(job, alert) {
    // 1. Role match
    if (alert.role && alert.role.trim() && alert.role.toLowerCase() !== 'all') {
        const role = alert.role.trim().toLowerCase();
        const title = (job.title || '').toLowerCase();
        const category = (job.category || '').toLowerCase();
        if (!title.includes(role) && !category.includes(role)) return false;
    }

    // 2. Company match
    if (alert.company && alert.company.trim() && alert.company.toLowerCase() !== 'all') {
        const comp = alert.company.trim().toLowerCase();
        const jComp = (job.companyName || '').toLowerCase();
        if (!jComp.includes(comp)) return false;
    }

    // 3. Location match
    if (alert.location && alert.location !== 'Any' && alert.location !== 'All') {
        const loc = alert.location.trim().toLowerCase();
        const jLoc = (job.location || '').toLowerCase();
        const jMode = (job.workMode || '').toLowerCase();
        if (!jLoc.includes(loc) && !jMode.includes(loc) && jMode !== 'remote') return false;
    }

    // 3b. GeoScope match
    if (alert.geoScope && alert.geoScope !== 'All') {
        const gs = alert.geoScope.toLowerCase();
        if (gs === 'india') {
            const isIndiaJob = job.locationType === 'Domestic' || job.country === 'India' || job.remoteEligibility === 'India Eligible';
            if (!isIndiaJob) return false;
        } else if (gs === 'international') {
            const isIntlJob = job.locationType === 'International' || (job.country && job.country !== 'India');
            if (!isIntlJob) return false;
        } else if (gs === 'remote worldwide' || gs === 'remote') {
            const isRemote = job.workMode === 'Remote' || job.locationType === 'Remote_Worldwide' || job.locationType === 'Remote_Country_Specific';
            if (!isRemote) return false;
        }
    }

    // 3c. Target Country match
    if (alert.targetCountry && alert.targetCountry.trim()) {
        const tc = alert.targetCountry.trim().toLowerCase();
        const jc = (job.country || '').toLowerCase();
        if (!jc.includes(tc)) return false;
    }

    // 3d. Target City match
    if (alert.targetCity && alert.targetCity.trim()) {
        const tcity = alert.targetCity.trim().toLowerCase();
        const jcity = (job.city || '').toLowerCase();
        if (!jcity.includes(tcity)) return false;
    }

    // 3e. Visa Sponsorship match
    if (alert.visaSponsorshipOnly && job.visaSponsorship !== 'Available') {
        return false;
    }

    // 4. Work Mode match
    if (alert.workMode && alert.workMode !== 'All') {
        if ((job.workMode || '').toLowerCase() !== alert.workMode.toLowerCase()) return false;
    }

    // 5. Job Type match
    if (alert.jobType && alert.jobType !== 'All') {
        if ((job.type || '').toLowerCase() !== alert.jobType.toLowerCase()) return false;
    }

    // 6. Freshers Only match
    if (alert.freshersOnly && job.freshersEligible === false) {
        return false;
    }

    // 7. Skills match (if specified in alert)
    if (Array.isArray(alert.skills) && alert.skills.length > 0) {
        const jobSkills = (job.skills || []).map(s => s.toLowerCase());
        const hasSkillOverlap = alert.skills.some(as => jobSkills.includes(as.toLowerCase()));
        if (!hasSkillOverlap) return false;
    }

    return true;
}

/**
 * Evaluates a newly created or active job against all active alerts
 * @param {Object} job - Active Job document
 * @returns {Promise<{ alertsTriggered: number }>}
 */
async function processAlertsForJob(job) {
    if (!job || job.status !== 'Active') return { alertsTriggered: 0 };

    try {
        const activeAlerts = await JobAlert.find({ isActive: true });
        let alertsTriggered = 0;

        for (const alert of activeAlerts) {
            // Check if alert already notified for this job
            const seenJob = (alert.notifiedJobIds || []).some(
                id => String(id) === String(job._id)
            );
            if (seenJob) continue;

            // Check criteria match
            if (!isJobMatchingAlert(job, alert)) continue;

            // Fetch student profile to evaluate personalized score threshold
            const studentProfile = await Profile.findOne({ user: alert.user }).lean();
            const matchInfo = calculateJobMatch(studentProfile || {}, job);

            const minThreshold = alert.minMatchScore || 60;
            if (matchInfo.matchScore < minThreshold) continue;

            // Create In-App Notification
            await Notification.create({
                user: alert.user,
                title: `New Job Opportunity: ${job.title} at ${job.companyName}`,
                message: `Discovered a new ${job.type} role matching your "${alert.title}" alert (${matchInfo.matchScore}% Match).`,
                category: 'job',
                link: `/jobs?tab=explore&search=${encodeURIComponent(job.title)}`,
                read: false,
                createdAt: new Date()
            });

            // Update Alert record telemetry
            alert.notifiedJobIds.push(job._id);
            alert.triggeredCount = (alert.triggeredCount || 0) + 1;
            alert.notificationsSent = (alert.notificationsSent || 0) + 1;
            alert.lastTriggeredAt = new Date();
            await alert.save();

            alertsTriggered++;
        }

        return { alertsTriggered };
    } catch (err) {
        console.error('Error processing alerts for job:', err.message);
        return { alertsTriggered: 0 };
    }
}

/**
 * Process a batch of jobs for alerts
 * @param {Array<Object>} jobs 
 */
async function processAlertsForJobBatch(jobs = []) {
    let totalTriggered = 0;
    for (const job of jobs) {
        const res = await processAlertsForJob(job);
        totalTriggered += res.alertsTriggered;
    }
    return totalTriggered;
}

module.exports = {
    isJobMatchingAlert,
    processAlertsForJob,
    processAlertsForJobBatch
};

