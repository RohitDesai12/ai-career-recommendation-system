const User = require('../models/User');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const Profile = require('../models/Profile');
const InterviewPrep = require('../models/InterviewPrep');
const Resource = require('../models/Resource');
const AuditLog = require('../models/AuditLog');
const Report = require('../models/Report');
const JobAlert = require('../models/JobAlert');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getMlServiceUrl } = require('../config/mlConfig');

// Helper to log admin actions
async function recordAudit(adminId, adminName, action, target, targetType, details) {
    try {
        await AuditLog.create({
            admin: adminId,
            adminName: adminName || 'System Admin',
            action,
            target,
            targetType,
            details,
            createdAt: new Date()
        });
    } catch (err) {
        console.error('AuditLog error:', err.message);
    }
}

// @desc    Get complete Admin Dashboard overview stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // 1. Core Counts
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const activeJobs = await Job.countDocuments({ status: 'Active' });
        const totalApplications = await JobApplication.countDocuments();

        // 2. Pending Approvals Counters
        const pendingReports = await Report.countDocuments({ status: 'Pending' });
        const pendingUserVerifications = await User.countDocuments({ isVerified: false, role: { $ne: 'admin' } });

        // 3. Month-over-Month Growth Calculation
        const usersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        const usersPrevMonth = await User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
        const userGrowthPct = usersPrevMonth > 0 ? Math.round(((usersThisMonth - usersPrevMonth) / usersPrevMonth) * 100) : (usersThisMonth > 0 ? 100 : 0);

        const jobsThisMonth = await Job.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        const jobsPrevMonth = await Job.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
        const jobGrowthPct = jobsPrevMonth > 0 ? Math.round(((jobsThisMonth - jobsPrevMonth) / jobsPrevMonth) * 100) : (jobsThisMonth > 0 ? 100 : 0);

        const appsThisMonth = await JobApplication.countDocuments({ appliedAt: { $gte: thirtyDaysAgo } });
        const appsPrevMonth = await JobApplication.countDocuments({ appliedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } });
        const appGrowthPct = appsPrevMonth > 0 ? Math.round(((appsThisMonth - appsPrevMonth) / appsPrevMonth) * 100) : (appsThisMonth > 0 ? 100 : 0);

        // 4. Platform Growth Chart (Last 6 months real timeline)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const growthChart = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const label = monthNames[d.getMonth()];

            const uCount = await User.countDocuments({ createdAt: { $lt: nextMonth } });
            const jCount = await Job.countDocuments({ createdAt: { $lt: nextMonth } });
            const aCount = await JobApplication.countDocuments({ appliedAt: { $lt: nextMonth } });

            growthChart.push({
                month: label,
                users: uCount,
                jobs: jCount,
                applications: aCount
            });
        }

        // 5. User Distribution
        const userDistribution = {
            total: totalStudents + totalAdmins,
            students: totalStudents,
            admins: totalAdmins
        };

        const recentPendingJobs = []

        // 7. Recent Activities (from AuditLog)
        const recentActivities = await AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(8);

        res.json({
            metrics: {
                totalUsers,
                totalStudents,
                activeJobs,
                totalApplications,
                userGrowthPct: userGrowthPct >= 0 ? `+${userGrowthPct}%` : `${userGrowthPct}%`,
                jobGrowthPct: jobGrowthPct >= 0 ? `+${jobGrowthPct}%` : `${jobGrowthPct}%`,
                appGrowthPct: appGrowthPct >= 0 ? `+${appGrowthPct}%` : `${appGrowthPct}%`
            },
            pendingApprovals: {
                reportedContent: pendingReports,
                userVerifications: pendingUserVerifications
            },
            platformGrowth: growthChart,
            userDistribution,
            recentPendingJobs,
            recentActivities
        });
    } catch (err) {
        console.error('Error in getAdminDashboard:', err);
        res.status(500).json({ msg: 'Server error retrieving admin dashboard stats' });
    }
};

// @desc    Get all users with search, role and status filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const { search, role, status, page = 1, limit = 50 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        if (role && role !== 'All') {
            query.role = role.toLowerCase();
        } else {
            query.role = { $in: ['student', 'admin'] };
        }

        if (status && status !== 'All') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            users,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error('Error in getAllUsers:', err);
        res.status(500).json({ msg: 'Server error retrieving users' });
    }
};

