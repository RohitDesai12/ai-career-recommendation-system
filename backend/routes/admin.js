const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');
const {
    getAdminDashboard,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getAllCompanies,
    updateCompanyStatus,
    getAllJobs,
    updateJobStatus,
    deleteJob,
    getAllApplications,
    getJobAlertStats,
    createJobAlert,
    getContentManagement,
    createContentItem,
    deleteContentItem,
    createAdminResource,
    updateAdminResource,
    deleteAdminResource,
    getAIStats,
    getPlatformAnalytics,
    getReports,
    createReport,
    resolveReport,
    getAuditLogs,
    getSystemHealth,
    getAdminSettings,
    updateAdminSettings
} = require('../controllers/adminController');

// 1. Dashboard Overview
router.get('/dashboard', adminAuth, getAdminDashboard);

// 2. User Management
router.get('/users', adminAuth, getAllUsers);
router.put('/users/:id/status', adminAuth, updateUserStatus);
router.delete('/users/:id', adminAuth, deleteUser);

// 3. Company Management
router.get('/companies', adminAuth, getAllCompanies);
router.put('/companies/:id/status', adminAuth, updateCompanyStatus);

// 4. Job Approval & Management
router.get('/jobs', adminAuth, getAllJobs);
router.put('/jobs/:id/status', adminAuth, updateJobStatus);
router.delete('/jobs/:id', adminAuth, deleteJob);

// 5. Application Monitoring
router.get('/applications', adminAuth, getAllApplications);

// 6. Job Alert Telemetry & Rules
router.get('/job-alerts', adminAuth, getJobAlertStats);
router.post('/job-alerts', adminAuth, createJobAlert);

// 7. Content Management (Interview Preps, Skills, Courses, Learning Resources)
router.get('/content', adminAuth, getContentManagement);
router.post('/content', adminAuth, createContentItem);
router.delete('/content/:id', adminAuth, deleteContentItem);

router.post('/resources', adminAuth, createAdminResource);
router.put('/resources/:id', adminAuth, updateAdminResource);
router.delete('/resources/:id', adminAuth, deleteAdminResource);

// 8. AI & Recommendation Telemetry
router.get('/ai-stats', adminAuth, getAIStats);

// 9. Platform Reports & Analytics
router.get('/analytics', adminAuth, getPlatformAnalytics);

// 10. Moderation & Reports System (Public submission allowed with optional auth; resolution requires adminAuth)
router.post('/reports', auth, createReport);
router.get('/reports', adminAuth, getReports);
router.put('/reports/:id', adminAuth, resolveReport);

// 11. Audit Logs
router.get('/audit-logs', adminAuth, getAuditLogs);

// 12. System Health
router.get('/system-health', adminAuth, getSystemHealth);

// 13. Admin Settings
router.get('/settings', adminAuth, getAdminSettings);
router.put('/settings', adminAuth, updateAdminSettings);

module.exports = router;
