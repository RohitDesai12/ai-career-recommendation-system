const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
    getSourceOverview,
    getAllSources,
    createSource,
    toggleSource,
    triggerManualSync,
    getIngestionLogs,
    getDataQualityStats,
    getReviewJobs,
    updateJobQualityStatus
} = require('../controllers/jobIngestionController');

// All endpoints in this router are strictly admin protected
router.use(adminAuth);

// 1. Overview & Data Quality
router.get('/overview', getSourceOverview);
router.get('/quality', getDataQualityStats);
router.get('/review-jobs', getReviewJobs);
router.patch('/jobs/:id/quality-status', updateJobQualityStatus);

// 2. Source Configuration & Management
router.get('/', getAllSources);
router.post('/', createSource);
router.patch('/:id/toggle', toggleSource);
router.post('/:id/sync', triggerManualSync);

// 3. Ingestion Logs
router.get('/logs', getIngestionLogs);

module.exports = router;