// @desc    Update user status (Active, Suspended, Pending) or verify user
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, isVerified, role } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (isVerified !== undefined) updateData.isVerified = !!isVerified;
        if (role) updateData.role = role;

        const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        await recordAudit(
            req.user.id,
            req.user.name,
            `User status updated to ${status || (isVerified ? 'Verified' : 'Updated')}`,
            user.email,
            'User',
            `Admin updated user ${user.name} (${user.email}) status to ${status || 'verified'}.`
        );

        res.json({ msg: 'User updated successfully', user });
    } catch (err) {
        console.error('Error in updateUserStatus:', err);
        res.status(500).json({ msg: 'Server error updating user status' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Clean up associated profile and employer
        await Profile.deleteOne({ user: id });
        await Employer.deleteOne({ user: id });

        await recordAudit(
            req.user.id,
            req.user.name,
            'User deleted',
            user.email,
            'User',
            `Admin deleted account ${user.name} (${user.email}).`
        );

        res.json({ msg: 'User and associated profiles deleted successfully' });
    } catch (err) {
        console.error('Error in deleteUser:', err);
        res.status(500).json({ msg: 'Server error deleting user' });
    }
};

// @desc    Get all companies (Decommissioned)
// @route   GET /api/admin/companies
// @access  Private (Admin)
exports.getAllCompanies = async (req, res) => {
    return res.status(410).json({ msg: 'Company and Recruiter management have been discontinued.', companies: [], total: 0 });
};

// @desc    Update company verification status (Decommissioned)
// @route   PUT /api/admin/companies/:id/status
// @access  Private (Admin)
exports.updateCompanyStatus = async (req, res) => {
    return res.status(410).json({ msg: 'Company and Recruiter management have been discontinued.' });
};

// @desc    Get all platform jobs with filtering
// @route   GET /api/admin/jobs
// @access  Private (Admin)
exports.getAllJobs = async (req, res) => {
    try {
        const { search, status, department, workMode } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { companyName: new RegExp(search, 'i') },
                { location: new RegExp(search, 'i') },
                { skills: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        if (status && status !== 'All') {
            query.status = status;
        }

        if (department && department !== 'All') {
            query.department = new RegExp(department, 'i');
        }

        if (workMode && workMode !== 'All') {
            query.workMode = new RegExp(workMode, 'i');
        }

        const jobsDocs = await Job.find(query)
            .populate('employer', 'companyName workEmail companyWebsite isVerified status')
            .sort({ createdAt: -1 });

        const jobs = await Promise.all(jobsDocs.map(async (j) => {
            const count = await JobApplication.countDocuments({ job: j._id });
            const obj = j.toObject();
            obj.applicationsCount = count;
            return obj;
        }));

        const total = jobs.length;
        const pendingCount = await Job.countDocuments({ status: 'Pending' });
        const activeCount = await Job.countDocuments({ status: 'Active' });
        const pausedCount = await Job.countDocuments({ status: 'Paused' });
        const closedCount = await Job.countDocuments({ status: 'Closed' });

        res.json({
            jobs,
            total,
            pendingCount,
            activeCount,
            pausedCount,
            closedCount
        });
    } catch (err) {
        console.error('Error in getAllJobs:', err);
        res.status(500).json({ msg: 'Server error retrieving jobs' });
    }
};

// @desc    Update Job Status (Approve, Reject, Pause, Close)
// @route   PUT /api/admin/jobs/:id/status
// @access  Private (Admin)
exports.updateJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'Active', 'Paused', 'Closed', 'Draft', 'Rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid job status' });
        }

        const job = await Job.findByIdAndUpdate(id, { status }, { new: true });
        if (!job) {
            return res.status(404).json({ msg: 'Job posting not found' });
        }

        const actionName = status === 'Active' ? 'Job approved' : (status === 'Rejected' ? 'Job rejected' : `Job status changed to ${status}`);

        await recordAudit(
            req.user.id,
            req.user.name,
            actionName,
            job.title,
            'Job',
            `Admin changed job ${job.title} (${job.companyName}) status to ${status}.`
        );

        res.json({ msg: `Job successfully ${status === 'Active' ? 'approved and made live' : status.toLowerCase()}`, job });
    } catch (err) {
        console.error('Error in updateJobStatus:', err);
        res.status(500).json({ msg: 'Server error updating job status' });
    }
};

