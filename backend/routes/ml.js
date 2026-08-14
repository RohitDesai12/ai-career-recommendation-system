const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');
const multer = require('multer');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const upload = multer();

// @desc    Forward assessment to ML service
// @route   POST /api/ml/assess
// @access  Private
router.post('/assess', auth, async (req, res) => {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/api/assess`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('Error contacting ML service', err.message);
        res.status(500).send('ML Service Error');
    }
});

// @desc    Forward recommendation request to ML service
// @route   POST /api/ml/recommend
// @access  Private
router.post('/recommend', auth, async (req, res) => {
    try {
        const response = await axios.post(`${ML_SERVICE_URL}/api/recommend`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('Error contacting ML service', err.message);
        res.status(500).send('ML Service Error');
    }
});

// @desc    Forward resume analysis to ML service
// @route   POST /api/ml/analyze-resume
// @access  Private
router.post('/analyze-resume', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { branch, jobRole } = req.body;

        // Construct standard FormData and Blob using Node 18+ globals
        const formData = new FormData();
        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append('file', fileBlob, req.file.originalname);
        formData.append('branch', branch || '');
        formData.append('jobRole', jobRole || '');

        const response = await axios.post(`${ML_SERVICE_URL}/api/analyze-resume`, formData);
        res.json(response.data);
    } catch (err) {
        console.error('Error contacting ML service during resume analysis', err.message);
        res.status(500).send('ML Service Error');
    }
});

module.exports = router;
