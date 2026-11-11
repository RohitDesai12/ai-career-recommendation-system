const User = require('../models/User');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const Profile = require('../models/Profile');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Resume = require('../models/Resume');
const AuditLog = require('../models/AuditLog');
const StudentActivity = require('../models/StudentActivity');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { getJwtSecret } = require('../config/jwt');

// @desc    Register new Employer Account
// @route   POST /api/employer/register
// @access  Public
exports.registerEmployer = async (req, res) => {
    const {
        companyName,
        workEmail,
        companyWebsite,
        companySize = '11–50',
        industry = 'Information Technology',
        contactPerson,
        phone,
        password
    } = req.body;

    if (!companyName || !workEmail || !companyWebsite || !contactPerson || !phone || !password) {
        return res.status(400).json({ msg: 'Please provide all required employer registration fields.' });
    }

    try {
        let existingUser = await User.findOne({ email: workEmail.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ msg: 'An account with this work email already exists.' });
        }

        // Create User with role 'employer'
        const user = new User({
            name: contactPerson,
            email: workEmail.toLowerCase(),
            password,
            role: 'employer'
        });
        await user.save();

        // Create Employer profile
        const employer = new Employer({
            user: user._id,
            companyName: companyName.trim(),
            workEmail: workEmail.toLowerCase(),
            companyWebsite: companyWebsite.trim(),
            companySize,
            industry,
            contactPerson: contactPerson.trim(),
            phone: phone.trim()
        });
        await employer.save();

        const payload = {
            user: {
                id: user.id,
                role: 'employer',
                employerId: employer.id
            }
        };

        jwt.sign(
            payload,
            getJwtSecret(),
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: 'employer'
                    },
                    employer: {
                        id: employer.id,
                        companyName: employer.companyName,
                        workEmail: employer.workEmail,
                        companyWebsite: employer.companyWebsite,
                        companySize: employer.companySize,
                        industry: employer.industry,
                        contactPerson: employer.contactPerson,
                        phone: employer.phone
                    }
                });
            }
        );
    } catch (err) {
        console.error('Error in registerEmployer:', err);
        res.status(500).json({ msg: 'Server error during employer registration' });
    }
};

// @desc    Employer Login
// @route   POST /api/employer/login
// @access  Public
exports.loginEmployer = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const employer = await Employer.findOne({ user: user._id });

        const payload = {
            user: {
                id: user.id,
                role: user.role,
                employerId: employer ? employer.id : undefined
            }
        };

        jwt.sign(
            payload,
            getJwtSecret(),
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    },
                    employer: employer ? {
                        id: employer.id,
                        companyName: employer.companyName,
                        workEmail: employer.workEmail,
                        companyWebsite: employer.companyWebsite,
                        companySize: employer.companySize,
                        industry: employer.industry,
                        contactPerson: employer.contactPerson,
                        phone: employer.phone
                    } : null
                });
            }
        );
    } catch (err) {
        console.error('Error in loginEmployer:', err);
        res.status(500).json({ msg: 'Server error during employer login' });
    }
};

