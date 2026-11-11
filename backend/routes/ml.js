const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt');
const { getMlServiceUrl } = require('../config/mlConfig');

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
            const secret = getJwtSecret();
            const decoded = jwt.verify(token, secret);
            req.user = decoded.user || decoded;
        } catch (err) {
            // Proceed without blocking if token is invalid/expired
        }
    }
    next();
};

const upload = multer();

// @desc    Check ML service health and model status
// @route   GET /api/ml/model-status
// @access  Public
router.get('/model-status', async (req, res) => {
    try {
        const response = await axios.get(`${getMlServiceUrl()}/health`, { timeout: 5000 });
        res.json(response.data);
    } catch (err) {
        res.status(503).json({
            status: 'unavailable',
            message: 'ML Service offline or unreachable',
            error: err.message
        });
    }
});
            message: 'ML Service offline or unreachable',
            error: err.message
        });
    }
});

// @desc    Forward assessment to ML service
// @route   POST /api/ml/assess
// @access  Public / Optional Auth
router.post('/assess', optionalAuth, async (req, res) => {
    try {
        const response = await axios.post(`${getMlServiceUrl()}/api/assess`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('Error contacting ML service', err.message);
        res.status(500).send('ML Service Error');
    }
});

// @desc    Forward recommendation request to ML service
// @route   POST /api/ml/recommend
// @access  Public / Optional Auth
router.post('/recommend', optionalAuth, async (req, res) => {
    try {
        const response = await axios.post(`${getMlServiceUrl()}/api/recommend`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('Error contacting ML service', err.message);
        res.status(500).send('ML Service Error');
    }
});

// @desc    Forward explicit V8 recommendation ranking request to ML service
// @route   POST /api/ml/recommend/v8
// @access  Public / Optional Auth
router.post('/recommend/v8', optionalAuth, async (req, res) => {
    try {
        const response = await axios.post(`${getMlServiceUrl()}/api/recommend/v8`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('Error contacting ML service for V8 ranking', err.message);
        res.status(500).json({ error: 'ML Service Error', details: err.message });
    }
});

// @desc    Forward resume analysis to ML service
// @route   POST /api/ml/analyze-resume
// @access  Public / Optional Auth
router.post('/analyze-resume', optionalAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { branch, jobRole } = req.body;

        // Construct standard FormData and Blob using Node 18+ globals
        const formData = new FormData();
        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype || 'application/pdf' });
        formData.append('file', fileBlob, req.file.originalname || 'resume.pdf');
        formData.append('branch', branch || '');
        formData.append('jobRole', jobRole || '');

        const response = await axios.post(`${getMlServiceUrl()}/api/analyze-resume`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 30000
        });
        res.json(response.data);
    } catch (err) {
        console.error('Error contacting ML service during resume analysis:', err.response?.data || err.message);
        res.status(500).json({ error: 'ML Service Error', details: err.response?.data?.detail || err.message });
    }
});

module.exports = router;
