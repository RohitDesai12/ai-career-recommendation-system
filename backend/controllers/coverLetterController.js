const CoverLetter = require('../models/CoverLetter');
const Resume = require('../models/Resume');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const User = require('../models/User');
const StudentActivity = require('../models/StudentActivity');

// Helper to generate realistic tone-adjusted cover letter text based on actual candidate data
function buildCoverLetterText({
    candidateName,
    candidateEmail,
    candidatePhone,
    targetRole,
    targetCompany,
    skills,
    experienceSummary,
    tone = 'Professional',
    jobDescription = ''
}) {
    const skillsList = skills.length > 0 ? skills.slice(0, 5).join(', ') : 'Software Development, Problem Solving, Modern Frameworks';
    const company = targetCompany ? targetCompany.trim() : 'your organization';
    const role = targetRole ? targetRole.trim() : 'this position';

    let greeting = `Dear Hiring Team at ${company},`;
    if (!targetCompany) greeting = 'Dear Hiring Manager,';

    let opening = '';
    let body1 = '';
    let body2 = '';
    let closing = '';
    let signoff = 'Sincerely,';

    switch (tone) {
        case 'Confident':
            opening = `I am writing to express my strong interest in the ${role} position at ${company}. With proven expertise across ${skillsList} and a commitment to engineering excellence, I am confident in my ability to deliver immediate value to your team.`;
            body1 = `Throughout my technical projects and professional trajectory, I have specialized in architecting reliable solutions, writing modular code, and optimizing performance. ${experienceSummary ? `Specifically, ${experienceSummary}` : `I have built end-to-end applications designed for scalability and high availability.`}`;
            body2 = `What excites me most about ${company} is the opportunity to tackle complex technical challenges alongside high-caliber engineers. My hands-on background with ${skills.slice(0, 3).join(' and ') || 'modern engineering methodologies'} enables me to quickly ramp up and make meaningful contributions to your core product roadmap.`;
            closing = `I look forward to discussing how my skills, proactive problem-solving mindset, and drive for quality will help ${company} achieve its next milestones.`;
            signoff = 'Best regards,';
            break;

        case 'Concise':
            opening = `I am excited to apply for the ${role} opening at ${company}.`;
            body1 = `Key qualifications I bring to this role:\n• Demonstrated proficiency in ${skillsList}.\n• Experience architecting end-to-end applications with clean, maintainable code.\n• ${experienceSummary || 'Track record of collaborating effectively across agile product lifecycles.'}`;
            body2 = `My technical background directly aligns with the technical goals at ${company}, and I am prepared to contribute effectively from day one.`;
            closing = `Thank you for your time and consideration. I would welcome the opportunity for a brief conversation.`;
            signoff = 'Sincerely,';
            break;

        case 'Enthusiastic':
            opening = `I was thrilled to discover the ${role} opportunity at ${company}! As a dedicated engineer passionate about innovation and high-impact technology, joining your team would be an incredible milestone.`;
            body1 = `Having honed my capabilities in ${skillsList}, I thrive on building user-centric, performant applications. ${experienceSummary ? `In recent work, ${experienceSummary}` : `I have spearheaded technical initiatives that emphasize seamless architecture and robust reliability.`}`;
            body2 = `${company}'s mission and engineering standards strongly resonate with my personal passion for creating impactful software. I am eager to bring my energy, technical versatility, and enthusiasm to your collaborative team environment.`;
            closing = `Thank you for considering my application. I would love the opportunity to speak with you about how I can contribute to ${company}'s ongoing success!`;
            signoff = 'Warm regards,';
            break;

        case 'Technical':
            opening = `I am applying for the ${role} role at ${company}, bringing dedicated experience in software architecture, distributed systems, and modern development across ${skillsList}.`;
            body1 = `My core competencies center on full lifecycle engineering, automated testing, and scalable backend/frontend integration. ${experienceSummary ? `Key highlights include: ${experienceSummary}` : `I focus on code maintainability, API design, and system throughput optimizations.`}`;
            body2 = `In analyzing the requirements for ${role}, my deep familiarity with ${skills.slice(0, 4).join(', ') || 'modern frameworks'} and performance profiling will allow me to solve critical engineering problems for ${company}.`;
            closing = `I welcome the opportunity for a technical discussion to delve deeper into my engineering background and how it matches your stack.`;
            signoff = 'Respectfully,';
            break;

        case 'Conversational':
            opening = `I’m reaching out to share my interest in joining ${company} as a ${role}. I’ve followed your work closely and would love to contribute to what your team is building.`;
            body1 = `Over the past several years, I’ve immersed myself in ${skillsList}. ${experienceSummary ? `A great example of this is when ${experienceSummary.toLowerCase()}` : `I enjoy taking ideas from concept to deployed software that people love using.`}`;
            body2 = `I believe great engineering comes down to clear communication, curiosity, and building things that last. I'm excited about the possibility of bringing that mindset to ${company}.`;
            closing = `Let’s connect! I’d love to chat about how my experience can help your team.`;
            signoff = 'Cheers,';
            break;

        case 'Executive':
            opening = `It is with great enthusiasm that I present my candidacy for the ${role} at ${company}. I offer a strategic, results-driven engineering perspective combined with deep technical acumen across ${skillsList}.`;
            body1 = `My background emphasizes delivering measurable business outcomes through high-standard engineering. ${experienceSummary ? `${experienceSummary}` : `I prioritize scalable systems architecture, cross-functional collaboration, and continuous operational improvement.`}`;
            body2 = `${company} stands at the forefront of industry innovation. I am eager to leverage my technical insight and problem-solving discipline to accelerate your strategic engineering priorities.`;
            closing = `I look forward to discussing how my qualifications and leadership in technical execution will benefit ${company}.`;
            signoff = 'Sincerely,';
            break;

        case 'Startup':
            opening = `I'm applying for the ${role} role at ${company} because I love moving fast, solving ambiguous problems, and building high-impact products from zero to one.`;
            body1 = `I bring a versatile toolkit spanning ${skillsList}. ${experienceSummary ? `${experienceSummary}` : `I'm comfortable wearing multiple hats, iterating rapidly based on user feedback, and shipping production-ready code.`}`;
            body2 = `In a fast-growing environment like ${company}, you need engineers who take ownership and execute without friction. I'm ready to dive in and help push your product forward.`;
            closing = `I'd love to jump on a quick call and discuss how we can build great things together.`;
            signoff = 'Best,';
            break;

        case 'Academic':
            opening = `I am writing to express my interest in the ${role} opportunity at ${company}. My academic and research foundation, complemented by practical skills in ${skillsList}, prepares me well for this position.`;
            body1 = `Throughout my coursework and project research, I have cultivated a rigorous analytical approach to problem solving and software design. ${experienceSummary ? `${experienceSummary}` : `I value algorithmic efficiency, structured documentation, and evidence-based engineering.`}`;
            body2 = `I am eager to apply my academic training and technical curiosity to the innovative challenges being tackled at ${company}.`;
            closing = `Thank you for your consideration. I look forward to the opportunity to discuss my academic and practical background with your team.`;
            signoff = 'Sincerely,';
            break;

        case 'Custom':
        case 'Professional':
        default:
            opening = `I am writing to express my enthusiastic interest in the ${role} position at ${company}. Having developed strong competencies in ${skillsList}, I am eager to contribute to the high-performance culture at ${company}.`;
            body1 = `My background encompasses full lifecycle software development, modular API design, and delivering performant user-focused applications. ${experienceSummary ? `${experienceSummary}` : `I take pride in producing clean, well-tested code that adheres to industry best practices.`}`;
            body2 = `I am drawn to ${company}'s commitment to engineering quality and technological innovation. I am confident that my technical skills and proactive work ethic make me a strong candidate for this position.`;
            closing = `Thank you for considering my application. I look forward to the opportunity to discuss how my background and enthusiasm will contribute to ${company}.`;
            signoff = 'Sincerely,';
            break;
    }

    const contactLine = [candidateEmail, candidatePhone].filter(Boolean).join(' | ');

    return `${greeting}

${opening}

${body1}

${body2}

${closing}

${signoff}
${candidateName}
${contactLine}`;
}