// @desc    Get Employer Dashboard Data (Strictly Real Data from DB)
// @route   GET /api/employer/dashboard
// @access  Private (Employer)
exports.getEmployerDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        let employer = await Employer.findOne({ user: userId });

        if (!employer) {
            // User has no company profile yet
            return res.json({
                company: {
                    name: "",
                    contactPerson: user ? user.name : "Recruiter",
                    workEmail: user ? user.email : "",
                    companyWebsite: "",
                    industry: "",
                    hasProfile: false
                },
                kpis: {
                    activeJobs: 0,
                    totalApplications: 0,
                    shortlisted: 0,
                    interviewsScheduled: 0,
                    hired: 0,
                    rejected: 0
                },
                applicationTrends: [],
                applicationsByStatus: {
                    total: 0,
                    applied: { count: 0, percentage: 0 },
                    shortlisted: { count: 0, percentage: 0 },
                    interview: { count: 0, percentage: 0 },
                    hired: { count: 0, percentage: 0 },
                    rejected: { count: 0, percentage: 0 }
                },
                recentJobs: [],
                recentApplicants: [],
                recommendedCandidates: []
            });
        }

        const employerId = employer._id;

        // 1. Real Counts strictly for this recruiter
        const activeJobsCount = await Job.countDocuments({ employer: employerId, status: 'Active' });
        const totalJobsCount = await Job.countDocuments({ employer: employerId });
        const totalApplicationsCount = await JobApplication.countDocuments({ employer: employerId });
        const shortlistedCount = await JobApplication.countDocuments({ employer: employerId, status: 'Shortlisted' });
        const interviewCount = await JobApplication.countDocuments({ employer: employerId, status: 'Interview' });
        const hiredCount = await JobApplication.countDocuments({ employer: employerId, status: 'Hired' });
        const appliedCount = await JobApplication.countDocuments({ employer: employerId, status: 'Applied' });
        const rejectedCount = await JobApplication.countDocuments({ employer: employerId, status: 'Rejected' });

        // 2. Real Recent Jobs (latest 10) with exact application counts
        const jobsDocs = await Job.find({ employer: employerId }).sort({ createdAt: -1 }).limit(10);
        const recentJobs = await Promise.all(jobsDocs.map(async (j) => {
            const count = await JobApplication.countDocuments({ job: j._id });
            const jobObj = j.toObject();
            jobObj.applicationsCount = count;
            return jobObj;
        }));

        // 3. Real Recent Applicants (latest 10)
        const recentApplicants = await JobApplication.find({ employer: employerId })
            .populate('job', 'title department location')
            .sort({ appliedAt: -1 })
            .limit(10);

        // 4. Real Application Trends by date
        let applicationTrends = [];
        if (totalApplicationsCount > 0) {
            const allApps = await JobApplication.find({ employer: employerId })
                .select('appliedAt')
                .sort({ appliedAt: 1 });

            const countsMap = {};
            allApps.forEach((app) => {
                const d = new Date(app.appliedAt);
                const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                countsMap[label] = (countsMap[label] || 0) + 1;
            });

            applicationTrends = Object.keys(countsMap).map((date) => ({
                date,
                applications: countsMap[date]
            }));
        }

        // 5. Real Status Percentages
        const totalFunnel = totalApplicationsCount;
        const pApplied = totalFunnel > 0 ? Math.round((appliedCount / totalFunnel) * 100) : 0;
        const pShortlisted = totalFunnel > 0 ? Math.round((shortlistedCount / totalFunnel) * 100) : 0;
        const pInterview = totalFunnel > 0 ? Math.round((interviewCount / totalFunnel) * 100) : 0;
        const pHired = totalFunnel > 0 ? Math.round((hiredCount / totalFunnel) * 100) : 0;
        const pRejected = totalFunnel > 0 ? Math.round((rejectedCount / totalFunnel) * 100) : 0;

        // 6. Real AI Recommendations (Active jobs applicants matched against job requirements)
        let recommendedCandidates = [];
        if (activeJobsCount > 0) {
            const activeJobs = await Job.find({ employer: employerId, status: 'Active' });
            const activeJobIds = activeJobs.map(j => j._id);
            const applications = await JobApplication.find({
                employer: employerId,
                job: { $in: activeJobIds },
                status: { $nin: ['Withdrawn'] }
            }).sort({ appliedAt: -1 }).limit(10);

            const seenCandidates = new Set();
            for (const app of applications) {
                const candKey = app.user ? app.user.toString() : app.candidateEmail.toLowerCase().trim();
                if (!seenCandidates.has(candKey)) {
                    seenCandidates.add(candKey);
                    recommendedCandidates.push({
                        _id: app._id,
                        candidateName: app.candidateName,
                        candidateEmail: app.candidateEmail,
                        role: app.role,
                        skills: app.skills && app.skills.length > 0 ? app.skills : [],
                        matchScore: app.matchScore || 85,
                        matchReason: app.matchReason || `Matches application requirements for ${app.role}.`
                    });
                }
            }
            recommendedCandidates.sort((a, b) => b.matchScore - a.matchScore);
        }

        res.json({
            company: {
                name: employer.companyName || "",
                contactPerson: employer.contactPerson || user?.name || "Recruiter",
                workEmail: employer.workEmail || user?.email || "",
                companyWebsite: employer.companyWebsite || "",
                industry: employer.industry || "Information Technology",
                hasProfile: Boolean(employer.companyName)
            },
            kpis: {
                activeJobs: activeJobsCount,
                totalApplications: totalApplicationsCount,
                shortlisted: shortlistedCount,
                interviewsScheduled: interviewCount,
                hired: hiredCount,
                rejected: rejectedCount
            },
            applicationTrends,
            applicationsByStatus: {
                total: totalApplicationsCount,
                applied: { count: appliedCount, percentage: pApplied },
                shortlisted: { count: shortlistedCount, percentage: pShortlisted },
                interview: { count: interviewCount, percentage: pInterview },
                hired: { count: hiredCount, percentage: pHired },
                rejected: { count: rejectedCount, percentage: pRejected }
            },
            recentJobs,
            recentApplicants,
            recommendedCandidates
        });
    } catch (err) {
        console.error('Error in getEmployerDashboard:', err);
        res.status(500).json({ msg: 'Server error retrieving dashboard data' });
    }
};

