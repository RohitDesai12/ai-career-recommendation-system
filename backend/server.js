const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

// Validate critical environment configuration in production
if (process.env.NODE_ENV === 'production') {
    const { getJwtSecret } = require('./config/jwt');
    try {
        getJwtSecret();
    } catch (secErr) {
        console.error('FATAL PRODUCTION CONFIGURATION ERROR:', secErr.message);
        process.exit(1);
    }

    if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
        console.error('FATAL PRODUCTION CONFIGURATION ERROR: MONGO_URI must be configured in production!');
        process.exit(1);
    }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for secure headers / cookies behind reverse proxy (Vercel, Render, Nginx, Cloudflare)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// 1. Lightweight Cookie Parser Middleware
app.use((req, res, next) => {
    req.cookies = {};
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
        cookieHeader.split(';').forEach(c => {
            const parts = c.trim().split('=');
            if (parts.length >= 2) {
                req.cookies[parts[0]] = decodeURIComponent(parts.slice(1).join('='));
            }
        });
    }
    next();
});

// 2. Production-Ready CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000', 'http://127.0.0.1:5000'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Blocked by CORS policy'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'X-Requested-With', 'Accept']
}));

// 3. Security HTTP Headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

// 4. Rate Limiter for Authentication Endpoints (Brute-Force & Credential Stuffing Defense)
const authLimiterMap = new Map();
const authRateLimiter = (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15-minute sliding window
    const maxAttempts = 30; // 30 attempts per 15 min per IP

    let record = authLimiterMap.get(ip);
    if (!record || now - record.startTime > windowMs) {
        record = { count: 1, startTime: now };
        authLimiterMap.set(ip, record);
    } else {
        record.count++;
    }

    if (record.count > maxAttempts) {
        return res.status(429).json({
            msg: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.'
        });
    }
    next();
};

app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);

// 5. Body Parsing
app.use(express.json({ limit: '10mb' }));

// 6. Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/ml', require('./routes/ml'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/roadmaps', require('./routes/roadmap'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/interview-prep', require('./routes/interviewPrep'));
app.use('/api/employer', require('./routes/employer'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/cover-letter', require('./routes/coverLetter'));
app.use('/api/assessment', require('./routes/assessment'));
app.use('/api/assistant', require('./routes/assistant'));
app.use('/api/search', require('./routes/search'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/admin/job-sources', require('./routes/jobIngestion'));
app.use('/api/privacy', require('./routes/privacy'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// 7. Production Error Handling Middleware (prevents leaking stack traces)
app.use((err, req, res, next) => {
    console.error('Unhandled Application Error:', err.message);
    const isProd = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
        msg: isProd ? 'A server error occurred. Please try again later.' : err.message,
        ...(isProd ? {} : { stack: err.stack })
    });
});

// Database Connection & Server Start
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/career_recommender';
mongoose.connect(mongoUri)
    .then(() => {
        console.log('MongoDB Connected');
        try {
            const schedulerService = require('./services/job-ingestion/schedulerService');
            schedulerService.start();
        } catch (e) {
            console.error('Failed to start ingestion scheduler:', e.message);
        }
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log('Database connection error:', err));
