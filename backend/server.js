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
        console.log('[Security] Production JWT_SECRET verified.');
    } catch (secErr) {
        console.warn('\n=============================================================');
        console.warn('[SECURITY WARNING]', secErr.message);
        console.warn('Set a custom JWT_SECRET in your Render Dashboard -> Environment.');
        console.warn('Authenticated routes will safely return 500 until configured.');
        console.warn('=============================================================\n');
    }

    if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
        console.warn('\n=============================================================');
        console.warn('[DATABASE WARNING] MONGO_URI is not configured in production environment variables.');
        console.warn('Set MONGO_URI in your Render Dashboard -> Environment.');
        console.warn('=============================================================\n');
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
const allowedOrigins = (process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/\/+$/, ''))
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000', 'http://127.0.0.1:5000']
).filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        const normalized = origin.trim().replace(/\/+$/, '');

        // Match against allowed origins or any Vercel deployment (*.vercel.app)
        if (
            allowedOrigins.includes(normalized) ||
            normalized.endsWith('.vercel.app') ||
            allowedOrigins.some(o => o.includes('vercel.app'))
        ) {
            return callback(null, true);
        }

        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(new Error(`Blocked by CORS policy: origin ${origin} is not allowed`));
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
    res.status(200).send('Career Compass API is running...');
});

// Render / Cloud Health Check Endpoints
app.get(['/health', '/api/health'], (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : (dbState === 2 ? 'connecting' : 'disconnected');
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        database: dbStatus,
        port: PORT
    });
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

// 1. Immediately bind to PORT and 0.0.0.0 so Render detects the service is live instantly
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Career Compass server running on port ${PORT} (0.0.0.0) [NODE_ENV=${process.env.NODE_ENV || 'development'}]`);
});

// 2. Connect to MongoDB asynchronously without blocking port detection
if (mongoUri) {
    mongoose.connect(mongoUri)
        .then(() => {
            console.log('MongoDB Connected successfully');
            try {
                const schedulerService = require('./services/job-ingestion/schedulerService');
                schedulerService.start();
            } catch (e) {
                console.error('Failed to start ingestion scheduler:', e.message);
            }
        })
        .catch(err => {
            console.error('Database connection error:', err.message);
        });
} else {
    console.warn('No MONGO_URI provided. Database features are currently offline.');
}