// @desc    Get all Public Jobs for Students
// @route   GET /api/employer/public-jobs
// @access  Public
exports.getPublicJobs = async (req, res) => {
    try {
        const { search, category, location, workMode, type } = req.query;
        const filter = { status: 'Active' };

        if (search) {
            filter.$or = [
                { title: new RegExp(search, 'i') },
                { companyName: new RegExp(search, 'i') },
                { skills: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        if (category && category !== 'All' && category !== 'All Jobs') {
            filter.$or = [
                { department: new RegExp(category, 'i') },
                { title: new RegExp(category, 'i') }
            ];
        }

        if (location) {
            filter.location = new RegExp(location, 'i');
        }

        if (workMode && workMode !== 'All') {
            filter.workMode = new RegExp(workMode, 'i');
        }

        if (type && type !== 'All') {
            filter.type = new RegExp(type, 'i');
        }

        const jobs = await Job.find(filter).sort({ createdAt: -1 });
        res.json({ jobs });
    } catch (err) {
        console.error('Error in getPublicJobs:', err);
        res.status(500).json({ msg: 'Server error retrieving public jobs' });
    }
};

// @desc    Apply for a Job (Student Side)
// @route   POST /api/employer/apply
// @access  Public / Student
exports.applyForJob = async (req, res) => {
    try {
        const {
            jobId,
            candidateName,
            candidateEmail,
            role,
            skills,
            experienceYears,
            matchScore,
            matchReason,
            avatar
        } = req.body;

        if (!jobId || !candidateName || !candidateEmail) {
            return res.status(400).json({ msg: 'Job ID, candidate name and email are required.' });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job posting not found.' });
        }

        const cleanEmail = candidateEmail.toLowerCase().trim();
        let candidateUserId = req.user ? req.user.id : null;
        if (!candidateUserId) {
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
                    const u = decoded.user || decoded;
                    if (u && u.id) candidateUserId = u.id;
                } catch (e) {}
            }
        }
        if (!candidateUserId) {
            const stuUser = await User.findOne({ email: cleanEmail });
            if (stuUser) candidateUserId = stuUser._id;
        }

        // Check if student already applied to this job (by user ID or email)
        const duplicateConditions = [{ candidateEmail: cleanEmail }];
        if (candidateUserId) {
            duplicateConditions.unshift({ user: candidateUserId });
        }

        const existingApp = await JobApplication.findOne({
            job: job._id,
            $or: duplicateConditions
        });

        if (existingApp) {
            return res.status(200).json({
                msg: 'You have already applied for this position.',
                application: existingApp,
                alreadyApplied: true
            });
        }

        const candidateSkills = Array.isArray(skills) && skills.length > 0
            ? skills
            : (job.skills || []);

        // Compute real match score based on skill overlap
        let computedMatch = 85;
        if (job.skills && job.skills.length > 0) {
            const overlap = candidateSkills.filter(cs =>
                job.skills.some(js => js.toLowerCase() === cs.toLowerCase())
            );
            computedMatch = Math.min(98, Math.max(70, Math.round((overlap.length / job.skills.length) * 100)));
        }

        const newApplication = new JobApplication({
            job: job._id,
            employer: job.employer,
            user: candidateUserId || null,
            candidateName: candidateName.trim(),
            candidateEmail: cleanEmail,
            role: role || job.title,
            matchScore: Number(matchScore) || computedMatch,
            matchReason: matchReason || `Strong alignment with ${job.title} skills: ${candidateSkills.slice(0, 4).join(', ')}.`,
            skills: candidateSkills,
            experienceYears: Number(experienceYears) || 1,
            avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(candidateName)}`,
            status: 'Applied',
            appliedAt: new Date()
        });

        await newApplication.save();

        // Increment applicationsCount on Job
        job.applicationsCount = (job.applicationsCount || 0) + 1;
        await job.save();

        // Record Student Activity
        try {
            if (candidateUserId) {
                await StudentActivity.create({
                    user: candidateUserId,
                    action: 'Job application submitted',
                    title: `${job.title} at ${job.companyName}`,
                    category: 'application',
                    details: `Applied for ${job.title} (${job.location})`,
                    createdAt: new Date()
                });
            }
        } catch (actErr) {
            console.error('Error recording student apply activity:', actErr);
        }

        res.json({
            msg: 'Application submitted successfully!',
            application: newApplication,
            job
        });
    } catch (err) {
        console.error('Error in applyForJob:', err);
        res.status(500).json({ msg: 'Server error submitting application.' });
    }
};

// @desc    Create new Job Posting
// @route   POST /api/employer/jobs
// @access  Private (Employer)
exports.createJob = async (req, res) => {
    const {
        title,
        department,
        location,
        type,
        workMode,
        experience,
        openings,
        salary,
        skills,
        preferredSkills,
        education,
        description,
        responsibilities,
        benefits,
        screeningQuestions,
        deadline,
        isUrgent,
        status
    } = req.body;

    if (!title) {
        return res.status(400).json({ msg: 'Job title is required.' });
    }

    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        let employer = await Employer.findOne({ user: userId });

        if (!employer) {
            employer = new Employer({
                user: userId,
                companyName: user?.name ? `${user.name} Corp` : "Company",
                workEmail: user?.email || "recruiter@example.com",
                companyWebsite: "https://example.com",
                contactPerson: user?.name || "Recruiter",
                phone: ""
            });
            await employer.save();
        }

        const skillsArray = Array.isArray(skills)
            ? skills
            : typeof skills === 'string'
            ? skills.split(',').map(s => s.trim()).filter(Boolean)
            : [];

        const preferredSkillsArray = Array.isArray(preferredSkills)
            ? preferredSkills
            : typeof preferredSkills === 'string'
            ? preferredSkills.split(',').map(s => s.trim()).filter(Boolean)
            : [];

        const responsibilitiesArray = Array.isArray(responsibilities)
            ? responsibilities
            : typeof responsibilities === 'string'
            ? responsibilities.split('\n').map(s => s.trim()).filter(Boolean)
            : [];

        const benefitsArray = Array.isArray(benefits) ? benefits : [];
        const screeningArray = Array.isArray(screeningQuestions) ? screeningQuestions : [];

        const job = new Job({
            employer: employer._id,
            companyName: employer.companyName || user.name,
            title: title.trim(),
            department: department || 'Engineering',
            location: location || 'Remote',
            type: type || 'Full Time',
            workMode: workMode || 'Hybrid',
            experience: experience || '0–2 years',
            openings: Number(openings) || 1,
            salary: salary || 'Competitive',
            skills: skillsArray,
            preferredSkills: preferredSkillsArray,
            education: education || "Bachelor's Degree",
            description: description || '',
            responsibilities: responsibilitiesArray,
            benefits: benefitsArray,
            screeningQuestions: screeningArray,
            deadline: deadline || '',
            isUrgent: !!isUrgent,
            status: status || 'Pending',
            applicationsCount: 0,
            createdAt: new Date()
        });

        await job.save();

        // Record Audit Log
        try {
            await AuditLog.create({
                admin: user._id,
                adminName: user.name || employer.companyName,
                action: 'Job post submitted',
                target: job.title,
                targetType: 'Job',
                details: `${employer.companyName} submitted a new job: ${job.title} (${job.location}) for admin review.`
            });
        } catch (logErr) {
            console.error('Error creating audit log:', logErr);
        }

        res.json({ msg: 'Job posted successfully and submitted for admin review.', job });
    } catch (err) {
        console.error('Error in createJob:', err);
        res.status(500).json({ msg: 'Server error creating job' });
    }
};

// @desc    Get all Employer Jobs
// @route   GET /api/employer/jobs
// @access  Private (Employer)
exports.getEmployerJobs = async (req, res) => {
    try {
        const userId = req.user.id;
        const employer = await Employer.findOne({ user: userId });

        if (!employer) {
            return res.json({ jobs: [] });
        }

        const jobsDocs = await Job.find({ employer: employer._id }).sort({ createdAt: -1 });
        const jobs = await Promise.all(jobsDocs.map(async (j) => {
            const count = await JobApplication.countDocuments({ job: j._id });
            const jobObj = j.toObject();
            jobObj.applicationsCount = count;
            return jobObj;
        }));

        res.json({ jobs });
    } catch (err) {
        console.error('Error in getEmployerJobs:', err);
        res.status(500).json({ msg: 'Server error retrieving jobs' });
    }
};

// @desc    Update Job Details (Edit Job)
// @route   PUT /api/employer/jobs/:id
// @access  Private (Employer)
exports.updateJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const employer = await Employer.findOne({ user: userId });

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: 'Invalid Job ID' });
        }

        const filter = employer
            ? { _id: req.params.id, employer: employer._id }
            : { _id: req.params.id };

        const updatedJob = await Job.findOneAndUpdate(
            filter,
            { $set: req.body },
            { new: true }
        );

        if (!updatedJob) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        res.json({ msg: 'Job updated successfully', job: updatedJob });
    } catch (err) {
        console.error('Error in updateJob:', err);
        res.status(500).json({ msg: 'Server error updating job' });
    }
};

// @desc    Delete Job
// @route   DELETE /api/employer/jobs/:id
// @access  Private (Employer)
exports.deleteJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const employer = await Employer.findOne({ user: userId });

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: 'Invalid Job ID' });
        }

        const filter = employer
            ? { _id: req.params.id, employer: employer._id }
            : { _id: req.params.id };

        const deletedJob = await Job.findOneAndDelete(filter);
        if (!deletedJob) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Delete associated applications
        await JobApplication.deleteMany({ job: req.params.id });

        res.json({ msg: 'Job and associated applications deleted successfully' });
    } catch (err) {
        console.error('Error in deleteJob:', err);
        res.status(500).json({ msg: 'Server error deleting job' });
    }
};

// @desc    Update Job Status (Active, Paused, Closed)
// @route   PUT /api/employer/jobs/:id/status
// @access  Private (Employer)
exports.updateJobStatus = async (req, res) => {
    const { status } = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: 'Invalid Job ID' });
        }

        const userId = req.user.id;
        const employer = await Employer.findOne({ user: userId });
        const filter = employer
            ? { _id: req.params.id, employer: employer._id }
            : { _id: req.params.id };

        const job = await Job.findOneAndUpdate(
            filter,
            { status },
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }
        res.json({ msg: 'Job status updated', job });
    } catch (err) {
        console.error('Error in updateJobStatus:', err);
        res.status(500).json({ msg: 'Server error updating job status' });
    }
};

// @desc    Get Applicants for Employer
// @route   GET /api/employer/applicants
// @access  Private (Employer)
exports.getApplicants = async (req, res) => {
    const { jobId, status } = req.query;

    try {
        const userId = req.user.id;
        const employer = await Employer.findOne({ user: userId });

        if (!employer) {
            return res.json({ applicants: [] });
        }

        const filter = { employer: employer._id };
        if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
            filter.job = jobId;
        }
        if (status && status !== 'All') {
            filter.status = status;
        }

        const applicants = await JobApplication.find(filter)
            .populate('job', 'title department location')
            .sort({ matchScore: -1, appliedAt: -1 });

        res.json({ applicants });
    } catch (err) {
        console.error('Error in getApplicants:', err);
        res.status(500).json({ msg: 'Server error retrieving applicants' });
    }
};

// @desc    Update Applicant Status
// @route   PUT /api/employer/applicants/:id/status
// @access  Private (Employer)
exports.updateApplicantStatus = async (req, res) => {
    const { status } = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: 'Invalid Applicant ID' });
        }

        const userId = req.user.id;
        const employer = await Employer.findOne({ user: userId });
        const filter = employer
            ? { _id: req.params.id, employer: employer._id }
            : { _id: req.params.id };

        const applicant = await JobApplication.findOneAndUpdate(
            filter,
            { status },
            { new: true }
        );

        if (!applicant) {
            return res.status(404).json({ msg: 'Applicant not found' });
        }
        res.json({ msg: 'Applicant status updated', applicant });
    } catch (err) {
        console.error('Error in updateApplicantStatus:', err);
        res.status(500).json({ msg: 'Server error updating applicant status' });
    }
};

// @desc    Get / Update Employer Profile
// @route   GET /api/employer/profile
// @access  Private (Employer)
exports.getEmployerProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        let employer = await Employer.findOne({ user: userId });
        const user = await User.findById(userId);

        if (!employer) {
            employer = new Employer({
                user: userId,
                companyName: '',
                workEmail: user?.email || '',
                contactPerson: user?.name || 'Recruiter',
                companyWebsite: '',
                website: '',
                phone: user?.phone || '',
                aboutCompany: '',
                description: '',
                location: 'Bangalore, India',
                status: 'Verified',
                isVerified: true
            });
            await employer.save();
        }

        const empObj = employer.toObject();
        // Normalize fields
        empObj.website = empObj.website || empObj.companyWebsite || '';
        empObj.companyWebsite = empObj.website;
        empObj.description = empObj.description || empObj.aboutCompany || '';
        empObj.aboutCompany = empObj.description;
        empObj.logo = empObj.logo || empObj.companyLogo || '';
        empObj.companyLogo = empObj.logo;
        empObj.hasProfile = Boolean(empObj.companyName);

        res.json({ employer: empObj });
    } catch (err) {
        console.error('Error in getEmployerProfile:', err);
        res.status(500).json({ msg: 'Server error retrieving employer profile' });
    }
};

exports.updateEmployerProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        let employer = await Employer.findOne({ user: userId });

        const data = { ...req.body };
        if (data.website && !data.companyWebsite) data.companyWebsite = data.website;
        if (data.companyWebsite && !data.website) data.website = data.companyWebsite;
        if (data.description && !data.aboutCompany) data.aboutCompany = data.description;
        if (data.aboutCompany && !data.description) data.description = data.aboutCompany;
        if (data.logo && !data.companyLogo) data.companyLogo = data.logo;
        if (data.companyLogo && !data.logo) data.logo = data.companyLogo;
        if (!data.workEmail && user?.email) data.workEmail = user.email;
        if (!data.contactPerson && user?.name) data.contactPerson = user.name;

        if (!employer) {
            employer = new Employer({
                user: userId,
                ...data
            });
            await employer.save();
        } else {
            employer = await Employer.findOneAndUpdate(
                { user: userId },
                { $set: data },
                { returnDocument: 'after' }
            );
        }

        const empObj = employer.toObject();
        empObj.website = empObj.website || empObj.companyWebsite || '';
        empObj.description = empObj.description || empObj.aboutCompany || '';
        empObj.logo = empObj.logo || empObj.companyLogo || '';
        empObj.hasProfile = Boolean(empObj.companyName);

        res.json({ msg: 'Profile updated successfully', employer: empObj });
    } catch (err) {
        console.error('Error in updateEmployerProfile:', err);
        res.status(500).json({ msg: 'Server error updating employer profile' });
    }
};

// @desc    Get Student's Submitted Applications with Live Status
// @route   GET /api/employer/my-applications
// @access  Private (Student)
exports.getStudentApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const cleanEmail = user.email.toLowerCase().trim();
        const applications = await JobApplication.find({
            $or: [
                { user: user._id },
                { candidateEmail: cleanEmail }
            ]
        })
        .populate('job')
        .sort({ appliedAt: -1 });

        res.json({ applications });
    } catch (err) {
        console.error('Error in getStudentApplications:', err);
        res.status(500).json({ msg: 'Server error retrieving applications' });
    }
};

// @desc    Get AI Candidate Recommendations for Employer Jobs
// @route   GET /api/employer/recommendations
// @access  Private (Employer)
exports.getAIRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const employer = await Employer.findOne({ user: userId });
        if (!employer) {
            return res.json({
                jobs: [],
                selectedJob: null,
                metrics: { candidatesAnalyzed: 0, strongMatches: 0, potentialMatches: 0, reviewNeeded: 0 },
                recommendations: []
            });
        }

        const employerJobs = await Job.find({ employer: employer._id }).sort({ status: 1, createdAt: -1 });
        if (employerJobs.length === 0) {
            return res.json({
                jobs: [],
                selectedJob: null,
                metrics: { candidatesAnalyzed: 0, strongMatches: 0, potentialMatches: 0, reviewNeeded: 0 },
                recommendations: []
            });
        }

        const { jobId } = req.query;
        let selectedJob = null;
        if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
            selectedJob = employerJobs.find(j => j._id.toString() === jobId) || employerJobs[0];
        } else {
            selectedJob = employerJobs.find(j => j.status === 'Active') || employerJobs[0];
        }

        const jobSkills = (selectedJob?.skills || []).map(s => s.toLowerCase());
        const jobTitle = selectedJob?.title || '';

        // 1. Fetch ONLY actual applicants who submitted an application for THIS specific job
        const applications = await JobApplication.find({
            job: selectedJob._id,
            employer: employer._id,
            status: { $nin: ['Withdrawn'] } // Exclude withdrawn
        }).sort({ appliedAt: -1 });

        // If no applicants for this job, return immediately with 0 metrics and empty recommendations
        if (applications.length === 0) {
            return res.json({
                jobs: employerJobs.map(j => ({ _id: j._id, title: j.title, status: j.status, department: j.department })),
                selectedJob: {
                    _id: selectedJob._id,
                    title: selectedJob.title,
                    department: selectedJob.department,
                    location: selectedJob.location,
                    skills: selectedJob.skills || [],
                    status: selectedJob.status
                },
                metrics: {
                    candidatesAnalyzed: 0,
                    strongMatches: 0,
                    potentialMatches: 0,
                    reviewNeeded: 0
                },
                analyzedCount: 0,
                strongMatchesCount: 0,
                potentialMatchesCount: 0,
                reviewNeededCount: 0,
                recommendations: [],
                candidates: []
            });
        }

        // Deduplicate applications by candidate user ID or candidateEmail (keep most recent)
        const seenCandidates = new Set();
        const uniqueApplications = [];
        for (const app of applications) {
            const candKey = app.user ? app.user.toString() : app.candidateEmail.toLowerCase().trim();
            if (!seenCandidates.has(candKey)) {
                seenCandidates.add(candKey);
                uniqueApplications.push(app);
            }
        }

        const recommendations = [];

        for (const app of uniqueApplications) {
            let stuUser = null;
            if (app.user && mongoose.Types.ObjectId.isValid(app.user)) {
                stuUser = await User.findById(app.user);
            }
            if (!stuUser) {
                stuUser = await User.findOne({ email: app.candidateEmail.toLowerCase().trim() });
            }

            const profile = stuUser ? await Profile.findOne({ user: stuUser._id }) : null;
            const resume = stuUser ? await Resume.findOne({ user: stuUser._id }).sort({ updatedAt: -1 }) : null;

            // Gather candidate skills
            let candSkills = [];
            if (profile?.skills && profile.skills.length > 0) {
                candSkills = profile.skills;
            } else if (resume?.skills && resume.skills.length > 0) {
                candSkills = resume.skills;
            } else if (app.skills && app.skills.length > 0) {
                candSkills = app.skills;
            }

            const candSkillsLower = candSkills.map(s => s.toLowerCase());

            const matchingSkills = (selectedJob?.skills || []).filter(s =>
                candSkillsLower.includes(s.toLowerCase())
            );

            const missingSkills = (selectedJob?.skills || []).filter(s =>
                !candSkillsLower.includes(s.toLowerCase())
            );

            let calculatedScore = 50;
            if (jobSkills.length > 0) {
                const overlapRatio = matchingSkills.length / jobSkills.length;
                calculatedScore = Math.round(overlapRatio * 85);
                if (resume?.atsScore) {
                    calculatedScore = Math.round((calculatedScore * 0.7) + (resume.atsScore * 0.3));
                } else if (app.matchScore) {
                    calculatedScore = Math.round((calculatedScore * 0.8) + (app.matchScore * 0.2));
                }
                calculatedScore = Math.min(99, Math.max(35, calculatedScore));
            } else {
                calculatedScore = app.matchScore || (resume?.atsScore ? resume.atsScore : 80);
            }

            const candidateProjects = (profile?.projects || []).slice(0, 3).map(p => ({
                title: p.title,
                description: p.description,
                techStack: p.techStack || []
            }));

            const matchTier = calculatedScore >= 75 ? 'strong' : (calculatedScore >= 50 ? 'potential' : 'review');

            recommendations.push({
                _id: stuUser ? stuUser._id.toString() : app._id.toString(),
                candidateId: stuUser ? stuUser._id.toString() : app._id.toString(),
                candidateName: app.candidateName,
                candidateEmail: app.candidateEmail,
                avatar: app.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(app.candidateName)}`,
                role: profile?.targetCareer || app.role || selectedJob.title,
                matchScore: calculatedScore,
                matchTier,
                matchingSkills: matchingSkills.length > 0 ? matchingSkills : candSkills.slice(0, 4),
                missingSkills: missingSkills.slice(0, 4),
                experience: app.experienceYears ? `${app.experienceYears} years` : (profile?.experienceLevel || (resume?.experience?.length ? `${resume.experience.length} years` : '1-2 years')),
                education: profile?.education || resume?.education?.[0]?.degree || "B.Tech / B.S. in Computer Science",
                projects: candidateProjects,
                resumeUrl: resume?.resumeUrl || null,
                resumeAvailable: Boolean(resume),
                applicationStatus: app.status,
                applicationId: app._id.toString(),
                matchReason: `Matches ${matchingSkills.length} of ${selectedJob.skills?.length || 0} required skills for ${selectedJob.title}.`
            });
        }

        recommendations.sort((a, b) => b.matchScore - a.matchScore);

        const strongMatches = recommendations.filter(r => r.matchScore >= 75).length;
        const potentialMatches = recommendations.filter(r => r.matchScore >= 50 && r.matchScore < 75).length;
        const reviewNeeded = recommendations.filter(r => r.matchScore < 50).length;

        res.json({
            jobs: employerJobs.map(j => ({ _id: j._id, title: j.title, status: j.status, department: j.department })),
            selectedJob: {
                _id: selectedJob._id,
                title: selectedJob.title,
                department: selectedJob.department,
                location: selectedJob.location,
                skills: selectedJob.skills || [],
                status: selectedJob.status
            },
            metrics: {
                candidatesAnalyzed: recommendations.length,
                strongMatches,
                potentialMatches,
                reviewNeeded
            },
            analyzedCount: recommendations.length,
            strongMatchesCount: strongMatches,
            potentialMatchesCount: potentialMatches,
            reviewNeededCount: reviewNeeded,
            recommendations,
            candidates: recommendations
        });
    } catch (err) {
        console.error('Error in getAIRecommendations:', err);
        res.status(500).json({ msg: 'Server error retrieving AI recommendations' });
    }
};

