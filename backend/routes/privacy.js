const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { getJwtSecret } = require('../config/jwt');
const {
    submitContactRequest,
    recordConsent,
    getConsentStatus,
    exportStudentData,
    deleteStudentAccount,
    getAdminPrivacyRequests,
    updatePrivacyRequestStatus
} = require('../controllers/privacyController');

// Optional auth helper for public endpoints
const optionalAuth = (req, res, next) => {
    let token = req.header('x-auth-token');
    if (!token) {
        const authHeader = req.header('Authorization') || req.header('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (authHeader) {
            token = authHeader;
        }
    }
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const secret = getJwtSecret();
            const decoded = jwt.verify(token, secret);
            req.user = decoded.user || decoded;
        } catch (e) {
            // Ignore token error for optional auth
        }
    }
    next();
};

// Public / User endpoints
router.post('/contact', optionalAuth, submitContactRequest);
router.post('/consent', optionalAuth, recordConsent);
router.get('/consent', auth, getConsentStatus);

// Student Privacy & Data Rights
router.get('/export-data', auth, exportStudentData);
router.post('/delete-account', auth, deleteStudentAccount);

// Admin Moderation & Privacy Operations
router.get('/admin/requests', adminAuth, getAdminPrivacyRequests);
router.put('/admin/requests/:id', adminAuth, updatePrivacyRequestStatus);

module.exports = router;