// @desc    Generate Cover Letter
// @route   POST /api/cover-letter/generate
// @access  Private
exports.generateCoverLetter = async (req, res) => {
    try {
        const {
            resumeId,
            jobId,
            jobTitle,
            companyName,
            jobDescription = '',
            tone = 'Professional',
            manualProfile
        } = req.body;

        const user = await User.findById(req.user.id);
        const profile = await Profile.findOne({ user: req.user.id });

        let resume = null;
        if (resumeId) {
            resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
        }

        const candidateName = manualProfile?.fullName || resume?.personalInfo?.fullName || user?.name || profile?.personalInfo?.fullName || 'Candidate';
        const candidateEmail = manualProfile?.email || resume?.personalInfo?.email || user?.email || 'candidate@example.com';
        const candidatePhone = manualProfile?.phone || resume?.personalInfo?.phone || profile?.phone || '';

        // Extract skills
        let candidateSkills = [];
        if (manualProfile?.skills && manualProfile.skills.length > 0) {
            candidateSkills = manualProfile.skills;
        } else if (resume?.skills && resume.skills.length > 0) {
            candidateSkills = resume.skills.flatMap(s => s.items || []);
        } else if (profile?.skills && profile.skills.length > 0) {
            candidateSkills = profile.skills;
        }

        if (candidateSkills.length === 0) {
            candidateSkills = ['Software Development', 'Problem Solving', 'Data Structures', 'Git'];
        }

        // Extract experience summary
        let experienceSummary = '';
        if (manualProfile?.experience) {
            experienceSummary = manualProfile.experience;
        } else if (resume?.experience && resume.experience.length > 0) {
            const exp0 = resume.experience[0];
            experienceSummary = `at ${exp0.company} as ${exp0.role}, I ${exp0.description || exp0.bulletPoints?.[0] || 'developed scalable services'}.`;
        }

        // Resolve Job data
        let finalRole = req.body.targetRole || req.body.jobTitle || resume?.targetRole || 'Software Development Engineer';
        let finalCompany = req.body.targetCompany || req.body.companyName || '';
        let finalJD = req.body.jobDescription || '';

        if (jobId) {
            const jobDoc = await Job.findById(jobId);
            if (jobDoc) {
                finalRole = jobDoc.title || finalRole;
                finalCompany = jobDoc.companyName || finalCompany;
                finalJD = jobDoc.description || finalJD;
            }
        }

        // Job alignment calculation
        const jdLower = finalJD.toLowerCase();
        const matchedSkills = candidateSkills.filter(s => jdLower.includes(s.toLowerCase()));
        const missingKeywords = [];
        if (finalJD) {
            const keywords = ['react', 'python', 'node', 'sql', 'aws', 'docker', 'typescript', 'java', 'graphql', 'ci/cd'];
            keywords.forEach(kw => {
                if (jdLower.includes(kw) && !candidateSkills.some(cs => cs.toLowerCase().includes(kw))) {
                    missingKeywords.push(kw.toUpperCase());
                }
            });
        }

        const matchScore = finalJD
            ? Math.min(96, Math.max(50, Math.round(((matchedSkills.length + 2) / (matchedSkills.length + missingKeywords.length + 2)) * 100)))
            : 85;

        const coverLetterContent = buildCoverLetterText({
            candidateName,
            candidateEmail,
            candidatePhone,
            targetRole: finalRole,
            targetCompany: finalCompany,
            skills: candidateSkills,
            experienceSummary,
            tone,
            jobDescription: finalJD
        });

        res.json({
            title: `Cover Letter — ${finalRole}${finalCompany ? ` at ${finalCompany}` : ''}`,
            targetRole: finalRole,
            targetCompany: finalCompany,
            jobDescription: finalJD,
            tone,
            content: coverLetterContent,
            coverLetter: coverLetterContent,
            jobAlignment: {
                matchScore,
                alignmentScore: matchScore,
                matchedSkills: matchedSkills.length > 0 ? matchedSkills : candidateSkills.slice(0, 4),
                matchedKeywords: matchedSkills.length > 0 ? matchedSkills : candidateSkills.slice(0, 4),
                missingKeywords: missingKeywords.slice(0, 5),
                relevantExperiences: [experienceSummary].filter(Boolean)
            }
        });
    } catch (err) {
        console.error('Error in generateCoverLetter:', err);
        res.status(500).json({ msg: 'Server error generating cover letter' });
    }
};

