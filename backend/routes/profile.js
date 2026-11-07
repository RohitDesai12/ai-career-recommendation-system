const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getMyProfile,
    updateProfile,
    generateAISummary,
    getPublicProfile,
    toggleSaveCourse,
    getStudentActivities,
    recordStudentActivity,
    getNotifications
} = require('../controllers/profileController');

// Authenticated Student Profile
router.get('/me', auth, getMyProfile);
router.put('/', auth, updateProfile);
router.post('/generate-summary', auth, generateAISummary);

// Public Student Portfolio (No login required)
router.get('/public/:id', getPublicProfile);

// Legacy and Activity routes
router.put('/save-course', auth, toggleSaveCourse);
router.get('/activities', auth, getStudentActivities);
router.post('/activities', auth, recordStudentActivity);
router.get('/notifications', auth, getNotifications);

module.exports = router;
