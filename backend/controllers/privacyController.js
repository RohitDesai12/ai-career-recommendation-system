const User = require('../models/User');
const Profile = require('../models/Profile');
const Resume = require('../models/Resume');
const ResumeHistory = require('../models/ResumeHistory');
const CoverLetter = require('../models/CoverLetter');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const CourseProgress = require('../models/CourseProgress');
const LearningPathEnrollment = require('../models/LearningPathEnrollment');
const Roadmap = require('../models/Roadmap');
const SavedJob = require('../models/SavedJob');
const JobApplication = require('../models/JobApplication');
const JobAlert = require('../models/JobAlert');
const InterviewPrep = require('../models/InterviewPrep');
const SavedPrep = require('../models/SavedPrep');
const ChatSession = require('../models/ChatSession');
const StudentActivity = require('../models/StudentActivity');
const PrivacyConsent = require('../models/PrivacyConsent');
const PrivacyRequest = require('../models/PrivacyRequest');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

// Helper to generate a clean, random ticket ID
function generateTicketId() {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `CC-REQ-${randomDigits}`;
}

// @desc    Submit Contact, Support, Privacy or Deletion Request
// @route   POST /api/privacy/contact
// @access  Public (Optional Auth)
exports.submitContactRequest = async (req, res) => {
    try {
        const { name, email, subject, category, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ msg: 'Please provide name, email, subject, and message.' });
        }

        const validCategories = [
            'general_enquiry',
            'technical_issue',
            'privacy_request',
            'data_deletion',
            'data_export',
            'security_concern',
            'feedback'
        ];

        const normalizedCategory = (category || 'general_enquiry').toLowerCase().replace(/\s+/g, '_');
        const finalCategory = validCategories.includes(normalizedCategory) ? normalizedCategory : 'general_enquiry';

        const ticketId = generateTicketId();

        const privacyReq = new PrivacyRequest({
            ticketId,
            user: req.user ? req.user.id : null,
            userName: name.trim(),
            userEmail: email.trim().toLowerCase(),
            requestType: finalCategory,
            subject: subject.trim(),
            message: message.trim(),
            ipAddress: req.ip || req.connection?.remoteAddress || '',
            status: 'Pending'
        });

        await privacyReq.save();

        res.status(201).json({
            success: true,
            ticketId: privacyReq.ticketId,
            msg: `Your request (${ticketId}) has been received. Our team will review it according to our response timeline.`
        });
    } catch (err) {
        console.error('Error in submitContactRequest:', err);
        res.status(500).json({ msg: 'Server error submitting request. Please try again.' });
    }
};

// @desc    Record or Update Cookie / Privacy Consent
// @route   POST /api/privacy/consent
// @access  Public (Optional Auth)
exports.recordConsent = async (req, res) => {
    try {
        const { consentType, preferences, documentVersion, termsAccepted, privacyAccepted } = req.body;

        const consent = new PrivacyConsent({
            user: req.user ? req.user.id : null,
            userEmail: req.user ? req.user.email : (req.body.email || ''),
            consentType: consentType || 'cookie_preferences',
            documentVersion: documentVersion || 'v1.0',
            preferences: {
                essential: true, // Always true
                functional: Boolean(preferences?.functional),
                analytics: Boolean(preferences?.analytics),
                marketing: Boolean(preferences?.marketing)
            },
            termsAccepted: Boolean(termsAccepted),
            privacyAccepted: Boolean(privacyAccepted),
            ipAddress: req.ip || req.connection?.remoteAddress || '',
            userAgent: req.headers['user-agent'] || '',
            recordedAt: new Date()
        });

        await consent.save();

        res.json({
            success: true,
            msg: 'Consent preferences recorded successfully.',
            recordedAt: consent.recordedAt
        });
    } catch (err) {
        console.error('Error in recordConsent:', err);
        res.status(500).json({ msg: 'Server error recording consent.' });
    }
};

// @desc    Get Current User Consent Status
// @route   GET /api/privacy/consent
// @access  Private
exports.getConsentStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('consent');
        const latestConsent = await PrivacyConsent.findOne({ user: req.user.id }).sort({ recordedAt: -1 });

        res.json({
            userConsent: user?.consent || { termsAccepted: false, privacyAccepted: false, version: 'v1.0' },
            cookiePreferences: latestConsent?.preferences || {
                essential: true,
                functional: false,
                analytics: false,
                marketing: false
            },
            lastUpdated: latestConsent?.recordedAt || null
        });
    } catch (err) {
        console.error('Error in getConsentStatus:', err);
        res.status(500).json({ msg: 'Server error retrieving consent status.' });
    }
};