// @desc    Delete Job
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin)
exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findByIdAndDelete(id);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Delete associated applications
        await JobApplication.deleteMany({ job: id });

        await recordAudit(
            req.user.id,
            req.user.name,
            'Job deleted',
            job.title,
            'Job',
            `Admin deleted job post ${job.title} from ${job.companyName}.`
        );

        res.json({ msg: 'Job and associated applications deleted successfully' });
    } catch (err) {
        console.error('Error in deleteJob:', err);
        res.status(500).json({ msg: 'Server error deleting job' });
    }
};

// @desc    Get all applications across platform
// @route   GET /api/admin/applications
// @access  Private (Admin)
exports.getAllApplications = async (req, res) => {
    try {
        const { search, status } = req.query;
        const query = {};

        if (status && status !== 'All') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { candidateName: new RegExp(search, 'i') },
                { candidateEmail: new RegExp(search, 'i') },
                { role: new RegExp(search, 'i') }
            ];
        }

        const applications = await JobApplication.find(query)
            .populate('job', 'title companyName location salary status')
            .populate('employer', 'companyName workEmail companyWebsite')
            .sort({ appliedAt: -1 });

        res.json({ applications, total: applications.length });
    } catch (err) {
        console.error('Error in getAllApplications:', err);
        res.status(500).json({ msg: 'Server error retrieving applications' });
    }
};

// @desc    Get platform Job Alert stats and rules
// @route   GET /api/admin/job-alerts
// @access  Private (Admin)
exports.getJobAlertStats = async (req, res) => {
    try {
        const alerts = await JobAlert.find().sort({ createdAt: -1 });
        const activeAlerts = await JobAlert.countDocuments({ isActive: true });
        
        let totalTriggered = 0;
        let totalSent = 0;
        let totalFailed = 0;

        alerts.forEach(a => {
            totalTriggered += (a.triggeredCount || 0);
            totalSent += (a.notificationsSent || 0);
            totalFailed += (a.failedNotifications || 0);
        });

        res.json({
            stats: {
                activeAlerts,
                totalAlerts: alerts.length,
                alertsTriggered: totalTriggered,
                notificationsSent: totalSent,
                failedNotifications: totalFailed
            },
            alerts
        });
    } catch (err) {
        console.error('Error in getJobAlertStats:', err);
        res.status(500).json({ msg: 'Server error retrieving job alert stats' });
    }
};

// @desc    Create/Trigger Job Alert Rule
// @route   POST /api/admin/job-alerts
// @access  Private (Admin)
exports.createJobAlert = async (req, res) => {
    try {
        const { title, userEmail, keywords, location, frequency } = req.body;
        const alert = new JobAlert({
            userEmail: userEmail || 'admin-system@careercompass.com',
            title: title || 'New Tech Roles Alert',
            keywords: Array.isArray(keywords) ? keywords : (typeof keywords === 'string' ? keywords.split(',') : ['Engineering']),
            location: location || 'Any',
            frequency: frequency || 'Daily',
            isActive: true,
            createdAt: new Date()
        });
        await alert.save();
        res.json({ msg: 'Job alert rule created', alert });
    } catch (err) {
        console.error('Error in createJobAlert:', err);
        res.status(500).json({ msg: 'Server error creating job alert' });
    }
};

// @desc    Get Content Management (Interview Q&As, Courses, Skills, Resources)
// @route   GET /api/admin/content
// @access  Private (Admin)
exports.getContentManagement = async (req, res) => {
    try {
        const interviewPreps = await InterviewPrep.find().sort({ createdAt: -1 });
        const resources = await Resource.find().sort({ createdAt: -1 });
        
        // Extract distinct skill tags from active jobs & profiles
        const jobs = await Job.find().select('skills department title');
        const profiles = await Profile.find().select('skills recommendedCareers targetCareer');

        const skillsSet = new Set();
        jobs.forEach(j => (j.skills || []).forEach(s => skillsSet.add(s)));
        profiles.forEach(p => (p.skills || []).forEach(s => skillsSet.add(s)));
        resources.forEach(r => { if (r.skill) skillsSet.add(r.skill); });

        const careerPathsSet = new Set();
        jobs.forEach(j => { if (j.title) careerPathsSet.add(j.title); });
        profiles.forEach(p => {
            (p.recommendedCareers || []).forEach(c => { if (c.title) careerPathsSet.add(c.title); });
            if (p.targetCareer) careerPathsSet.add(p.targetCareer);
        });

        res.json({
            interviewPreps,
            totalInterviewPreps: interviewPreps.length,
            resources,
            totalResources: resources.length,
            skills: Array.from(skillsSet),
            totalSkills: skillsSet.size,
            careerPaths: Array.from(careerPathsSet),
            totalCareerPaths: careerPathsSet.size
        });
    } catch (err) {
        console.error('Error in getContentManagement:', err);
        res.status(500).json({ msg: 'Server error retrieving content' });
    }
};