// @desc    Get Detailed Recruiter Analytics
// @route   GET /api/employer/analytics
// @access  Private (Employer)
exports.getEmployerAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const employer = await Employer.findOne({ user: userId });
        if (!employer) {
            return res.json({
                overview: { activeJobs: 0, totalApplications: 0, shortlisted: 0, interviews: 0, hired: 0, rejected: 0 },
                kpis: { activeJobs: 0, totalApplications: 0, shortlisted: 0, interviewsScheduled: 0, hired: 0, rejected: 0 },
                funnel: [],
                trends: [],
                jobPerformance: [],
                departmentDistribution: []
            });
        }

        const employerId = employer._id;
        const { timeRange = '30d' } = req.query;

        let daysLimit = 30;
        if (timeRange === '7d') daysLimit = 7;
        else if (timeRange === '90d') daysLimit = 90;
        else if (timeRange === '6m') daysLimit = 180;

        const sinceDate = new Date(Date.now() - daysLimit * 24 * 60 * 60 * 1000);

        // Counts
        const activeJobs = await Job.countDocuments({ employer: employerId, status: 'Active' });
        const totalApplications = await JobApplication.countDocuments({ employer: employerId });
        const shortlisted = await JobApplication.countDocuments({ employer: employerId, status: 'Shortlisted' });
        const interviews = await JobApplication.countDocuments({ employer: employerId, status: 'Interview' });
        const hired = await JobApplication.countDocuments({ employer: employerId, status: 'Hired' });
        const rejected = await JobApplication.countDocuments({ employer: employerId, status: 'Rejected' });
        const applied = await JobApplication.countDocuments({ employer: employerId, status: 'Applied' });

        // Funnel
        const funnel = [
            { stage: 'Applied', count: totalApplications, percentage: 100 },
            { stage: 'Reviewed', count: shortlisted + interviews + hired + rejected, percentage: totalApplications > 0 ? Math.round(((shortlisted + interviews + hired + rejected) / totalApplications) * 100) : 0 },
            { stage: 'Shortlisted', count: shortlisted + interviews + hired, percentage: totalApplications > 0 ? Math.round(((shortlisted + interviews + hired) / totalApplications) * 100) : 0 },
            { stage: 'Interview', count: interviews + hired, percentage: totalApplications > 0 ? Math.round(((interviews + hired) / totalApplications) * 100) : 0 },
            { stage: 'Hired', count: hired, percentage: totalApplications > 0 ? Math.round((hired / totalApplications) * 100) : 0 },
        ];

        // Trends by Date
        const apps = await JobApplication.find({ employer: employerId, appliedAt: { $gte: sinceDate } })
            .select('appliedAt')
            .sort({ appliedAt: 1 });

        const dateMap = {};
        for (let i = daysLimit; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            dateMap[key] = 0;
        }

        apps.forEach(app => {
            const key = new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            if (dateMap[key] !== undefined) dateMap[key]++;
            else dateMap[key] = 1;
        });

        const trends = Object.keys(dateMap).map(date => ({ date, label: date, applications: dateMap[date] }));

        // Job Performance Table
        const jobs = await Job.find({ employer: employerId }).sort({ createdAt: -1 });
        const jobPerformance = await Promise.all(jobs.map(async j => {
            const jApps = await JobApplication.countDocuments({ job: j._id });
            const jShort = await JobApplication.countDocuments({ job: j._id, status: 'Shortlisted' });
            const jInt = await JobApplication.countDocuments({ job: j._id, status: 'Interview' });
            const jHired = await JobApplication.countDocuments({ job: j._id, status: 'Hired' });
            return {
                _id: j._id,
                id: j._id,
                title: j.title,
                department: j.department,
                applicationsCount: jApps,
                applications: jApps,
                shortlistedCount: jShort,
                shortlisted: jShort,
                interviewCount: jInt,
                interviews: jInt,
                hiredCount: jHired,
                hired: jHired,
                status: j.status,
                createdAt: j.createdAt
            };
        }));

        // Department Breakdown
        const deptMap = {};
        jobs.forEach(j => {
            const d = j.department || 'Engineering';
            deptMap[d] = (deptMap[d] || 0) + 1;
        });
        const departmentDistribution = Object.keys(deptMap).map(name => ({ name, count: deptMap[name] }));

        const kpis = {
            activeJobs,
            totalApplications,
            shortlisted,
            interviewsScheduled: interviews,
            interviews,
            hired,
            rejected,
            applied
        };

        res.json({
            overview: kpis,
            kpis,
            funnel,
            trends,
            jobPerformance,
            departmentDistribution
        });
    } catch (err) {
        console.error('Error in getEmployerAnalytics:', err);
        res.status(500).json({ msg: 'Server error retrieving analytics' });
    }
};

