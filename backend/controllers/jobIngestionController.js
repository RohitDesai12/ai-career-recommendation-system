/**
 * Career Compass - Admin Job Ingestion Controller
 * 
 * Provides administrative oversight, telemetry, and manual triggers for automated job sources.
 * Strictly restricted to platform administrators (adminAuth).
 */

const JobSource = require('../models/JobSource');
const JobIngestionLog = require('../models/JobIngestionLog');
const Job = require('../models/Job');
const Company = require('../models/Company');
const { syncSource } = require('../services/job-ingestion/ingestionService');

// @desc    Get macro overview of job ingestion infrastructure
// @route   GET /api/admin/job-sources/overview
// @access  Admin
exports.getSourceOverview = async (req, res) => {
    try {
        const totalSources = await JobSource.countDocuments();
        const activeSources = await JobSource.countDocuments({ isActive: true });
        const disabledSources = totalSources - activeSources;
        const failedSources = await JobSource.countDocuments({ failureCount: { $gt: 0 } });
        const healthySources = await JobSource.countDocuments({ isActive: true, failureCount: 0 });

        const totalDiscoveredAgg = await JobSource.aggregate([
            { $group: { _id: null, total: { $sum: '$totalJobsDiscovered' }, active: { $sum: '$activeJobsCount' } } }
        ]);

        const lastLog = await JobIngestionLog.findOne().sort({ createdAt: -1 });

        return res.json({
            totalSources,
            activeSources,
            disabledSources,
            failedSources,
            healthySources,
            totalDiscovered: totalDiscoveredAgg[0]?.total || 0,
            activeJobs: totalDiscoveredAgg[0]?.active || 0,
            lastSyncTime: lastLog ? lastLog.createdAt : null,
            lastSyncStatus: lastLog ? lastLog.status : 'NONE'
        });
    } catch (err) {
        console.error('Error in getSourceOverview:', err);
        return res.status(500).json({ msg: 'Server error retrieving source overview' });
    }
};

// @desc    Get all configured job sources
// @route   GET /api/admin/job-sources
// @access  Admin
exports.getAllSources = async (req, res) => {
    try {
        const sources = await JobSource.find().sort({ companyName: 1 });
        return res.json({ sources });
    } catch (err) {
        console.error('Error in getAllSources:', err);
        return res.status(500).json({ msg: 'Server error retrieving sources' });
    }
};

// @desc    Create or configure a new Job Source
// @route   POST /api/admin/job-sources
// @access  Admin
exports.createSource = async (req, res) => {
    try {
        const {
            sourceId,
            sourceName,
            sourceType,
            companyName,
            boardToken,
            feedUrl,
            syncFrequencyMinutes = 360
        } = req.body;

        if (!sourceId || !sourceName || !sourceType || !companyName) {
            return res.status(400).json({ msg: 'sourceId, sourceName, sourceType, and companyName are required' });
        }

        const validTypes = ['ATS_GREENHOUSE', 'ATS_LEVER', 'JSON_FEED'];
        if (!validTypes.includes(sourceType)) {
            return res.status(400).json({ msg: `Invalid sourceType. Supported: ${validTypes.join(', ')}` });
        }

        const existing = await JobSource.findOne({ sourceId: sourceId.trim() });
        if (existing) {
            return res.status(400).json({ msg: `Source with ID '${sourceId}' already exists` });
        }

        const newSource = await JobSource.create({
            sourceId: sourceId.trim(),
            sourceName: sourceName.trim(),
            sourceType,
            companyName: companyName.trim(),
            boardToken: boardToken ? boardToken.trim() : '',
            feedUrl: feedUrl ? feedUrl.trim() : '',
            syncFrequencyMinutes: Number(syncFrequencyMinutes) || 360,
            isActive: true
        });

        return res.status(201).json({ msg: 'Job source created successfully', source: newSource });
    } catch (err) {
        console.error('Error in createSource:', err);
        return res.status(500).json({ msg: 'Server error creating job source' });
    }
};

// @desc    Toggle Job Source active state
// @route   PATCH /api/admin/job-sources/:id/toggle
// @access  Admin
exports.toggleSource = async (req, res) => {
    try {
        const source = await JobSource.findOne({ sourceId: req.params.id });
        if (!source) {
            return res.status(404).json({ msg: 'Job source not found' });
        }

        source.isActive = !source.isActive;
        source.updatedAt = new Date();
        await source.save();

        return res.json({ msg: `Source is now ${source.isActive ? 'Active' : 'Disabled'}`, source });
    } catch (err) {
        console.error('Error in toggleSource:', err);
        return res.status(500).json({ msg: 'Server error toggling source' });
    }
};

// @desc    Trigger manual on-demand sync for a source
// @route   POST /api/admin/job-sources/:id/sync
// @access  Admin
exports.triggerManualSync = async (req, res) => {
    try {
        const source = await JobSource.findOne({ sourceId: req.params.id });
        if (!source) {
            return res.status(404).json({ msg: 'Job source not found' });
        }

        const telemetry = await syncSource(source, 'MANUAL');
        return res.json({ msg: 'Manual synchronization completed', telemetry });
    } catch (err) {
        console.error('Error in triggerManualSync:', err);
        return res.status(500).json({ msg: 'Server error executing manual synchronization', error: err.message });
    }
};

