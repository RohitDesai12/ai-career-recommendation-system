const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    generateCoverLetter,
    getCoverLetters,
    getCoverLetterById,
    saveCoverLetter,
    updateCoverLetter,
    deleteCoverLetter
} = require('../controllers/coverLetterController');

// All Cover Letter routes require authentication
router.post('/generate', auth, generateCoverLetter);
router.get('/', auth, getCoverLetters);
router.post('/', auth, saveCoverLetter);
router.post('/save', auth, saveCoverLetter);
router.get('/:id', auth, getCoverLetterById);
router.put('/:id', auth, updateCoverLetter);
router.delete('/:id', auth, deleteCoverLetter);

module.exports = router;