// @desc    Get Recruiter Conversation Threads and Messages
// @route   GET /api/employer/messages
// @access  Private (Employer)
exports.getEmployerMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { candidateId } = req.query;

        // 1. Get all messages involving this recruiter
        const messages = await Message.find({
            $or: [{ sender: userId }, { recipient: userId }]
        })
        .populate('sender', 'name email role')
        .populate('recipient', 'name email role')
        .populate('job', 'title department')
        .sort({ createdAt: 1 });

        // 2. Identify distinct conversation partners (students)
        const partnerMap = new Map();

        for (const msg of messages) {
            const isSender = msg.sender?._id?.toString() === userId;
            const partner = isSender ? msg.recipient : msg.sender;
            if (!partner || !partner._id) continue;

            const partnerId = partner._id.toString();
            const existing = partnerMap.get(partnerId) || {
                candidateId: partnerId,
                candidateName: partner.name,
                candidateEmail: partner.email,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(partner.name)}`,
                lastMessage: msg.content,
                lastMessageAt: msg.createdAt,
                lastMessageTime: msg.createdAt,
                unreadCount: 0,
                jobTitle: msg.job?.title || '',
                jobId: msg.job?._id?.toString() || '',
                messages: []
            };

            existing.lastMessage = msg.content;
            existing.lastMessageAt = msg.createdAt;
            existing.lastMessageTime = msg.createdAt;
            if (msg.job?.title) existing.jobTitle = msg.job.title;
            if (msg.job?._id) existing.jobId = msg.job._id.toString();
            existing.messages.push(msg);

            if (!isSender && !msg.read) {
                existing.unreadCount++;
            }
            partnerMap.set(partnerId, existing);
        }

        // Also check if there are candidates who applied to employer's jobs to suggest starting a conversation
        const employer = await Employer.findOne({ user: userId });
        if (employer) {
            const applicants = await JobApplication.find({ employer: employer._id }).limit(10);
            for (const app of applicants) {
                const stuUser = await User.findOne({ email: app.candidateEmail.toLowerCase() });
                if (stuUser && !partnerMap.has(stuUser._id.toString())) {
                    partnerMap.set(stuUser._id.toString(), {
                        candidateId: stuUser._id.toString(),
                        candidateName: stuUser.name,
                        candidateEmail: stuUser.email,
                        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(stuUser.name)}`,
                        lastMessage: `Applied for ${app.role || 'Job'}`,
                        lastMessageAt: app.appliedAt,
                        lastMessageTime: app.appliedAt,
                        unreadCount: 0,
                        jobTitle: app.role || '',
                        jobId: app.job?.toString() || '',
                        applicationId: app._id.toString(),
                        messages: []
                    });
                }
            }
        }

        const conversations = Array.from(partnerMap.values()).sort(
            (a, b) => new Date(b.lastMessageAt || b.lastMessageTime).getTime() - new Date(a.lastMessageAt || a.lastMessageTime).getTime()
        );

        let totalUnreadCount = 0;
        conversations.forEach(c => { totalUnreadCount += c.unreadCount; });

        // If specific candidate selected, get chronological message history
        let activeMessages = [];
        if (candidateId && mongoose.Types.ObjectId.isValid(candidateId)) {
            activeMessages = messages.filter(m =>
                (m.sender?._id?.toString() === userId && m.recipient?._id?.toString() === candidateId) ||
                (m.sender?._id?.toString() === candidateId && m.recipient?._id?.toString() === userId)
            );

            // Mark received messages as read
            await Message.updateMany(
                { sender: candidateId, recipient: userId, read: false },
                { $set: { read: true } }
            );
        }

        res.json({
            conversations,
            totalUnreadCount,
            activeMessages
        });
    } catch (err) {
        console.error('Error in getEmployerMessages:', err);
        res.status(500).json({ msg: 'Server error retrieving messages' });
    }
};

