const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getJobs,
    getRecommendedJobs,
    getJobById,
    getCompanies,
    getSavedJobs,
    saveJob,
    unsaveJob,
    getApplications,
    trackApplication,
    updateApplicationStatus,
    deleteApplication,
    getApplicationStats,
    getJobAlerts,
    createJobAlert,
    deleteJobAlert,
    toggleJobAlert
} = require('../controllers/jobsController');

// 1. Job Exploration & Discovery
router.get('/', getJobs);
router.get('/recommended', auth, getRecommendedJobs);
router.get('/companies', getCompanies);

// 2. Saved Jobs
router.get('/saved', auth, getSavedJobs);
router.post('/saved/:id', auth, saveJob);
router.delete('/saved/:id', auth, unsaveJob);

// 3. External Application Tracker
router.get('/applications', auth, getApplications);
router.get('/applications/stats', auth, getApplicationStats);
router.post('/applications', auth, trackApplication);
router.put('/applications/:id', auth, updateApplicationStatus);
router.delete('/applications/:id', auth, deleteApplication);

// 4. Job Alerts
router.get('/alerts', auth, getJobAlerts);
router.post('/alerts', auth, createJobAlert);
router.delete('/alerts/:id', auth, deleteJobAlert);
router.patch('/alerts/:id/toggle', auth, toggleJobAlert);

// 5. Job Details & Intelligence (Must be last to avoid route parameter collision)
router.get('/:id', getJobById);

module.exports = router;

