const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');

const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

const {
    getResumeOverview,
    getMyResumes,
    getResumeById,
    createResume,
    updateResume,
    deleteResume,
    duplicateResume,
    parseResumeDocument,
    parseLinkedInProfile,
    getScoreHistory,
    recordScoreHistory,
    tailorResumeForJob,
    improveWithAI
} = require('../controllers/resumeController');

// All resume routes are protected by auth middleware
router.get('/overview', auth, getResumeOverview);
router.get('/my-resumes', auth, getMyResumes);
router.post('/', auth, createResume);
router.post('/save', auth, createResume);
router.post('/parse-document', auth, upload.single('file'), parseResumeDocument);
router.post('/parse-linkedin', auth, parseLinkedInProfile);
router.get('/score-history', auth, getScoreHistory);
router.post('/score-history', auth, recordScoreHistory);
router.post('/tailor', auth, tailorResumeForJob);
router.post('/improve-ai', auth, improveWithAI);
router.post('/improve-text', auth, improveWithAI);

// AI endpoint aliases
router.post('/ai/improve-bullet', auth, improveWithAI);
router.post('/ai/tailor', auth, tailorResumeForJob);

router.get('/:id', auth, getResumeById);
router.put('/:id', auth, updateResume);
router.delete('/:id', auth, deleteResume);
router.post('/duplicate/:id', auth, duplicateResume);

module.exports = router;
