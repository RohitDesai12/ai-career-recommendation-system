const User = require('../models/User');
const Profile = require('../models/Profile');
const Resume = require('../models/Resume');
const Roadmap = require('../models/Roadmap');
const JobApplication = require('../models/JobApplication');
const SavedPrep = require('../models/SavedPrep');
const AssessmentAttempt = require('../models/AssessmentAttempt');

class UserDataService {
    /**
     * Retrieve authenticated user context strictly scoped to userId
     * @param {string} userId - Authenticated MongoDB User ObjectId
     * @returns {Promise<Object>} Safe user context object
     */
    async getUserContext(userId) {
        if (!userId) return null;

        try {
            // 1. User base info (excluding sensitive fields)
            const user = await User.findById(userId).select('name email role');
            if (!user) return null;

            // 2. Profile data
            const profile = await Profile.findOne({ user: userId });

            // 3. Resumes
            const resumes = await Resume.find({ user: userId })
                .select('title targetRole template updatedAt')
                .sort({ updatedAt: -1 })
                .limit(5);

            // 4. Active Roadmap
            const roadmap = await Roadmap.findOne({ user: userId });

            // 5. Job Applications (strictly scoped by user or user's email)
            const applications = await JobApplication.find({
                $or: [{ user: userId }, { candidateEmail: user.email }]
            })
                .populate('job', 'title companyName location salary')
                .sort({ appliedAt: -1 })
                .limit(8);

            // 6. Saved Preps
            const savedPreps = await SavedPrep.find({ user: userId }).select('title category').limit(5);

            // 7. Recent Assessment
            const assessment = await AssessmentAttempt.findOne({ user: userId }).sort({ createdAt: -1 });

            // Calculate profile completeness %
            let completionPct = 0;
            if (user.name) completionPct += 15;
            if (user.email) completionPct += 15;
            if (profile?.education || profile?.college) completionPct += 15;
            if (profile?.skills && profile.skills.length > 0) completionPct += 20;
            if (profile?.targetCareer || (profile?.recommendedCareers && profile.recommendedCareers.length > 0)) completionPct += 15;
            if (profile?.resumeData?.atsScore || profile?.resumeUrl || resumes.length > 0) completionPct += 20;
            completionPct = Math.min(100, Math.max(20, completionPct));

            return {
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                profile: {
                    education: profile?.education || null,
                    college: profile?.college || null,
                    department: profile?.department || null,
                    graduationYear: profile?.graduationYear || null,
                    skills: profile?.skills || [],
                    targetCareer: profile?.targetCareer || null,
                    recommendedCareers: profile?.recommendedCareers || [],
                    careerPreferences: profile?.careerPreferences || null,
                    resumeData: profile?.resumeData || null,
                    completenessPct: completionPct
                },
                resumes: resumes.map(r => ({
                    id: r._id.toString(),
                    title: r.title,
                    targetRole: r.targetRole,
                    template: r.template,
                    updatedAt: r.updatedAt
                })),
                roadmap: roadmap ? {
                    title: roadmap.title || `${roadmap.field} Pathway`,
                    field: roadmap.field,
                    department: roadmap.department,
                    percentComplete: roadmap.percentComplete || 0,
                    stagesComplete: roadmap.stagesComplete || 0,
                    totalStages: roadmap.stages?.length || 0,
                    activeStage: roadmap.stages?.find(s => s.status === 'In Progress')?.title || (roadmap.stages?.[0]?.title || null)
                } : null,
                applications: applications.map(app => ({
                    id: app._id.toString(),
                    role: app.role || app.job?.title || 'Unknown Role',
                    company: app.job?.companyName || 'Verified Employer',
                    status: app.status,
                    matchScore: app.matchScore,
                    appliedAt: app.appliedAt
                })),
                savedPrepsCount: savedPreps.length,
                assessment: assessment ? {
                    predictedCareer: assessment.predictedCareer,
                    confidenceScore: assessment.confidenceScore,
                    takenAt: assessment.createdAt
                } : null
            };
        } catch (err) {
            console.error('Error fetching user context:', err.message);
            return null;
        }
    }

    /**
     * Format user context into a compact markdown summary for LLM prompt
     */
    formatContextForPrompt(userContext) {
        if (!userContext) return 'No authenticated user data available.';

        const { user, profile, resumes, roadmap, applications } = userContext;

        const lines = [
            `### Authenticated Candidate Data:`,
            `- **Name:** ${user.name}`,
            `- **Email:** ${user.email}`,
            `- **Profile Strength:** ${profile.completenessPct}%`,
            `- **Education:** ${profile.education || 'Not specified'} (${profile.college || 'College not listed'}, Dept: ${profile.department || 'General'})`,
            `- **Target Career:** ${profile.targetCareer || (roadmap?.field || 'Undecided')}`,
            `- **Skills on Profile:** ${profile.skills.length > 0 ? profile.skills.join(', ') : 'None listed yet'}`,
        ];

        if (profile.resumeData?.atsScore) {
            lines.push(`- **Latest Resume ATS Score:** ${profile.resumeData.atsScore}% (Shortlist Chance: ${profile.resumeData.shortlistChance || 'N/A'}%)`);
        }

        if (resumes && resumes.length > 0) {
            lines.push(`- **Created Resumes (${resumes.length}):** ${resumes.map(r => `"${r.title}" (${r.targetRole})`).join(', ')}`);
        } else {
            lines.push(`- **Created Resumes:** 0 resumes created in Resume Studio`);
        }

        if (roadmap) {
            lines.push(`- **Active Roadmap:** "${roadmap.title}" - ${roadmap.percentComplete}% complete (${roadmap.stagesComplete}/${roadmap.totalStages} stages completed). Current Stage: ${roadmap.activeStage || 'Stage 1'}`);
        } else {
            lines.push(`- **Active Roadmap:** No active roadmap generated yet`);
        }

        if (applications && applications.length > 0) {
            lines.push(`- **Submitted Applications (${applications.length}):**`);
            applications.forEach(a => {
                lines.push(`  * ${a.role} at ${a.company} — Status: **${a.status}** (Match: ${a.matchScore}%)`);
            });
        } else {
            lines.push(`- **Submitted Applications:** No active job applications submitted yet`);
        }

        return lines.join('\n');
    }
}

module.exports = new UserDataService();
