const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5000';

async function runTrustLegalSuite() {
    console.log('====================================================');
    console.log('CAREER COMPASS — TRUST, PRIVACY & LEGAL TEST SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, testName) {
        if (condition) {
            console.log(`[PASS] ${testName}`);
            passed++;
        } else {
            console.error(`[FAIL] ${testName}`);
            failed++;
        }
    }

    try {
        // Connect to MongoDB to inspect directly
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/career_recommender';
        await mongoose.connect(mongoUri);
        const User = require('./models/User');
        const PrivacyConsent = require('./models/PrivacyConsent');
        const PrivacyRequest = require('./models/PrivacyRequest');
        const AuditLog = require('./models/AuditLog');

        console.log('--- 1. CONTACT & GRIEVANCE SUBMISSION TESTS ---');
        // Test 1.1: Missing fields rejected
        try {
            await axios.post(`${BASE_URL}/api/privacy/contact`, { name: 'Test' });
            assert(false, 'Missing fields should return 400');
        } catch (err) {
            assert(err.response?.status === 400, 'Missing fields returned 400 Bad Request');
        }

        // Test 1.2: Valid submission generates Ticket ID
        const testTicketEmail = `test_dsar_${Date.now()}@example.com`;
        const contactRes = await axios.post(`${BASE_URL}/api/privacy/contact`, {
            name: 'Priya Sharma',
            email: testTicketEmail,
            subject: 'Right to Access Inquiry',
            category: 'privacy_request',
            message: 'Requesting clarification on stored assessment trait indicators.'
        });
        assert(contactRes.status === 201 && contactRes.data.ticketId?.startsWith('CC-REQ-'), 'Valid contact request generates CC-REQ- ticket ID');
        const ticketId = contactRes.data.ticketId;

        // Verify persisted in DB
        const dbTicket = await PrivacyRequest.findOne({ ticketId });
        assert(dbTicket !== null && dbTicket.status === 'Pending', 'Privacy request persisted in MongoDB with Pending status');

        console.log('\n--- 2. COOKIE CONSENT PERSISTENCE TESTS ---');
        // Test 2.1: Record consent
        const consentRes = await axios.post(`${BASE_URL}/api/privacy/consent`, {
            email: testTicketEmail,
            consentType: 'cookie_preferences',
            preferences: { essential: true, functional: true, analytics: false, marketing: false },
            documentVersion: 'v1.0'
        });
        assert(consentRes.status === 200 && consentRes.data.success, 'Cookie preferences recorded successfully via API');

        const dbConsent = await PrivacyConsent.findOne({ userEmail: testTicketEmail });
        assert(dbConsent !== null && dbConsent.preferences?.functional === true && dbConsent.preferences?.analytics === false, 'Cookie preferences correctly stored in database without preselection');

        console.log('\n--- 3. REGISTRATION CONSENT & JWT TESTS ---');
        // Test 3.1: Register student with consent
        const studentEmail = `student_legal_${Date.now()}@university.edu`;
        const studentPassword = 'SecureStudentPassword123!';
        const regRes = await axios.post(`${BASE_URL}/api/auth/register`, {
            name: 'Ananya Verma',
            email: studentEmail,
            password: studentPassword,
            role: 'student',
            termsAccepted: true,
            privacyAccepted: true,
            consentVersion: 'v1.0'
        });
        assert(regRes.status === 200 && regRes.data.token, 'Student registration with terms & privacy consent succeeded');
        const studentToken = regRes.data.token;
        const studentId = regRes.data.user?.id;

        // Verify consent persisted in User model
        const regUser = await User.findById(studentId);
        assert(regUser.consent?.termsAccepted === true && regUser.consent?.version === 'v1.0', 'User record stores termsAccepted=true and version=v1.0');

        console.log('\n--- 4. DATA PORTABILITY / EXPORT TESTS ---');
        // Test 4.1: Unauthenticated request rejected
        try {
            await axios.get(`${BASE_URL}/api/privacy/export-data`);
            assert(false, 'Unauthenticated export should return 401');
        } catch (err) {
            assert(err.response?.status === 401, 'Unauthenticated export returned 401 Unauthorized');
        }

        // Test 4.2: Authenticated student export
        const exportRes = await axios.get(`${BASE_URL}/api/privacy/export-data`, {
            headers: { 'x-auth-token': studentToken }
        });
        assert(exportRes.status === 200, 'Student data export endpoint returned 200 OK');
        assert(exportRes.data.exportMetadata?.purpose.includes('Data Portability'), 'Export contains GDPR/DPDP data portability metadata');
        assert(exportRes.data.accountInformation?.email === studentEmail, 'Export contains correct student account information');
        assert(exportRes.data.accountInformation?.password === undefined, 'Export strictly excludes password hashes and security secrets');
        assert(exportRes.data.studentProfile !== undefined, 'Export contains profile section');
        assert(exportRes.data.resumesAndDocuments !== undefined, 'Export contains resumes and documents section');

        console.log('\n--- 5. RBAC & ADMIN PRIVACY OPERATIONS TESTS ---');
        // Test 5.1: Student token rejected from admin privacy requests
        try {
            await axios.get(`${BASE_URL}/api/privacy/admin/requests`, {
                headers: { 'x-auth-token': studentToken }
            });
            assert(false, 'Student should be forbidden from admin privacy requests');
        } catch (err) {
            assert(err.response?.status === 403, 'Student token correctly rejected with 403 Forbidden on admin endpoint');
        }

        // Test 5.2: Create or fetch admin account to test admin resolution
        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            adminUser = new User({
                name: 'System Admin',
                email: `admin_${Date.now()}@careercompass.internal`,
                password: 'AdminPassword123!',
                role: 'admin'
            });
            await adminUser.save();
        }

        // Login as admin
        const jwt = require('jsonwebtoken');
        const adminToken = jwt.sign(
            { user: { id: adminUser._id.toString(), role: 'admin' } },
            process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production',
            { expiresIn: '1h' }
        );

        // Test 5.3: Admin lists requests
        const adminListRes = await axios.get(`${BASE_URL}/api/privacy/admin/requests`, {
            headers: { 'x-auth-token': adminToken }
        });
        assert(adminListRes.status === 200 && Array.isArray(adminListRes.data.requests), 'Admin can list privacy and support requests');

        // Test 5.4: Admin updates request status and writes audit log
        const updateRes = await axios.put(
            `${BASE_URL}/api/privacy/admin/requests/${dbTicket._id}`,
            {
                status: 'Under Review',
                resolutionNotes: 'Assigned to Data Protection Officer for verification.'
            },
            { headers: { 'x-auth-token': adminToken } }
        );
        assert(updateRes.status === 200 && updateRes.data.request?.status === 'Under Review', 'Admin can update request status to Under Review');

        // Verify AuditLog written
        const auditLogEntry = await AuditLog.findOne({ target: ticketId });
        assert(auditLogEntry !== null && auditLogEntry.targetType === 'PrivacyRequest', 'AuditLog record written for admin privacy request status change');

        console.log('\n--- 6. PERMANENT ACCOUNT DELETION TESTS ---');
        // Test 6.1: Wrong password rejected
        try {
            await axios.post(
                `${BASE_URL}/api/privacy/delete-account`,
                { password: 'WrongPassword!', confirmationText: 'DELETE' },
                { headers: { 'x-auth-token': studentToken } }
            );
            assert(false, 'Wrong password should fail deletion');
        } catch (err) {
            assert(err.response?.status === 400, 'Wrong password correctly rejected with 400 Bad Request');
        }

        // Test 6.2: Missing "DELETE" text rejected
        try {
            await axios.post(
                `${BASE_URL}/api/privacy/delete-account`,
                { password: studentPassword, confirmationText: 'cancel' },
                { headers: { 'x-auth-token': studentToken } }
            );
            assert(false, 'Invalid confirmation text should fail deletion');
        } catch (err) {
            assert(err.response?.status === 400, 'Invalid confirmation text rejected with 400 Bad Request');
        }

        // Test 6.3: Valid permanent deletion
        const deleteRes = await axios.post(
            `${BASE_URL}/api/privacy/delete-account`,
            {
                password: studentPassword,
                confirmationText: 'DELETE',
                reason: 'Graduating student completing placement'
            },
            { headers: { 'x-auth-token': studentToken } }
        );
        assert(deleteRes.status === 200 && deleteRes.data.success, 'Permanent account deletion executed successfully');

        // Verify student user deleted from database
        const deletedUserCheck = await User.findById(studentId);
        assert(deletedUserCheck === null, 'Student User document permanently removed from MongoDB');

        // Test 6.4: Subsequent login fails
        try {
            await axios.post(`${BASE_URL}/api/auth/login`, {
                email: studentEmail,
                password: studentPassword
            });
            assert(false, 'Login after deletion should fail');
        } catch (err) {
            assert(err.response?.status === 400, 'Subsequent login fails with Invalid Credentials');
        }

        console.log('\n--- 7. REGRESSION VERIFICATION ---');
        // Test 7.1: Public jobs endpoint active
        const jobsRes = await axios.get(`${BASE_URL}/api/employer/public-jobs`);
        assert(jobsRes.status === 200 && Array.isArray(jobsRes.data.jobs), 'GET /api/employer/public-jobs functional and active');

        // Test 7.2: Courses endpoint active
        const coursesRes = await axios.get(`${BASE_URL}/api/courses`);
        assert(coursesRes.status === 200 && Array.isArray(coursesRes.data.courses), 'GET /api/courses functional and active');

        console.log('\n====================================================');
        console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
        console.log('====================================================');

        process.exit(failed > 0 ? 1 : 0);
    } catch (err) {
        console.error('Unexpected test suite error:', err);
        process.exit(1);
    }
}

runTrustLegalSuite();
