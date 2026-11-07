const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getPublicJobs,
    applyForJob,
    getStudentApplications
} = require('../controllers/employerController');

// =========================================================================
// ACTIVE STUDENT & SHARED JOB DISCOVERY ENDPOINTS (PRESERVED)
// =========================================================================

// @route   GET /api/employer/public-jobs
// @desc    Get all active public jobs for students
// @access  Public
router.get('/public-jobs', getPublicJobs);

// @route   POST /api/employer/apply
// @desc    Apply for a job (Student side)
// @access  Public / Student
router.post('/apply', applyForJob);

// @route   GET /api/employer/my-applications
// @desc    Get Student's submitted applications
// @access  Private (Student)
router.get('/my-applications', auth, getStudentApplications);

// =========================================================================
// DECOMMISSIONED RECRUITER PORTAL ENDPOINTS
// =========================================================================
const decommissionedHandler = (req, res) => {
    return res.status(410).json({
        msg: 'The Recruiter Portal and recruiter-related functionality have been discontinued.'
    });
};

router.use('/register', decommissionedHandler);
router.use('/login', decommissionedHandler);
router.use('/dashboard', decommissionedHandler);
router.use('/jobs', decommissionedHandler);
router.use('/applicants', decommissionedHandler);
router.use('/profile', decommissionedHandler);
router.use('/recommendations', decommissionedHandler);
router.use('/analytics', decommissionedHandler);
router.use('/messages', decommissionedHandler);
router.use('/notifications', decommissionedHandler);
router.use('/billing', decommissionedHandler);
router.use('/settings', decommissionedHandler);
router.use('/account', decommissionedHandler);

module.exports = router;