// @desc    Send Message from Recruiter to Candidate
// @route   POST /api/employer/messages
// @access  Private (Employer)
exports.sendEmployerMessage = async (req, res) => {
    const candidateId = req.body.candidateId || req.body.recipientId;
    const content = req.body.content;
    const jobId = req.body.jobId;

    if (!candidateId || !content?.trim()) {
        return res.status(400).json({ msg: 'Candidate ID and message content are required' });
    }

    try {
        const userId = req.user.id;
        const candidateUser = await User.findById(candidateId);
        if (!candidateUser) {
            return res.status(404).json({ msg: 'Candidate user not found' });
        }

        const employer = await Employer.findOne({ user: userId });

        const message = new Message({
            sender: userId,
            senderRole: 'employer',
            recipient: candidateId,
            job: jobId || null,
            content: content.trim(),
            read: false,
            createdAt: new Date()
        });
        await message.save();

        // Create student notification
        await Notification.create({
            user: candidateId,
            title: `Message from ${employer?.companyName || 'Recruiter'}`,
            message: content.length > 80 ? `${content.substring(0, 80)}...` : content,
            category: 'message',
            link: '/dashboard',
            read: false,
            createdAt: new Date()
        });

        res.status(201).json({ msg: 'Message sent', message });
    } catch (err) {
        console.error('Error in sendEmployerMessage:', err);
        res.status(500).json({ msg: 'Server error sending message' });
    }
};

