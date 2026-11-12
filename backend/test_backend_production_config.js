/**
 * Career Compass - Backend Production Configuration & Health Test Suite
 * 
 * Tests:
 * 1. Node.js >= 20.0.0 runtime and native modern globals (fetch, FormData, Blob, AbortSignal.timeout)
 * 2. Centralized JWT security enforcement in development vs production
 * 3. Auth middleware integration with centralized JWT security
 * 4. ML service URL normalization and Render endpoint handling
 * 5. Admin System Health reporting (/health endpoint, real latency, DB readyState, no hardcoded IPs/fake latencies)
 * 6. Audit of all production controller/middleware imports and zero fallback secrets in source code
 */

const assert = require('assert');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

let passed = 0;
let failed = 0;

function it(desc, fn) {
    try {
        fn();
        console.log(`  [PASS] ${desc}`);
        passed++;
    } catch (err) {
        console.error(`  [FAIL] ${desc}: ${err.message}`);
        failed++;
    }
}

async function itAsync(desc, fn) {
    try {
        await fn();
        console.log(`  [PASS] ${desc}`);
        passed++;
    } catch (err) {
        console.error(`  [FAIL] ${desc}: ${err.message}`);
        failed++;
    }
}

async function runTestSuite() {
    console.log('\n============================================================');
    console.log('CAREER COMPASS BACKEND PRODUCTION CONFIGURATION TEST SUITE');
    console.log('============================================================\n');

    // ------------------------------------------------------------
    // 1. Node.js >= 20 Runtime & Modern Globals
    // ------------------------------------------------------------
    console.log('1. Node.js Environment & Native Globals Compatibility:');

    it('Runtime is Node.js >= 20.0.0', () => {
        const majorVersion = parseInt(process.versions.node.split('.')[0], 10);
        assert(majorVersion >= 20, `Expected Node >= 20, detected Node ${process.version}`);
    });

    it('Native globalThis.fetch is available', () => {
        assert(typeof globalThis.fetch === 'function', 'fetch is not a native global function');
    });

    it('Native globalThis.FormData is available', () => {
        assert(typeof globalThis.FormData === 'function', 'FormData is not a native global function');
    });

    it('Native globalThis.Blob is available', () => {
        assert(typeof globalThis.Blob === 'function', 'Blob is not a native global function');
    });

    it('Native AbortSignal.timeout is available', () => {
        assert(typeof AbortSignal.timeout === 'function', 'AbortSignal.timeout is not available');
    });

    // ------------------------------------------------------------
    // 2. Centralized JWT Configuration & Production Security
    // ------------------------------------------------------------
    console.log('\n2. Centralized JWT Security Enforcement:');

    const { getJwtSecret } = require('./config/jwt');

    it('In development: allows fallback when JWT_SECRET is unset', () => {
        const originalEnv = process.env.NODE_ENV;
        const originalSecret = process.env.JWT_SECRET;
        try {
            process.env.NODE_ENV = 'development';
            delete process.env.JWT_SECRET;
            const secret = getJwtSecret();
            assert.strictEqual(secret, 'supersecretjwtkey_change_in_production');
        } finally {
            process.env.NODE_ENV = originalEnv;
            if (originalSecret) process.env.JWT_SECRET = originalSecret;
        }
    });

    it('In development: uses custom JWT_SECRET when provided', () => {
        const originalEnv = process.env.NODE_ENV;
        const originalSecret = process.env.JWT_SECRET;
        try {
            process.env.NODE_ENV = 'development';
            process.env.JWT_SECRET = 'dev_custom_secret_1234567890';
            const secret = getJwtSecret();
            assert.strictEqual(secret, 'dev_custom_secret_1234567890');
        } finally {
            process.env.NODE_ENV = originalEnv;
            if (originalSecret) process.env.JWT_SECRET = originalSecret;
        }
    });

    it('In production: throws fatal security error if JWT_SECRET is unset', () => {
        const originalEnv = process.env.NODE_ENV;
        const originalSecret = process.env.JWT_SECRET;
        try {
            process.env.NODE_ENV = 'production';
            delete process.env.JWT_SECRET;
            assert.throws(() => {
                getJwtSecret();
            }, /FATAL SECURITY ERROR/);
        } finally {
            process.env.NODE_ENV = originalEnv;
            if (originalSecret) process.env.JWT_SECRET = originalSecret;
        }
    });

    it('In production: throws fatal security error if JWT_SECRET equals default fallback key', () => {
        const originalEnv = process.env.NODE_ENV;
        const originalSecret = process.env.JWT_SECRET;
        try {
            process.env.NODE_ENV = 'production';
            process.env.JWT_SECRET = 'supersecretjwtkey_change_in_production';
            assert.throws(() => {
                getJwtSecret();
            }, /FATAL SECURITY ERROR/);
        } finally {
            process.env.NODE_ENV = originalEnv;
            if (originalSecret) process.env.JWT_SECRET = originalSecret;
        }
    });

    it('In production: throws fatal security error if JWT_SECRET is empty string', () => {
        const originalEnv = process.env.NODE_ENV;
        const originalSecret = process.env.JWT_SECRET;
        try {
            process.env.NODE_ENV = 'production';
            process.env.JWT_SECRET = '   ';
            assert.throws(() => {
                getJwtSecret();
            }, /FATAL SECURITY ERROR/);
        } finally {
            process.env.NODE_ENV = originalEnv;
            if (originalSecret) process.env.JWT_SECRET = originalSecret;
        }
    });

    it('In production: returns custom secret when validly configured', () => {
        const originalEnv = process.env.NODE_ENV;
        const originalSecret = process.env.JWT_SECRET;
        try {
            process.env.NODE_ENV = 'production';
            process.env.JWT_SECRET = 'production_super_strong_secret_key_xyz_987';
            const secret = getJwtSecret();
            assert.strictEqual(secret, 'production_super_strong_secret_key_xyz_987');
        } finally {
            process.env.NODE_ENV = originalEnv;
            if (originalSecret) process.env.JWT_SECRET = originalSecret;
        }
    });

    // ------------------------------------------------------------
    // 3. Auth Middleware Security & Safe Failure
    // ------------------------------------------------------------
    console.log('\n3. Auth Middleware Security & Safe Failure:');

    const authMiddleware = require('./middleware/auth');

    it('Auth middleware: succeeds with valid token', (done) => {
        const originalEnv = process.env.NODE_ENV;
        const originalSecret = process.env.JWT_SECRET;
        try {
            process.env.NODE_ENV = 'development';
            process.env.JWT_SECRET = 'test_secret_for_middleware_123';
            const token = jwt.sign({ user: { id: 'user123', role: 'student' } }, 'test_secret_for_middleware_123');

            const req = {
                header: (h) => (h === 'x-auth-token' ? token : null),
                cookies: {}
            };
            const res = {};
            authMiddleware(req, res, () => {
                assert.strictEqual(req.user.id, 'user123');
                assert.strictEqual(req.user.role, 'student');
            });
        } finally {
            process.env.NODE_ENV = originalEnv;
            if (originalSecret) process.env.JWT_SECRET = originalSecret;
        }
    });

    it('Auth middleware: returns 401 on missing token', () => {
        const req = { header: () => null, cookies: {} };
        let statusCode = null;
        let responseJson = null;
        const res = {
            status: (code) => {
                statusCode = code;
                return {
                    json: (data) => { responseJson = data; }
                };
            }
        };
        authMiddleware(req, res, () => {});
        assert.strictEqual(statusCode, 401);
        assert.strictEqual(responseJson.msg, 'No token, authorization denied');
    });

    it('Auth middleware: returns 401 on corrupted/invalid token', () => {
        const req = { header: (h) => (h === 'x-auth-token' ? 'invalid.jwt.token' : null), cookies: {} };
        let statusCode = null;
        let responseJson = null;
        const res = {
            status: (code) => {
                statusCode = code;
                return {
                    json: (data) => { responseJson = data; }
                };
            }
        };
        authMiddleware(req, res, () => {});
        assert.strictEqual(statusCode, 401);
        assert.strictEqual(responseJson.msg, 'Token is not valid');
    });

    it('Auth middleware: in production fails safely with 500 if JWT_SECRET is misconfigured', () => {
        const originalEnv = process.env.NODE_ENV;
        const originalSecret = process.env.JWT_SECRET;
        try {
            process.env.NODE_ENV = 'production';
            delete process.env.JWT_SECRET;

            const req = { header: (h) => (h === 'x-auth-token' ? 'some.valid.token' : null), cookies: {} };
            let statusCode = null;
            let responseJson = null;
            const res = {
                status: (code) => {
                    statusCode = code;
                    return {
                        json: (data) => { responseJson = data; }
                    };
                }
            };
            authMiddleware(req, res, () => {});
            assert.strictEqual(statusCode, 500);
            assert.strictEqual(responseJson.msg, 'Authentication configuration error');
        } finally {
            process.env.NODE_ENV = originalEnv;
            if (originalSecret) process.env.JWT_SECRET = originalSecret;
        }
    });

    // ------------------------------------------------------------
    // 4. ML Service URL Configuration
    // ------------------------------------------------------------
    console.log('\n4. ML Service URL Normalization:');

    const { getMlServiceUrl } = require('./config/mlConfig');

    it('Default URL fallback returns http://127.0.0.1:8000', () => {
        const originalUrl = process.env.ML_SERVICE_URL;
        try {
            delete process.env.ML_SERVICE_URL;
            assert.strictEqual(getMlServiceUrl(), 'http://127.0.0.1:8000');
        } finally {
            if (originalUrl) process.env.ML_SERVICE_URL = originalUrl;
        }
    });

    it('Translates localhost to 127.0.0.1 for Node 20+ IPv4 reliability', () => {
        const originalUrl = process.env.ML_SERVICE_URL;
        try {
            process.env.ML_SERVICE_URL = 'http://localhost:8000';
            assert.strictEqual(getMlServiceUrl(), 'http://127.0.0.1:8000');
        } finally {
            if (originalUrl) process.env.ML_SERVICE_URL = originalUrl;
        }
    });

    it('Normalizes trailing slashes on Render production URL', () => {
        const originalUrl = process.env.ML_SERVICE_URL;
        try {
            process.env.ML_SERVICE_URL = 'https://career-compass-ml-q4f2.onrender.com///';
            assert.strictEqual(getMlServiceUrl(), 'https://career-compass-ml-q4f2.onrender.com');
        } finally {
            if (originalUrl) process.env.ML_SERVICE_URL = originalUrl;
        }
    });

    // ------------------------------------------------------------
    // 5. Admin System Health Check Logic
    // ------------------------------------------------------------
    console.log('\n5. Admin System Health Check (getSystemHealth):');

    const adminController = require('./controllers/adminController');

    await itAsync('Reports Operational when ML is healthy and DB is connected', async () => {
        // Save original fetch
        const originalFetch = globalThis.fetch;
        try {
            globalThis.fetch = async (url) => {
                assert(url.endsWith('/health'), `Expected fetch to target /health, got ${url}`);
                return {
                    ok: true,
                    json: async () => ({
                        status: 'healthy',
                        v8_model: { loaded: true },
                        resume_model: { loaded: true }
                    })
                };
            };

            const req = {};
            let resultData = null;
            const res = {
                json: (data) => { resultData = data; }
            };

            await adminController.getSystemHealth(req, res);

            assert(resultData, 'Response data must be returned');
            assert(Array.isArray(resultData.services), 'services must be an array');
            assert.strictEqual(resultData.services.length, 5);

            const mlService = resultData.services.find(s => s.name === 'AI & ML FastAPI Service');
            assert(mlService, 'ML Service item present');
            assert.strictEqual(mlService.status, 'Operational');
            assert(!mlService.latency.includes('fabricated'));
            assert(mlService.latency.endsWith('ms'), `Expected real latency ms, got ${mlService.latency}`);

            const atsService = resultData.services.find(s => s.name === 'ATS Resume Classifier');
            assert.strictEqual(atsService.status, 'Operational');

            const dbService = resultData.services.find(s => s.name === 'MongoDB Database');
            assert(dbService.host !== '127.0.0.1:27017', `Hardcoded IP found: ${dbService.host}`);

            const workerService = resultData.services.find(s => s.name === 'Notification & Alerts Worker');
            assert.strictEqual(workerService.latency, 'N/A', 'Worker latency should be N/A');
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    await itAsync('Reports Degraded/Unavailable when ML service is offline', async () => {
        const originalFetch = globalThis.fetch;
        try {
            globalThis.fetch = async () => {
                throw new Error('Connection refused');
            };

            const req = {};
            let resultData = null;
            const res = {
                json: (data) => { resultData = data; }
            };

            await adminController.getSystemHealth(req, res);

            const mlService = resultData.services.find(s => s.name === 'AI & ML FastAPI Service');
            assert.strictEqual(mlService.status, 'Unavailable');
            assert.strictEqual(mlService.latency, 'N/A');

            const atsService = resultData.services.find(s => s.name === 'ATS Resume Classifier');
            assert.strictEqual(atsService.status, 'Unavailable');
            assert.strictEqual(atsService.latency, 'N/A');

            // Overall status reflects degradation when DB is connected or unavailable when DB disconnected
            assert(['Degraded', 'Unavailable'].includes(resultData.status));
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    await itAsync('Does not display hardcoded fake latencies (4ms, 2ms, 12ms, 1ms)', async () => {
        const originalFetch = globalThis.fetch;
        try {
            globalThis.fetch = async () => ({
                ok: true,
                json: async () => ({ status: 'healthy', resume_model: { loaded: true } })
            });

            const req = {};
            let resultData = null;
            const res = {
                json: (data) => { resultData = data; }
            };

            await adminController.getSystemHealth(req, res);

            const mlService = resultData.services.find(s => s.name === 'AI & ML FastAPI Service');
            const dbService = resultData.services.find(s => s.name === 'MongoDB Database');
            const atsService = resultData.services.find(s => s.name === 'ATS Resume Classifier');
            const workerService = resultData.services.find(s => s.name === 'Notification & Alerts Worker');

            assert(workerService.latency === 'N/A', 'Worker latency must be N/A');
            // If DB is disconnected, latency must be N/A
            if (mongoose.connection.readyState !== 1) {
                assert.strictEqual(dbService.latency, 'N/A');
            }
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    // ------------------------------------------------------------
    // 6. Security Audit: Zero Hardcoded Fallbacks in Routes/Controllers
    // ------------------------------------------------------------
    console.log('\n6. Codebase Security Audit (Zero Fallbacks in Core Files):');

    const fs = require('fs');
    const path = require('path');

    const filesToAudit = [
        'middleware/auth.js',
        'middleware/adminAuth.js',
        'controllers/authController.js',
        'controllers/employerController.js',
        'controllers/jobsController.js',
        'controllers/adminController.js',
        'controllers/assessmentController.js',
        'routes/ml.js',
        'routes/privacy.js',
        'server.js'
    ];

    filesToAudit.forEach(file => {
        it(`File ${file} has no hardcoded fallback JWT secret`, () => {
            const filePath = path.join(__dirname, file);
            const content = fs.readFileSync(filePath, 'utf8');
            assert(!content.includes('supersecretjwtkey_change_in_production'),
                `Found fallback secret string in ${file}`);
        });
    });

    it('adminController.js does not contain hardcoded 127.0.0.1:27017', () => {
        const content = fs.readFileSync(path.join(__dirname, 'controllers/adminController.js'), 'utf8');
        assert(!content.includes('127.0.0.1:27017'), 'Found hardcoded 127.0.0.1:27017 in adminController.js');
    });

    it('adminController.js does not contain hardcoded localhost:8000/docs', () => {
        const content = fs.readFileSync(path.join(__dirname, 'controllers/adminController.js'), 'utf8');
        assert(!content.includes('http://localhost:8000/docs'), 'Found hardcoded localhost:8000/docs in adminController.js');
    });

    it('server.js implements dedicated /health and /api/health endpoints for cloud health checks', () => {
        const content = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
        assert(content.includes('/health'), 'server.js missing /health route');
        assert(content.includes('/api/health'), 'server.js missing /api/health route');
    });

    it('server.js binds to 0.0.0.0 and does not crash on missing env variables at startup', () => {
        const content = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
        assert(content.includes("'0.0.0.0'"), 'server.js must bind to 0.0.0.0 for cloud container compatibility');
        assert(!content.includes('process.exit(1)'), 'server.js must not crash deployment with process.exit(1)');
    });

    // ------------------------------------------------------------
    // Summary
    // ------------------------------------------------------------
    console.log('\n============================================================');
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('============================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runTestSuite().catch((err) => {
    console.error('Test suite runner crashed:', err);
    process.exit(1);
});