// @desc    Get all saved cover letters for current user
// @route   GET /api/cover-letter
// @access  Private
exports.getCoverLetters = async (req, res) => {
    try {
        const letters = await CoverLetter.find({ user: req.user.id })
            .populate('resume', 'title targetRole template')
            .sort({ updatedAt: -1 });

        res.json({ coverLetters: letters });
    } catch (err) {
        console.error('Error in getCoverLetters:', err);
        res.status(500).json({ msg: 'Server error retrieving cover letters' });
    }
};

// @desc    Get single cover letter by ID
// @route   GET /api/cover-letter/:id
// @access  Private
exports.getCoverLetterById = async (req, res) => {
    try {
        const letter = await CoverLetter.findOne({ _id: req.params.id, user: req.user.id })
            .populate('resume', 'title targetRole template');

        if (!letter) {
            return res.status(404).json({ msg: 'Cover letter not found' });
        }
        res.json(letter);
    } catch (err) {
        console.error('Error in getCoverLetterById:', err);
        res.status(500).json({ msg: 'Server error retrieving cover letter' });
    }
};

// @desc    Save new cover letter
// @route   POST /api/cover-letter
// @access  Private
exports.saveCoverLetter = async (req, res) => {
    try {
        const {
            resumeId,
            title,
            targetRole,
            targetCompany,
            jobDescription,
            tone,
            content,
            jobAlignment
        } = req.body;

        if (!targetRole || !content) {
            return res.status(400).json({ msg: 'Target role and content are required.' });
        }

        const newLetter = new CoverLetter({
            user: req.user.id,
            resume: resumeId || null,
            title: title || `Cover Letter for ${targetRole}`,
            targetRole,
            targetCompany: targetCompany || '',
            jobDescription: jobDescription || '',
            tone: tone || 'Professional',
            content,
            jobAlignment: jobAlignment || { matchScore: 85, matchedSkills: [], missingKeywords: [] },
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newLetter.save();

        try {
            await StudentActivity.create({
                user: req.user.id,
                action: 'Cover Letter Created',
                title: newLetter.title,
                category: 'resume',
                details: `Generated ${newLetter.tone} cover letter for ${newLetter.targetRole}`,
                createdAt: new Date()
            });
        } catch (e) {}

        res.status(201).json({
            ...newLetter.toObject(),
            coverLetter: newLetter
        });
    } catch (err) {
        console.error('Error in saveCoverLetter:', err);
        res.status(500).json({ msg: 'Server error saving cover letter' });
    }
};

// @desc    Update existing cover letter
// @route   PUT /api/cover-letter/:id
// @access  Private
exports.updateCoverLetter = async (req, res) => {
    try {
        let letter = await CoverLetter.findOne({ _id: req.params.id, user: req.user.id });
        if (!letter) {
            return res.status(404).json({ msg: 'Cover letter not found' });
        }

        const updateFields = { ...req.body, updatedAt: new Date() };
        letter = await CoverLetter.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
        );

        res.json(letter);
    } catch (err) {
        console.error('Error in updateCoverLetter:', err);
        res.status(500).json({ msg: 'Server error updating cover letter' });
    }
};

// @desc    Delete cover letter
// @route   DELETE /api/cover-letter/:id
// @access  Private
exports.deleteCoverLetter = async (req, res) => {
    try {
        const letter = await CoverLetter.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!letter) {
            return res.status(404).json({ msg: 'Cover letter not found' });
        }
        res.json({ msg: 'Cover letter deleted successfully' });
    } catch (err) {
        console.error('Error in deleteCoverLetter:', err);
        res.status(500).json({ msg: 'Server error deleting cover letter' });
    }
};