// @desc    Create/Save Content Item (Interview Prep Guide)
// @route   POST /api/admin/content
// @access  Private (Admin)
exports.createContentItem = async (req, res) => {
    try {
        const { company, role, salaryRange, requiredSkills, selectionProcess, interviewQuestions } = req.body;
        if (!company || !role) {
            return res.status(400).json({ msg: 'Company and Role are required' });
        }

        const prep = new InterviewPrep({
            company: company.trim(),
            role: role.trim(),
            salaryRange: salaryRange || 'Competitive',
            requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
            selectionProcess: selectionProcess || '1. Online Assessment\n2. Technical Round\n3. System Design\n4. HR Discussion',
            interviewQuestions: Array.isArray(interviewQuestions) ? interviewQuestions : []
        });

        await prep.save();

        await recordAudit(
            req.user.id,
            req.user.name,
            'Content created',
            `${company} - ${role}`,
            'Content',
            `Admin created interview prep content guide for ${company} (${role}).`
        );

        res.json({ msg: 'Content created successfully', prep });
    } catch (err) {
        console.error('Error in createContentItem:', err);
        res.status(500).json({ msg: 'Server error creating content' });
    }
};

// @desc    Delete Content Item
// @route   DELETE /api/admin/content/:id
// @access  Private (Admin)
exports.deleteContentItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await InterviewPrep.findByIdAndDelete(id);
        if (!item) {
            return res.status(404).json({ msg: 'Content item not found' });
        }

        await recordAudit(
            req.user.id,
            req.user.name,
            'Content deleted',
            `${item.company} - ${item.role}`,
            'Content',
            `Admin deleted interview prep content for ${item.company}.`
        );

        res.json({ msg: 'Content deleted successfully' });
    } catch (err) {
        console.error('Error in deleteContentItem:', err);
        res.status(500).json({ msg: 'Server error deleting content' });
    }
};

// @desc    Create Admin Resource
// @route   POST /api/admin/resources
// @access  Private (Admin)
exports.createAdminResource = async (req, res) => {
    try {
        const { title, provider, description, url, resourceType, skill, career, difficulty, duration, isFree, rating } = req.body;
        if (!title || !provider || !url || !skill) {
            return res.status(400).json({ msg: 'Title, provider, URL, and skill are required' });
        }

        const resource = new Resource({
            title: title.trim(),
            provider: provider.trim(),
            description: description || '',
            url: url.trim(),
            resourceType: resourceType || 'Course',
            skill: skill.trim(),
            career: career || 'General',
            difficulty: difficulty || 'Beginner',
            duration: duration || '4 Weeks',
            isFree: isFree !== undefined ? Boolean(isFree) : true,
            rating: Number(rating) || 4.8,
            isVerified: true,
            isActive: true
        });

        await resource.save();
        await recordAudit(req.user.id, req.user.name, 'Resource created', resource.title, 'Content', `Admin added learning resource: ${resource.title}`);
        res.status(201).json({ msg: 'Resource created successfully', resource });
    } catch (err) {
        console.error('Error in createAdminResource:', err);
        res.status(500).json({ msg: 'Server error creating resource' });
    }
};

// @desc    Update Admin Resource
// @route   PUT /api/admin/resources/:id
// @access  Private (Admin)
exports.updateAdminResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
        if (!resource) return res.status(404).json({ msg: 'Resource not found' });

        await recordAudit(req.user.id, req.user.name, 'Resource updated', resource.title, 'Content', `Admin updated resource: ${resource.title}`);
        res.json({ msg: 'Resource updated successfully', resource });
    } catch (err) {
        console.error('Error in updateAdminResource:', err);
        res.status(500).json({ msg: 'Server error updating resource' });
    }
};