// @desc    Get Ingestion History Audit Logs
// @route   GET /api/admin/job-sources/logs
// @access  Admin
exports.getIngestionLogs = async (req, res) => {
    try {
        const { sourceId, status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (sourceId) query.sourceId = sourceId;
        if (status) query.status = status;

        const p = Math.max(1, parseInt(page, 10));
        const l = Math.min(100, Math.max(1, parseInt(limit, 10)));
        const skip = (p - 1) * l;

        const total = await JobIngestionLog.countDocuments(query);
        const logs = await JobIngestionLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(l);

        return res.json({
            total,
            page: p,
            totalPages: Math.ceil(total / l),
            logs
        });
    } catch (err) {
        console.error('Error in getIngestionLogs:', err);
        return res.status(500).json({ msg: 'Server error retrieving ingestion logs' });
    }
};

// @desc    Get Job Data Quality Telemetry
// @route   GET /api/admin/job-sources/quality
// @access  Admin
exports.getDataQualityStats = async (req, res) => {
    try {
        const activeJobs = await Job.countDocuments({ status: 'Active' });
        const expiredJobs = await Job.countDocuments({ status: 'Expired' });
        const closedJobs = await Job.countDocuments({ status: 'Closed' });
        const pendingJobs = await Job.countDocuments({ status: 'Pending' });

        const verifiedJobs = await Job.countDocuments({ verificationStatus: 'Verified' });
        const underReviewJobs = await Job.countDocuments({ verificationStatus: 'Under Review' });
        const unverifiedJobs = await Job.countDocuments({ verificationStatus: 'Unverified' });

        // Quality Classification counts
        const highQuality = await Job.countDocuments({ dataQualityStatus: 'High Quality' });
        const acceptable = await Job.countDocuments({ dataQualityStatus: 'Acceptable' });
        const needsReview = await Job.countDocuments({ dataQualityStatus: 'Needs Review' });
        const invalid = await Job.countDocuments({ dataQualityStatus: 'Invalid' });

        const sourceBreakdown = await Job.aggregate([
            { $group: { _id: '$sourceType', count: { $sum: 1 } } }
        ]);

        const categoryBreakdown = await Job.aggregate([
            { $match: { status: 'Active' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]);

        const companyBreakdown = await Job.aggregate([
            { $match: { status: 'Active' } },
            { $group: { _id: '$companyName', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]);

        return res.json({
            statusCounts: {
                active: activeJobs,
                expired: expiredJobs,
                closed: closedJobs,
                pending: pendingJobs
            },
            verificationCounts: {
                verified: verifiedJobs,
                underReview: underReviewJobs,
                unverified: unverifiedJobs
            },
            qualityCounts: {
                highQuality,
                acceptable,
                needsReview,
                invalid
            },
            sourceBreakdown: sourceBreakdown.map(s => ({
                sourceType: s._id || 'MANUAL_SEED',
                count: s.count
            })),
            categoryBreakdown: categoryBreakdown.map(c => ({
                category: c._id || 'Engineering',
                count: c.count
            })),
            companyBreakdown: companyBreakdown.map(c => ({
                company: c._id,
                count: c.count
            }))
        });
    } catch (err) {
        console.error('Error in getDataQualityStats:', err);
        return res.status(500).json({ msg: 'Server error retrieving data quality stats' });
    }
};

// @desc    Get Jobs for Quality Review
// @route   GET /api/admin/job-sources/review-jobs
// @access  Admin
exports.getReviewJobs = async (req, res) => {
    try {
        const { status = 'Needs Review', page = 1, limit = 20 } = req.query;
        const p = Math.max(1, parseInt(page, 10));
        const l = Math.min(100, Math.max(1, parseInt(limit, 10)));
        const skip = (p - 1) * l;

        const query = status === 'All' ? {} : { dataQualityStatus: status };
        const total = await Job.countDocuments(query);
        const jobs = await Job.find(query)
            .sort({ lastQualityCheck: -1, createdAt: -1 })
            .skip(skip)
            .limit(l)
            .lean();

        return res.json({
            total,
            page: p,
            totalPages: Math.ceil(total / l),
            jobs
        });
    } catch (err) {
        console.error('Error in getReviewJobs:', err);
        return res.status(500).json({ msg: 'Server error retrieving review jobs' });
    }
};

// @desc    Update Job Quality Status
// @route   PATCH /api/admin/job-sources/jobs/:id/quality-status
// @access  Admin
exports.updateJobQualityStatus = async (req, res) => {
    try {
        const { dataQualityStatus } = req.body;
        const valid = ['High Quality', 'Acceptable', 'Needs Review', 'Invalid'];
        if (!valid.includes(dataQualityStatus)) {
            return res.status(400).json({ msg: 'Invalid quality status value' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        job.dataQualityStatus = dataQualityStatus;
        job.lastQualityCheck = new Date();
        await job.save();

        return res.json({ msg: `Job quality status updated to ${dataQualityStatus}`, job });
    } catch (err) {
        console.error('Error in updateJobQualityStatus:', err);
        return res.status(500).json({ msg: 'Server error updating job quality status' });
    }
};