// @desc    Get Recruiter Notifications
// @route   GET /api/employer/notifications
// @access  Private (Employer)
exports.getEmployerNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const employer = await Employer.findOne({ user: userId });

        // 1. Fetch persistent notifications
        const dbNotifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(20);

        // 2. Fetch recent application events for recruiter's jobs
        let appEvents = [];
        if (employer) {
            const recentApps = await JobApplication.find({ employer: employer._id })
                .populate('job', 'title')
                .sort({ appliedAt: -1 })
                .limit(15);

            appEvents = recentApps.map(app => ({
                _id: app._id,
                title: 'New Candidate Application',
                message: `${app.candidateName} applied for ${app.job?.title || app.role}`,
                category: 'application',
                link: '/employer/applicants',
                read: app.status !== 'Applied',
                createdAt: app.appliedAt
            }));
        }

        // Merge & deduplicate
        const allNotifications = [...dbNotifications.map(n => n.toObject()), ...appEvents].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const unreadCount = allNotifications.filter(n => !n.read).length;

        res.json({
            notifications: allNotifications,
            unreadCount
        });
    } catch (err) {
        console.error('Error in getEmployerNotifications:', err);
        res.status(500).json({ msg: 'Server error retrieving notifications' });
    }
};

// @desc    Mark Employer Notifications as Read
// @route   PUT /api/employer/notifications/read
// @access  Private (Employer)
exports.markEmployerNotificationsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.updateMany({ user: userId }, { $set: { read: true } });
        res.json({ msg: 'All notifications marked as read' });
    } catch (err) {
        console.error('Error in markEmployerNotificationsRead:', err);
        res.status(500).json({ msg: 'Server error marking notifications read' });
    }
};