// @desc    Delete Admin Resource
// @route   DELETE /api/admin/resources/:id
// @access  Private (Admin)
exports.deleteAdminResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);
        if (!resource) return res.status(404).json({ msg: 'Resource not found' });

        await recordAudit(req.user.id, req.user.name, 'Resource deleted', resource.title, 'Content', `Admin deleted resource: ${resource.title}`);
        res.json({ msg: 'Resource deleted successfully' });
    } catch (err) {
        console.error('Error in deleteAdminResource:', err);
        res.status(500).json({ msg: 'Server error deleting resource' });
    }
};

// @desc    Get AI & Recommendation Telemetry
// @route   GET /api/admin/ai-stats
// @access  Private (Admin)
exports.getAIStats = async (req, res) => {
    try {
        const profiles = await Profile.find();
        const totalProfiles = profiles.length;

        let atsScores = [];
        let recommendedCareersMap = {};
        let skillsMap = {};

        profiles.forEach(p => {
            if (p.resumeData && p.resumeData.atsScore) {
                atsScores.push(p.resumeData.atsScore);
            }
            if (Array.isArray(p.recommendedCareers)) {
                p.recommendedCareers.forEach(c => {
                    if (c.title) {
                        recommendedCareersMap[c.title] = (recommendedCareersMap[c.title] || 0) + 1;
                    }
                });
            }
            if (Array.isArray(p.skills)) {
                p.skills.forEach(s => {
                    skillsMap[s] = (skillsMap[s] || 0) + 1;
                });
            }
        });

        const avgAtsScore = atsScores.length > 0 ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length) : 82;
        
        const topCareers = Object.keys(recommendedCareersMap)
            .map(title => ({ title, count: recommendedCareersMap[title] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topSkills = Object.keys(skillsMap)
            .map(skill => ({ skill, count: skillsMap[skill] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        res.json({
            totalProfilesAnalyzed: totalProfiles,
            totalAtsScans: atsScores.length,
            avgAtsScore,
            topRecommendedCareers: topCareers,
            topSkills,
            recommendationEngineStatus: 'Healthy'
        });
    } catch (err) {
        console.error('Error in getAIStats:', err);
        res.status(500).json({ msg: 'Server error retrieving AI telemetry' });
    }
};

// @desc    Get Platform Analytics with time filter (7d, 30d, 3m, 6m, 1y)
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getPlatformAnalytics = async (req, res) => {
    try {
        const { range = '30d' } = req.query;
        const now = new Date();
        let days = 30;
        if (range === '7d') days = 7;
        if (range === '3m') days = 90;
        if (range === '6m') days = 180;
        if (range === '1y') days = 365;

        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const users = await User.find({ createdAt: { $gte: startDate } }).select('createdAt role');
        const jobs = await Job.find({ createdAt: { $gte: startDate } }).select('createdAt department status');
        const applications = await JobApplication.find({ appliedAt: { $gte: startDate } }).select('appliedAt status');

        // Group by day/interval
        const timelineMap = {};
        const stepDays = days <= 7 ? 1 : (days <= 30 ? 2 : (days <= 90 ? 7 : 14));

        for (let t = startDate.getTime(); t <= now.getTime(); t += stepDays * 24 * 60 * 60 * 1000) {
            const d = new Date(t);
            const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            timelineMap[label] = { date: label, users: 0, jobs: 0, applications: 0 };
        }

        users.forEach(u => {
            const label = new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            if (timelineMap[label]) timelineMap[label].users += 1;
        });

        jobs.forEach(j => {
            const label = new Date(j.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            if (timelineMap[label]) timelineMap[label].jobs += 1;
        });

        applications.forEach(a => {
            const label = new Date(a.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            if (timelineMap[label]) timelineMap[label].applications += 1;
        });

        res.json({
            range,
            totalUsersInRange: users.length,
            totalJobsInRange: jobs.length,
            totalAppsInRange: applications.length,
            timeline: Object.values(timelineMap)
        });
    } catch (err) {
        console.error('Error in getPlatformAnalytics:', err);
        res.status(500).json({ msg: 'Server error retrieving analytics' });
    }
};

// @desc    Get moderation reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.getReports = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status && status !== 'All') {
            query.status = status;
        }

        const reports = await Report.find(query).sort({ createdAt: -1 });
        res.json({ reports, total: reports.length });
    } catch (err) {
        console.error('Error in getReports:', err);
        res.status(500).json({ msg: 'Server error retrieving reports' });
    }
};

// @desc    Submit a moderation report (Students, Recruiters or Admin)
// @route   POST /api/admin/reports
// @access  Public / Private
exports.createReport = async (req, res) => {
    try {
        const { reportedItem, itemType, itemId, reason, details, reporterName, reporterEmail } = req.body;
        if (!reportedItem || !itemType || !reason) {
            return res.status(400).json({ msg: 'Reported item, type, and reason are required' });
        }

        const report = new Report({
            reporter: req.user?.id,
            reporterName: reporterName || req.user?.name || 'Anonymous',
            reporterEmail: reporterEmail || req.user?.email || '',
            reportedItem,
            itemType,
            itemId: itemId || '',
            reason,
            details: details || '',
            status: 'Pending',
            createdAt: new Date()
        });

        await report.save();

        await recordAudit(
            req.user?.id,
            reporterName || 'User',
            `Report submitted for ${itemType}`,
            reportedItem,
            'Report',
            `Report lodged for ${itemType} (${reportedItem}) due to: ${reason}`
        );

        res.json({ msg: 'Report submitted successfully. Our safety team will review it.', report });
    } catch (err) {
        console.error('Error in createReport:', err);
        res.status(500).json({ msg: 'Server error submitting report' });
    }
};

// @desc    Resolve / Dismiss Report
// @route   PUT /api/admin/reports/:id
// @access  Private (Admin)
exports.resolveReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolutionNotes, actionTaken } = req.body;

        const report = await Report.findByIdAndUpdate(id, {
            status: status || 'Resolved',
            resolutionNotes: resolutionNotes || '',
            resolvedBy: req.user.name || 'Admin',
            resolvedAt: new Date()
        }, { new: true });

        if (!report) {
            return res.status(404).json({ msg: 'Report not found' });
        }

        await recordAudit(
            req.user.id,
            req.user.name,
            `Report ${status || 'Resolved'}`,
            report.reportedItem,
            'Report',
            `Admin ${req.user.name} resolved report on ${report.itemType} (${report.reportedItem}). Action: ${actionTaken || resolutionNotes || 'Dismissed'}`
        );

        res.json({ msg: `Report marked as ${status || 'Resolved'}`, report });
    } catch (err) {
        console.error('Error in resolveReport:', err);
        res.status(500).json({ msg: 'Server error resolving report' });
    }
};

// @desc    Get Audit Logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res) => {
    try {
        const { search, targetType, limit = 100 } = req.query;
        const query = {};

        if (targetType && targetType !== 'All') {
            query.targetType = targetType;
        }

        if (search) {
            query.$or = [
                { action: new RegExp(search, 'i') },
                { target: new RegExp(search, 'i') },
                { adminName: new RegExp(search, 'i') },
                { details: new RegExp(search, 'i') }
            ];
        }

        const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(parseInt(limit));
        res.json({ logs, total: logs.length });
    } catch (err) {
        console.error('Error in getAuditLogs:', err);
        res.status(500).json({ msg: 'Server error retrieving audit logs' });
    }
};