// @desc    Download / Export All Student Personal Data (GDPR / DPDP Compliance)
// @route   GET /api/privacy/export-data
// @access  Private (Student)
exports.exportStudentData = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch User Record (omit password hash)
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User account not found.' });
        }

        // 2. Fetch Profile
        const profile = await Profile.findOne({ user: userId });

        // 3. Fetch Resumes & Histories
        const resumes = await Resume.find({ user: userId }).select('-__v');
        const resumeHistories = await ResumeHistory.find({ user: userId }).select('-__v');
        const coverLetters = await CoverLetter.find({ user: userId }).select('-__v');

        // 4. Fetch Assessments & Roadmaps
        const assessments = await AssessmentAttempt.find({ user: userId }).select('-__v');
        const roadmaps = await Roadmap.find({ user: userId }).select('-__v');

        // 5. Fetch Learning & Courses
        const courseProgress = await CourseProgress.find({ user: userId }).select('-__v');
        const learningPaths = await LearningPathEnrollment.find({ user: userId }).select('-__v');

        // 6. Fetch Job Discovery Data
        const savedJobs = await SavedJob.find({ user: userId }).populate('job', 'title companyName location salary').select('-__v');
        const jobApplications = await JobApplication.find({ user: userId }).select('-__v');
        const jobAlerts = await JobAlert.find({ user: userId }).select('-__v');

        // 7. Fetch Practice & Coaching
        const interviewPreps = await InterviewPrep.find({ user: userId }).select('-__v');
        const savedPreps = await SavedPrep.find({ user: userId }).select('-__v');
        const chatSessions = await ChatSession.find({ user: userId }).select('-__v');
        const activities = await StudentActivity.find({ user: userId }).sort({ createdAt: -1 }).limit(100).select('-__v');
        const consents = await PrivacyConsent.find({ user: userId }).sort({ recordedAt: -1 }).select('-__v');

        const exportPayload = {
            exportMetadata: {
                platform: 'Career Compass',
                purpose: 'Personal Data Portability Export (DPDP Act 2023 / GDPR Article 20)',
                exportTimestamp: new Date().toISOString(),
                exportedByUserId: userId,
                userEmail: user.email,
                dataSchemaVersion: '2.5.0'
            },
            accountInformation: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                status: user.status,
                isVerified: user.isVerified,
                registeredAt: user.createdAt,
                consentRecord: user.consent || null
            },
            studentProfile: profile ? {
                designation: profile.designation,
                summary: profile.summary,
                dob: profile.dob,
                city: profile.city,
                state: profile.state,
                country: profile.country,
                address: profile.address,
                phone: profile.phone,
                preferredContactMethod: profile.preferredContactMethod,
                isPublic: profile.isPublic,
                publicPreferences: profile.publicPreferences,
                educationHistory: profile.educationHistory,
                categorizedSkills: profile.categorizedSkills,
                softSkills: profile.softSkills,
                languages: profile.languages,
                isFresher: profile.isFresher,
                workExperience: profile.workExperience,
                projects: profile.projects,
                certifications: profile.certifications,
                achievements: profile.achievements,
                professionalLinks: profile.professionalLinks,
                careerPreferences: profile.careerPreferences,
                targetCareer: profile.targetCareer,
                recommendedCareers: profile.recommendedCareers,
                interests: profile.interests,
                resumeData: profile.resumeData,
                savedCourses: profile.savedCourses,
                lastProfileUpdate: profile.updatedAt
            } : null,
            resumesAndDocuments: {
                builderResumes: resumes,
                atsHistory: resumeHistories,
                coverLetters: coverLetters
            },
            careerAssessmentAndRoadmaps: {
                assessmentAttempts: assessments,
                personalizedRoadmaps: roadmaps
            },
            learningAndCourses: {
                courseProgress: courseProgress,
                learningPathEnrollments: learningPaths
            },
            jobDiscoveryAndApplications: {
                savedJobs: savedJobs,
                submittedApplications: jobApplications,
                jobAlertPreferences: jobAlerts
            },
            practiceAndCoaching: {
                interviewPreps: interviewPreps,
                savedPreps: savedPreps,
                chatSessionsCount: chatSessions.length
            },
            auditAndConsents: {
                recentActivityLog: activities,
                consentHistory: consents
            }
        };

        // Create log record
        const logReq = new PrivacyRequest({
            ticketId: generateTicketId(),
            user: userId,
            userName: user.name,
            userEmail: user.email,
            requestType: 'data_export',
            subject: 'Automated Student Data Export',
            message: 'Student initiated self-service complete personal data export.',
            status: 'Completed',
            resolutionNotes: 'Data bundle compiled and served immediately to authenticated student.',
            resolvedBy: 'Automated Privacy Engine',
            resolvedAt: new Date()
        });
        await logReq.save();

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="career-compass-data-export-${user._id}-${Date.now()}.json"`);
        return res.status(200).send(JSON.stringify(exportPayload, null, 2));
    } catch (err) {
        console.error('Error in exportStudentData:', err);
        res.status(500).json({ msg: 'Server error compiling student data export.' });
    }
};

// @desc    Permanently Delete Student Account and Associated Personal Data
// @route   POST /api/privacy/delete-account
// @access  Private (Student)
exports.deleteStudentAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password, reason, confirmationText } = req.body;

        if (!password) {
            return res.status(400).json({ msg: 'Please provide your current password to confirm account deletion.' });
        }

        if (confirmationText !== 'DELETE') {
            return res.status(400).json({ msg: 'Please enter "DELETE" to confirm your decision.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User account not found.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect password. Deletion verification failed.' });
        }

        const userEmailBackup = user.email;
        const userNameBackup = user.name;

        // Cascade removal of student-owned documents
        await Profile.deleteMany({ user: userId });
        await Resume.deleteMany({ user: userId });
        await ResumeHistory.deleteMany({ user: userId });
        await CoverLetter.deleteMany({ user: userId });
        await AssessmentAttempt.deleteMany({ user: userId });
        await CourseProgress.deleteMany({ user: userId });
        await LearningPathEnrollment.deleteMany({ user: userId });
        await Roadmap.deleteMany({ user: userId });
        await SavedJob.deleteMany({ user: userId });
        await JobAlert.deleteMany({ user: userId });
        await InterviewPrep.deleteMany({ user: userId });
        await SavedPrep.deleteMany({ user: userId });
        await ChatSession.deleteMany({ user: userId });
        await StudentActivity.deleteMany({ user: userId });

        // Anonymize Job Applications so employers retain non-PII pipeline metrics
        await JobApplication.updateMany(
            { user: userId },
            {
                $set: {
                    candidateName: 'Deleted Student',
                    candidateEmail: 'deleted-user@anonymized.careercompass.local',
                    skills: [],
                    matchReason: 'Record anonymized following student account deletion request.'
                },
                $unset: { user: 1 }
            }
        );

        // Record official audit request record
        const deletionRecord = new PrivacyRequest({
            ticketId: generateTicketId(),
            user: null, // Dissociated
            userName: '[Deleted Account]',
            userEmail: userEmailBackup,
            requestType: 'data_deletion',
            subject: 'Student Account & Data Erasure Executed',
            message: reason || 'Student exercised right to erasure via student settings dashboard.',
            status: 'Completed',
            resolutionNotes: 'All student profile, resume, assessment, roadmap, and learning progress records permanently deleted. Job applications anonymized.',
            resolvedBy: 'Automated Privacy Engine',
            resolvedAt: new Date()
        });
        await deletionRecord.save();

        // Delete user record from database
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            msg: 'Your account, profile, resumes, and personal information have been completely erased from Career Compass.'
        });
    } catch (err) {
        console.error('Error in deleteStudentAccount:', err);
        res.status(500).json({ msg: 'Server error processing account deletion.' });
    }
};

// =========================================================================
// ADMIN OPERATIONS (Requires Admin Authorization)
// =========================================================================

// @desc    Get All Privacy & Support Requests (Admin)
// @route   GET /api/privacy/admin/requests
// @access  Private (Admin)
exports.getAdminPrivacyRequests = async (req, res) => {
    try {
        const { status, category, search, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status && status !== 'All') {
            query.status = status;
        }
        if (category && category !== 'All') {
            query.requestType = category;
        }
        if (search) {
            query.$or = [
                { ticketId: { $regex: search, $options: 'i' } },
                { userEmail: { $regex: search, $options: 'i' } },
                { userName: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await PrivacyRequest.countDocuments(query);
        const requests = await PrivacyRequest.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            requests,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error('Error in getAdminPrivacyRequests:', err);
        res.status(500).json({ msg: 'Server error fetching privacy requests.' });
    }
};

// @desc    Update Privacy / Support Request Status & Resolution Notes (Admin)
// @route   PUT /api/privacy/admin/requests/:id
// @access  Private (Admin)
exports.updatePrivacyRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolutionNotes, rejectionReason } = req.body;

        const privacyReq = await PrivacyRequest.findById(id);
        if (!privacyReq) {
            return res.status(404).json({ msg: 'Privacy request not found.' });
        }

        if (status) privacyReq.status = status;
        if (resolutionNotes !== undefined) privacyReq.resolutionNotes = resolutionNotes;
        if (rejectionReason !== undefined) privacyReq.rejectionReason = rejectionReason;

        if (status === 'Completed' || status === 'Rejected') {
            privacyReq.resolvedBy = req.user.name || 'Admin';
            privacyReq.resolvedAt = new Date();
        }

        await privacyReq.save();

        // Record in Admin Audit Log
        try {
            await AuditLog.create({
                admin: req.user.id,
                adminName: req.user.name || 'Admin',
                action: `Updated Privacy Request ${privacyReq.ticketId} to ${status}`,
                target: privacyReq.ticketId,
                targetType: 'PrivacyRequest',
                details: `Status: ${status}. Notes: ${resolutionNotes || rejectionReason || 'None'}`,
                ip: req.ip || '127.0.0.1'
            });
        } catch (auditErr) {
            console.error('Failed to write audit log:', auditErr);
        }

        res.json({
            success: true,
            msg: `Request ${privacyReq.ticketId} updated successfully.`,
            request: privacyReq
        });
    } catch (err) {
        console.error('Error in updatePrivacyRequestStatus:', err);
        res.status(500).json({ msg: 'Server error updating privacy request.' });
    }
};