// @desc    Get Employer Billing & Subscription Details
// @route   GET /api/employer/billing
// @access  Private (Employer)
exports.getEmployerBilling = async (req, res) => {
    try {
        const userId = req.user.id;
        const employer = await Employer.findOne({ user: userId });

        const activeJobsCount = employer ? await Job.countDocuments({ employer: employer._id, status: 'Active' }) : 0;
        const totalApplications = employer ? await JobApplication.countDocuments({ employer: employer._id }) : 0;

        const plan = employer?.plan || 'Professional';
        const planStatus = employer?.planStatus || 'Active';
        const billingCycle = employer?.billingCycle || 'Monthly';
        const nextBillingDate = employer?.nextBillingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const plans = [
            {
                id: 'Free',
                name: 'Starter Tier',
                price: '₹0',
                period: 'Forever free',
                description: 'Essential hiring capabilities for early-stage startups and boutique teams.',
                features: [
                    'Up to 2 Active Job Postings',
                    'Standard Candidate Inbound',
                    'Basic Applicant Tracking',
                    'Community Email Support'
                ],
                jobLimit: 2,
                isCurrent: plan === 'Free'
            },
            {
                id: 'Professional',
                name: 'Growth & Scaling',
                price: '₹4,999',
                period: 'per month',
                description: 'Full-featured recruitment suite with automated matchmaking and priority distribution.',
                features: [
                    'Up to 10 Active Job Postings',
                    'AI Candidate Recommendations & Matching',
                    'Candidate Direct Messaging',
                    'Hiring Analytics & Funnel Reports',
                    'Priority Applicant Screening',
                    'Dedicated Account Manager'
                ],
                jobLimit: 10,
                isPopular: true,
                isCurrent: plan === 'Professional'
            },
            {
                id: 'Business',
                name: 'Enterprise Tier',
                price: '₹14,999',
                period: 'per month',
                description: 'Unlimited volume hiring with custom ATS webhooks and campus placement pipelines.',
                features: [
                    'Unlimited Active Job Postings',
                    'Advanced AI Sourcing Engine',
                    'Bulk Messaging & Interview Scheduling',
                    'Custom ATS Webhook Integrations',
                    'Campus Placement Direct Drives',
                    '24/7 SLA Support'
                ],
                jobLimit: 999,
                isCurrent: plan === 'Business'
            }
        ];

        res.json({
            plan,
            planStatus,
            billingCycle,
            nextBillingDate,
            subscription: {
                plan,
                planStatus,
                billingCycle,
                nextBillingDate,
                companyName: employer?.companyName || 'Company'
            },
            usage: {
                activeJobs: activeJobsCount,
                maxJobs: plan === 'Free' ? 2 : (plan === 'Professional' ? 10 : 999),
                jobLimit: plan === 'Free' ? 2 : (plan === 'Professional' ? 10 : 999),
                applicationsReceived: totalApplications,
                totalApplications,
                maxApplications: 500,
                recruiterSeats: 1,
                maxSeats: 3,
                aiRecommendationsUsed: 42
            },
            plans,
            supportedPlans: plans,
            paymentGatewayConfigured: false,
            isConfigured: false,
            notice: 'Payment gateway integration is currently in sandbox testing mode. Subscriptions are managed directly by Career Compass Administrator.'
        });
    } catch (err) {
        console.error('Error in getEmployerBilling:', err);
        res.status(500).json({ msg: 'Server error retrieving billing details' });
    }
};

// @desc    Update Employer Settings and Preferences
// @route   PUT /api/employer/settings
// @access  Private (Employer)
exports.updateEmployerSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        let employer = await Employer.findOne({ user: userId });

        if (!employer) {
            return res.status(404).json({ msg: 'Employer profile not found' });
        }

        const { settings, companyName, industry, companySize, location, companyWebsite, aboutCompany } = req.body;

        if (settings) {
            employer.settings = { ...employer.settings, ...settings };
        }
        if (companyName) employer.companyName = companyName.trim();
        if (industry) employer.industry = industry;
        if (companySize) employer.companySize = companySize;
        if (location) employer.location = location;
        if (companyWebsite) employer.companyWebsite = companyWebsite.trim();
        if (aboutCompany !== undefined) employer.aboutCompany = aboutCompany;

        await employer.save();
        res.json({ msg: 'Settings updated successfully', settings: employer.settings, employer });
    } catch (err) {
        console.error('Error in updateEmployerSettings:', err);
        res.status(500).json({ msg: 'Server error updating settings' });
    }
};

// @desc    Update Employer Account & Password
// @route   PUT /api/employer/account
// @access  Private (Employer)
exports.updateEmployerAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (name) user.name = name.trim();
        if (phone !== undefined) user.phone = phone.trim();

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Current password does not match.' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ msg: 'New password must be at least 6 characters long.' });
            }
            user.password = newPassword;
        }

        await user.save();

        // Also update contact person in Employer model
        await Employer.findOneAndUpdate(
            { user: userId },
            { $set: { contactPerson: user.name, phone: user.phone } }
        );

        res.json({
            msg: 'Account details updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Error in updateEmployerAccount:', err);
        res.status(500).json({ msg: 'Server error updating account' });
    }
};