// @desc    Get Real System Health Status
// @route   GET /api/admin/system-health
// @access  Private (Admin)
exports.getSystemHealth = async (req, res) => {
    const healthCheckStart = Date.now();
    try {
        // 1. Database Health & Real Latency
        const dbState = mongoose.connection.readyState;
        let dbStatus = 'Unavailable';
        let dbLatency = 'N/A';
        let dbHost = 'MongoDB Atlas';

        if (mongoose.connection && mongoose.connection.host) {
            dbHost = mongoose.connection.host;
        }

        if (dbState === 1) {
            dbStatus = 'Connected (Operational)';
            try {
                const dbPingStart = Date.now();
                if (mongoose.connection.db && mongoose.connection.db.admin) {
                    await mongoose.connection.db.admin().ping();
                    dbLatency = `${Date.now() - dbPingStart}ms`;
                }
            } catch (pingErr) {
                dbStatus = 'Degraded';
                dbLatency = 'N/A';
            }
        } else if (dbState === 2) {
            dbStatus = 'Connecting';
        } else if (dbState === 3) {
            dbStatus = 'Disconnecting';
        } else {
            dbStatus = 'Unavailable';
        }

        // 2. ML FastAPI Service Health & Real Latency
        const mlBaseUrl = getMlServiceUrl();
        let mlStatus = 'Unavailable';
        let mlLatency = 'N/A';
        let mlHost = undefined;
        let mlPort = undefined;
        let resumeModelLoaded = false;

        try {
            const parsed = new URL(mlBaseUrl);
            mlHost = parsed.hostname;
            if (parsed.port) {
                mlPort = parseInt(parsed.port, 10);
            }
        } catch {
            mlHost = mlBaseUrl;
        }

        try {
            const mlStart = Date.now();
            const mlRes = await fetch(`${mlBaseUrl}/health`, {
                signal: AbortSignal.timeout(5000)
            });
            const elapsed = Date.now() - mlStart;
            mlLatency = `${elapsed}ms`;

            if (mlRes.ok) {
                const mlData = await mlRes.json().catch(() => null);
                const isHealthy = mlData && (mlData.status === 'healthy' || mlData.status === 'ok' || mlData.status === 'Operational');
                mlStatus = isHealthy ? 'Operational' : 'Degraded';
                if (mlData && mlData.resume_model && mlData.resume_model.loaded) {
                    resumeModelLoaded = true;
                }
            } else {
                mlStatus = 'Degraded';
            }
        } catch (fetchErr) {
            mlStatus = 'Unavailable';
            mlLatency = 'N/A';
        }

        // 3. ATS Resume Classifier Status
        let atsStatus = 'Unavailable';
        if (mlStatus === 'Operational') {
            atsStatus = resumeModelLoaded ? 'Operational' : 'Degraded (Model Standby)';
        } else if (mlStatus === 'Degraded') {
            atsStatus = 'Degraded';
        } else {
            atsStatus = 'Unavailable';
        }
        const atsLatency = mlStatus === 'Operational' ? mlLatency : 'N/A';

        // 4. Background Notification & Alerts Worker
        let workerStatus = 'Standby';
        try {
            const schedulerService = require('../services/job-ingestion/schedulerService');
            if (schedulerService && (schedulerService.timerId || schedulerService.isRunning)) {
                workerStatus = 'Operational';
            }
        } catch {
            workerStatus = 'Standby';
        }

        // 5. Backend Core API
        const backendPort = parseInt(process.env.PORT, 10) || 5000;
        const backendLatency = `${Math.max(1, Date.now() - healthCheckStart)}ms`;

        // 6. Overall Platform Status
        let overallStatus = 'Operational';
        if (dbState !== 1) {
            overallStatus = 'Unavailable';
        } else if (mlStatus === 'Degraded' || mlStatus === 'Unavailable') {
            overallStatus = 'Degraded';
        }

        const memoryUsage = process.memoryUsage();
        const uptimeSeconds = Math.round(process.uptime());

        res.json({
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`,
            services: [
                { name: 'Core Backend API', status: 'Operational', port: backendPort, latency: backendLatency },
                { name: 'MongoDB Database', status: dbStatus, host: dbHost, latency: dbLatency },
                { name: 'AI & ML FastAPI Service', status: mlStatus, port: mlPort, host: mlHost, latency: mlLatency },
                { name: 'ATS Resume Classifier', status: atsStatus, latency: atsLatency },
                { name: 'Notification & Alerts Worker', status: workerStatus, latency: 'N/A' }
            ],
            metrics: {
                heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
                nodeVersion: process.version
            }
        });
    } catch (err) {
        console.error('Error in getSystemHealth:', err);
        res.status(500).json({ msg: 'Server error checking system health' });
    }
};

// @desc    Get & Update Admin Settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
exports.getAdminSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            adminUser: user,
            platformSettings: {
                requireJobApproval: true,
                autoVerifyCompanies: false,
                emailAlertsEnabled: true,
                maintenanceMode: false
            }
        });
    } catch (err) {
        console.error('Error in getAdminSettings:', err);
        res.status(500).json({ msg: 'Server error retrieving admin settings' });
    }
};

exports.updateAdminSettings = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const update = {};
        if (name) update.name = name.trim();
        if (email) update.email = email.toLowerCase().trim();
        if (password) {
            const salt = await bcrypt.genSalt(10);
            update.password = await bcrypt.hash(password, salt);
        }

        const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');

        await recordAudit(
            req.user.id,
            user.name,
            'Admin settings updated',
            user.email,
            'System',
            'Admin updated profile / platform credentials.'
        );

        res.json({ msg: 'Admin settings saved successfully', user });
    } catch (err) {
        console.error('Error in updateAdminSettings:', err);
        res.status(500).json({ msg: 'Server error saving settings' });
    }
};
