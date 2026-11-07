/**
 * Career Compass - Advanced Explainable AI Job Matching Engine
 * 
 * Provides deterministic, explainable compatibility matching between a student's
 * academic profile, skills, career preferences, and resume data, and an official job opportunity.
 * 
 * Features:
 * - Configurable evaluation weights.
 * - Exact vs Related skill differentiation (related skills provide partial credit without false exact matches).
 * - Multi-dimensional explainable breakdown (Skills, Education, Experience, Career Interest, Location).
 * - Actionable readiness guidance (Why It Matches, What You Are Missing, Eligibility Concerns, What to Learn).
 */

const { evaluateApplicationEligibility } = require('./job-ingestion/geoNormalizerService');

// Configurable Scoring Dimension Weights (Sum = 1.0)
const DEFAULT_MATCH_WEIGHTS = {
    technicalSkills: 0.35,
    educationRelevance: 0.20,
    experienceCompatibility: 0.15,
    careerInterest: 0.15,
    locationPreference: 0.15
};

// Common tech synonyms & alias mapping for accurate skill normalization
const SKILL_ALIASES = {
    'react': 'react',
    'react.js': 'react',
    'reactjs': 'react',
    'node': 'node.js',
    'nodejs': 'node.js',
    'node.js': 'node.js',
    'js': 'javascript',
    'javascript': 'javascript',
    'ts': 'typescript',
    'typescript': 'typescript',
    'py': 'python',
    'python': 'python',
    'python3': 'python',
    'c++': 'c++',
    'cpp': 'c++',
    'c#': 'c#',
    'csharp': 'c#',
    'golang': 'go',
    'go': 'go',
    'postgres': 'postgresql',
    'postgresql': 'postgresql',
    'mongo': 'mongodb',
    'mongodb': 'mongodb',
    'k8s': 'kubernetes',
    'kubernetes': 'kubernetes',
    'aws': 'aws',
    'amazon web services': 'aws',
    'gcp': 'gcp',
    'google cloud': 'gcp',
    'azure': 'azure',
    'microsoft azure': 'azure',
    'rest': 'rest apis',
    'rest api': 'rest apis',
    'restful api': 'rest apis',
    'rest apis': 'rest apis',
    'html': 'html5',
    'html5': 'html5',
    'css': 'css3',
    'css3': 'css3',
    'ml': 'machine learning',
    'machine learning': 'machine learning',
    'ai': 'artificial intelligence',
    'artificial intelligence': 'artificial intelligence',
    'data analysis': 'data analysis',
    'data analytics': 'data analysis',
    'power bi': 'power bi',
    'powerbi': 'power bi',
    'spring': 'spring boot',
    'spring boot': 'spring boot',
    'ci/cd': 'ci/cd',
    'cicd': 'ci/cd',
    'sql': 'sql',
    'microservices': 'microservices',
    'docker': 'docker',
    'git': 'git'
};

// Curated Skill Relationship Graph (Related/Complementary technologies)
const RELATED_SKILLS_MAP = {
    'java': ['c#', 'c++', 'kotlin', 'spring boot', 'golang'],
    'spring boot': ['java', 'microservices', 'rest apis'],
    'python': ['r', 'data analysis', 'machine learning', 'django', 'fastapi'],
    'javascript': ['typescript', 'react', 'node.js', 'vue', 'angular'],
    'typescript': ['javascript', 'react', 'angular', 'node.js'],
    'react': ['next.js', 'vue', 'angular', 'javascript'],
    'node.js': ['express', 'nest.js', 'fastapi', 'javascript'],
    'c++': ['c', 'c#', 'rust', 'java'],
    'c#': ['java', '.net', 'c++'],
    'sql': ['postgresql', 'mysql', 'sqlite', 'mongodb'],
    'postgresql': ['sql', 'mysql', 'mongodb'],
    'mongodb': ['nosql', 'redis', 'postgresql', 'sql'],
    'docker': ['kubernetes', 'ci/cd', 'containers'],
    'kubernetes': ['docker', 'terraform', 'cloud computing', 'aws'],
    'aws': ['gcp', 'azure', 'cloud computing'],
    'machine learning': ['deep learning', 'pytorch', 'tensorflow', 'python', 'artificial intelligence'],
    'rest apis': ['graphql', 'microservices', 'web apis'],
    'microservices': ['docker', 'kubernetes', 'rest apis', 'spring boot']
};

function normalizeSkill(skill) {
    if (!skill || typeof skill !== 'string') return '';
    const clean = skill.trim().toLowerCase().replace(/[\t\r\n]/g, '');
    return SKILL_ALIASES[clean] || clean;
}

function detectBranch(educationInput = '') {
    let text = '';
    if (typeof educationInput === 'string') {
        text = educationInput;
    } else if (Array.isArray(educationInput)) {
        text = educationInput.map(e => {
            if (typeof e === 'string') return e;
            return `${e.degree || ''} ${e.branch || ''} ${e.fieldOfStudy || ''} ${e.institution || ''}`;
        }).join(' ');
    } else if (typeof educationInput === 'object' && educationInput !== null) {
        text = `${educationInput.degree || ''} ${educationInput.branch || ''} ${educationInput.fieldOfStudy || ''}`;
    }
    text = text.toLowerCase().trim();
    if (!text || text.length < 2) return 'unspecified';
    if (/data\s*science|artificial\s*intelligence|\bai\b|machine\s*learning|analytics|statistics/.test(text)) return 'data_ai';
    if (/cyber\s*security|cybersecurity|information\s*security|infosec|network\s*security/.test(text)) return 'cybersecurity';
    if (/computer|cse|software|information\s*technology|\bit\b|mca|bca/.test(text)) return 'cs_it';
    if (/electrical|electronics|ece|eee|vlsi|embedded|telecom/.test(text)) return 'electrical';
    if (/mechanical|automobile|mechatronics|production|manufacturing|thermal/.test(text)) return 'mechanical';
    if (/civil|structural|construction/.test(text)) return 'civil';
    return 'other';
}

function detectJobDomain(job = {}) {
    const text = `${job.title || ''} ${job.category || ''} ${job.department || ''}`.toLowerCase();
    if (/vlsi|embedded|hardware|semiconductor|chip|circuit/.test(text)) return 'hardware_vlsi';
    if (/cyber|security|soc|infosec|penetration|vulnerability/.test(text)) return 'cybersecurity';
    if (/data|analytics|analyst|machine\s*learning|deep\s*learning|bi\b|statistic/.test(text)) return 'data_ai';
    if (/mechanical|cad|cae|solidworks|ansys|thermal|automobile/.test(text)) return 'mechanical';
    if (/civil|structural|site\s*engineer/.test(text)) return 'civil';
    if (/software|developer|frontend|backend|full\s*stack|web|engineer|cloud|devops/.test(text)) return 'cs_it';
    return 'general';
}

/**
 * Compare student profile against job requirements with explainable AI personalization
 * 
 * @param {Object} studentProfile - Student Profile document
 * @param {Object} job - Job document
 * @param {Object} [customWeights] - Optional custom dimension weights
 * @returns {Object} Comprehensive explainable match intelligence
 */
function calculateJobMatch(studentProfile = {}, job = {}, customWeights = {}) {
    const weights = { ...DEFAULT_MATCH_WEIGHTS, ...customWeights };

    // -------------------------------------------------------------
    // 1. EXTRACT STUDENT PROFILE DATA
    // -------------------------------------------------------------
    const studentSkillsRaw = [
        ...(Array.isArray(studentProfile.skills) ? studentProfile.skills : []),
        ...(studentProfile.resumeData?.strengths || [])
    ];
    const studentNormalizedSkills = new Set(
        studentSkillsRaw.map(normalizeSkill).filter(Boolean)
    );

    let studentEducation = '';
    if (typeof studentProfile.education === 'string') {
        studentEducation = studentProfile.education;
    } else if (Array.isArray(studentProfile.education) && studentProfile.education.length > 0) {
        studentEducation = studentProfile.education.map(e => typeof e === 'string' ? e : `${e.degree || ''} in ${e.branch || e.fieldOfStudy || ''}`).filter(Boolean).join(', ');
    } else if (studentProfile.department) {
        studentEducation = studentProfile.department;
    } else if (studentProfile.branch) {
        studentEducation = `${studentProfile.academicDegree || 'B.Tech'} in ${studentProfile.branch}`;
    }
    const hasGradYear = Boolean(studentProfile.graduationYear && String(studentProfile.graduationYear).trim());
    const studentGradYear = parseInt(studentProfile.graduationYear) || 0;
    const currentYear = new Date().getFullYear();

    const preferences = studentProfile.careerPreferences || {};
    const preferredRoles = [
        ...(preferences.preferredRoles || []),
        ...(Array.isArray(studentProfile.careerInterests) ? studentProfile.careerInterests : [])
    ].map(r => r.toLowerCase().trim()).filter(Boolean);

    const preferredLocations = [
        ...(preferences.preferredLocations || []),
        ...(Array.isArray(studentProfile.preferredLocations) ? studentProfile.preferredLocations : [])
    ].map(l => l.toLowerCase().trim()).filter(Boolean);

    const preferredWorkModes = (preferences.workModes || []).map(m => m.toLowerCase().trim()).filter(Boolean);
    const studentInterests = (studentProfile.interests || []).map(i => i.toLowerCase().trim()).filter(Boolean);
    const targetCareer = (studentProfile.targetCareer || '').toLowerCase().trim();
    const recommendedCareers = (studentProfile.recommendedCareers || []).map(c => (c.title || '').toLowerCase().trim()).filter(Boolean);

    // -------------------------------------------------------------
    // 2. EXTRACT JOB SPECIFICATIONS
    // -------------------------------------------------------------
    const jobRequiredSkills = (Array.isArray(job.skills) ? job.skills : []).map(normalizeSkill).filter(Boolean);
    const jobPreferredSkills = (Array.isArray(job.preferredSkills) ? job.preferredSkills : []).map(normalizeSkill).filter(Boolean);
    const allJobSkills = Array.from(new Set([...jobRequiredSkills, ...jobPreferredSkills]));

    const jobTitle = (job.title || '').toLowerCase();
    const jobDepartment = (job.department || '').toLowerCase();
    const jobCategory = (job.category || '').toLowerCase();
    const jobLocation = (job.location || '').toLowerCase();
    const jobWorkMode = (job.workMode || 'Hybrid').toLowerCase();
    const jobExperience = (job.experience || '0–2 years').toLowerCase();

    // -------------------------------------------------------------
    // FACTOR 1: TECHNICAL SKILLS MATCH (Exact vs Related)
    // -------------------------------------------------------------
    const matchedSkills = [];
    const relatedSkills = [];
    const missingSkills = [];

    if (allJobSkills.length > 0) {
        allJobSkills.forEach(reqSkill => {
            // Check exact match first
            let isExact = false;
            for (const studSkill of studentNormalizedSkills) {
                if (studSkill === reqSkill || studSkill.includes(reqSkill) || reqSkill.includes(studSkill)) {
                    isExact = true;
                    break;
                }
            }

            const originalJobSkill = [...(job.skills || []), ...(job.preferredSkills || [])].find(
                s => normalizeSkill(s) === reqSkill
            ) || reqSkill;

            if (isExact) {
                matchedSkills.push(originalJobSkill);
                return;
            }

            // Check if student has a related/complementary skill
            const relatedList = RELATED_SKILLS_MAP[reqSkill] || [];
            let relatedFound = null;
            for (const rel of relatedList) {
                if (studentNormalizedSkills.has(rel)) {
                    relatedFound = rel;
                    break;
                }
            }

            if (relatedFound) {
                relatedSkills.push({
                    requiredSkill: originalJobSkill,
                    relatedStudentSkill: relatedFound
                });
            } else {
                missingSkills.push(originalJobSkill);
            }
        });
    }

    let technicalSkillsScore = 0;
    if (studentNormalizedSkills.size === 0) {
        technicalSkillsScore = 0; // Missing profile skills gives 0%
    } else if (allJobSkills.length > 0) {
        // Exact match = 1.0 point, Related skill = 0.35 partial credit
        const totalPoints = (matchedSkills.length * 1.0) + (relatedSkills.length * 0.35);
        technicalSkillsScore = Math.min(100, Math.round((totalPoints / allJobSkills.length) * 100));

        // Bonus if all primary required skills matched
        const requiredMatches = jobRequiredSkills.filter(s => studentNormalizedSkills.has(s)).length;
        if (jobRequiredSkills.length > 0 && requiredMatches === jobRequiredSkills.length) {
            technicalSkillsScore = Math.max(technicalSkillsScore, 95);
        }
    } else {
        technicalSkillsScore = 50;
    }

    // -------------------------------------------------------------
    // FACTOR 2: EDUCATION QUALIFICATION MATCH
    // -------------------------------------------------------------
    let educationRelevanceScore = 20;
    let branchWarning = null;

    const studentBranch = detectBranch(studentEducation);
    const jobDomain = detectJobDomain(job);

    if (studentBranch === 'unspecified') {
        educationRelevanceScore = 20;
    } else if (studentBranch === jobDomain) {
        educationRelevanceScore = 100;
    } else if (jobDomain === 'cs_it') {
        if (studentBranch === 'data_ai' || studentBranch === 'cybersecurity') {
            educationRelevanceScore = 95;
        } else if (studentBranch === 'electrical') {
            educationRelevanceScore = 80;
        } else if (studentBranch === 'mechanical' || studentBranch === 'civil') {
            educationRelevanceScore = 40;
            branchWarning = `Branch divergence: Job typically seeks Computer Science/IT or Circuit branches, while your profile lists ${studentEducation}.`;
        } else {
            educationRelevanceScore = 50;
        }
    } else if (jobDomain === 'data_ai') {
        if (studentBranch === 'cs_it') {
            educationRelevanceScore = 95;
        } else if (studentBranch === 'electrical') {
            educationRelevanceScore = 75;
        } else {
            educationRelevanceScore = 40;
            branchWarning = `Discipline notice: Role requires Data Science/Computing focus, while your profile lists ${studentEducation}.`;
        }
    } else if (jobDomain === 'cybersecurity') {
        if (studentBranch === 'cs_it' || studentBranch === 'electrical') {
            educationRelevanceScore = 90;
        } else {
            educationRelevanceScore = 40;
            branchWarning = `Discipline notice: Role requires Information Security/CS background.`;
        }
    } else if (jobDomain === 'mechanical') {
        if (studentBranch === 'mechanical') {
            educationRelevanceScore = 100;
        } else {
            educationRelevanceScore = 30;
            branchWarning = `Branch divergence: Core mechanical role requires Mechanical Engineering qualifications.`;
        }
    } else {
        educationRelevanceScore = 75;
    }

    // -------------------------------------------------------------
    // FACTOR 3: EXPERIENCE LEVEL & GRADUATION YEAR MATCH
    // -------------------------------------------------------------
    let experienceCompatibilityScore = 100;
    const isFresherEligible = job.freshersEligible !== false;

    if (!hasGradYear) {
        experienceCompatibilityScore = 30;
    } else {
        const yearsSinceGrad = currentYear - studentGradYear;
        if (jobExperience.includes('0–1') || jobExperience.includes('0-1') || jobExperience.includes('fresher') || isFresherEligible) {
            if (studentGradYear >= currentYear - 1 && studentGradYear <= currentYear + 2) {
                experienceCompatibilityScore = 100;
            } else if (yearsSinceGrad > 2) {
                experienceCompatibilityScore = 75;
            } else {
                experienceCompatibilityScore = 85;
            }
        } else if (jobExperience.includes('1–3') || jobExperience.includes('1-3') || jobExperience.includes('2+')) {
            if (yearsSinceGrad >= 1) {
                experienceCompatibilityScore = 95;
            } else {
                experienceCompatibilityScore = 65;
            }
        } else if (jobExperience.includes('3+') || jobExperience.includes('5+') || jobExperience.includes('senior')) {
            if (yearsSinceGrad >= 3) {
                experienceCompatibilityScore = 90;
            } else {
                experienceCompatibilityScore = 35;
            }
        } else {
            experienceCompatibilityScore = isFresherEligible ? 90 : 70;
        }
    }

    // -------------------------------------------------------------
    // FACTOR 4: CAREER INTEREST & DOMAIN ALIGNMENT
    // -------------------------------------------------------------
    let careerInterestScore = 20;
    const hasCareerTargets = preferredRoles.length > 0 || targetCareer || recommendedCareers.length > 0 || studentInterests.length > 0;

    if (!hasCareerTargets) {
        careerInterestScore = 20;
    } else {
        const matchesTargetCareer = targetCareer && (jobTitle.includes(targetCareer) || jobCategory.includes(targetCareer));
        const matchesPreferredRole = preferredRoles.some(r => jobTitle.includes(r) || r.includes(jobTitle));
        const matchesRecommended = recommendedCareers.some(c => jobTitle.includes(c) || jobCategory.includes(c));
        const matchesInterests = studentInterests.some(i => jobTitle.includes(i) || jobCategory.includes(i) || jobDepartment.includes(i));

        if (matchesPreferredRole || matchesTargetCareer) {
            careerInterestScore = 100;
        } else if (matchesRecommended) {
            careerInterestScore = 85;
        } else if (matchesInterests) {
            careerInterestScore = 70;
        } else {
            careerInterestScore = 40;
        }
    }

    // -------------------------------------------------------------
    // FACTOR 5: LOCATION & WORK MODE PREFERENCE
    // -------------------------------------------------------------
    let locationPreferenceScore = 50;
    const hasLocationPrefs = preferredLocations.length > 0 || preferredWorkModes.length > 0;

    // Check geographical scope alignment
    const studentCountry = (studentProfile.country || 'India').toLowerCase();
    const jobCountry = (job.country || '').toLowerCase();
    const isDomestic = job.locationType === 'Domestic' || jobCountry === 'india' || job.remoteEligibility === 'India Eligible';
    const isWorldwideRemote = job.remoteEligibility === 'Worldwide Eligible' || (job.locationType === 'Remote_Worldwide' && jobWorkMode === 'remote');

    if (studentCountry === 'india' && (isDomestic || isWorldwideRemote)) {
        locationPreferenceScore = 85;
    }

    if (!hasLocationPrefs) {
        if (!locationPreferenceScore) locationPreferenceScore = 50;
    } else {
        let workModeMatched = false;
        if (preferredWorkModes.length > 0) {
            workModeMatched = preferredWorkModes.includes(jobWorkMode) || (jobWorkMode === 'remote' && preferredWorkModes.includes('remote'));
        }

        let locationMatched = false;
        if (jobWorkMode === 'remote') {
            locationMatched = true;
        } else if (preferredLocations.length > 0) {
            locationMatched = preferredLocations.some(l => jobLocation.includes(l) || l.includes(jobLocation));
        }

        if (locationMatched && workModeMatched) {
            locationPreferenceScore = 100;
        } else if (locationMatched || workModeMatched) {
            locationPreferenceScore = 75;
        } else {
            locationPreferenceScore = 40;
        }
    }

    // -------------------------------------------------------------
    // WEIGHTED AGGREGATION
    // -------------------------------------------------------------
    const weightedScore = (
        technicalSkillsScore * weights.technicalSkills +
        educationRelevanceScore * weights.educationRelevance +
        experienceCompatibilityScore * weights.experienceCompatibility +
        careerInterestScore * weights.careerInterest +
        locationPreferenceScore * weights.locationPreference
    );

    const matchScore = Math.max(10, Math.min(99, Math.round(weightedScore)));

    // -------------------------------------------------------------
    // FACTOR 6: APPLICATION ELIGIBILITY ASSESSMENT (Separate dimension)
    // -------------------------------------------------------------
    const applicationEligibility = evaluateApplicationEligibility(studentProfile, job);

    // -------------------------------------------------------------
    // READINESS, GAPS & EXPLAINABILITY
    // -------------------------------------------------------------
    const whyItMatches = [];
    if (matchedSkills.length > 0) {
        whyItMatches.push(`Direct skill synergy in ${matchedSkills.slice(0, 3).join(', ')}${matchedSkills.length > 3 ? ` +${matchedSkills.length - 3} more` : ''}.`);
    }
    if (relatedSkills.length > 0) {
        whyItMatches.push(`Transferable foundations: Your background in ${relatedSkills.map(r => r.relatedStudentSkill).slice(0, 2).join(', ')} provides an adaptable baseline for ${relatedSkills.map(r => r.requiredSkill).slice(0, 2).join(', ')}.`);
    }
    if (educationRelevanceScore >= 90) {
        whyItMatches.push(`Academic degree & branch directly align with ${job.department || 'role'} requirements.`);
    }
    if (experienceCompatibilityScore >= 90 && hasGradYear) {
        whyItMatches.push(`Experience level (${job.experience || 'Entry-level'}) is well-matched for graduation year ${studentGradYear}.`);
    }
    if (careerInterestScore >= 85) {
        whyItMatches.push(`Aligns closely with your target career direction in ${job.category || job.title}.`);
    }
    if (locationPreferenceScore >= 75) {
        whyItMatches.push(`Work mode (${job.workMode}) and location (${job.location}) match your stated preferences.`);
    }

    const whatYouAreMissing = [];
    if (missingSkills.length > 0) {
        whatYouAreMissing.push(`Key required technologies not found on profile: ${missingSkills.slice(0, 4).join(', ')}${missingSkills.length > 4 ? ` (+${missingSkills.length - 4} more)` : ''}.`);
    }
    if (!isFresherEligible && jobExperience.includes('2+') || jobExperience.includes('3+') || jobExperience.includes('senior')) {
        whatYouAreMissing.push(`Experience gap: Opportunity requests ${job.experience}; profile indicates early-career candidate.`);
    }
    if (careerInterestScore <= 40 && hasCareerTargets) {
        whatYouAreMissing.push(`Role domain (${job.category}) is outside your primary target roles (${preferredRoles.join(', ') || targetCareer}).`);
    }

    const eligibilityConcerns = [];
    if (studentBranch === 'unspecified') {
        eligibilityConcerns.push('Education degree / branch not specified in profile.');
    }
    if (!hasGradYear) {
        eligibilityConcerns.push('Graduation year not specified in profile.');
    }
    if (studentNormalizedSkills.size === 0) {
        eligibilityConcerns.push('No technical skills listed in student profile.');
    }
    if (branchWarning) {
        eligibilityConcerns.push(branchWarning);
    }
    if (jobExperience.includes('3+') || jobExperience.includes('5+') || jobExperience.includes('senior')) {
        eligibilityConcerns.push(`Job requires ${job.experience}; profile reflects fresher/recent graduate candidate.`);
    }

    if (applicationEligibility && applicationEligibility.status === 'RED') {
        eligibilityConcerns.unshift(...applicationEligibility.reasons);
    } else if (applicationEligibility && applicationEligibility.status === 'YELLOW') {
        eligibilityConcerns.push(...applicationEligibility.reasons);
    }

    const suitabilityScore = applicationEligibility && applicationEligibility.status === 'RED'
        ? Math.min(matchScore, 35)
        : matchScore;

    // What to learn before applying (prioritized skill development roadmap)
    const whatToLearnBeforeApplying = missingSkills.slice(0, 4).map(skill => ({
        skill,
        priority: jobRequiredSkills.includes(normalizeSkill(skill)) ? 'High' : 'Medium',
        coursePath: `/courses?skill=${encodeURIComponent(skill)}`,
        roadmapPath: `/roadmap?role=${encodeURIComponent(job.title)}`
    }));

    // Construct human-readable explanation
    let matchExplanation = '';
    if (matchedSkills.length >= 2) {
        matchExplanation = `Your proficiency in ${matchedSkills.slice(0, 3).join(', ')}, academic background, and interest in ${job.category || 'technology'} make this role an excellent ${matchScore}% compatibility match.`;
    } else if (matchedSkills.length === 1) {
        matchExplanation = `Your familiarity with ${matchedSkills[0]} aligns well with this ${job.title} role (${matchScore}%). Acquiring ${missingSkills.slice(0, 2).join(' and ')} will further strengthen your candidacy.`;
    } else if (relatedSkills.length > 0) {
        matchExplanation = `While you haven't listed direct experience in ${missingSkills.slice(0, 2).join(', ')}, your background in ${relatedSkills[0].relatedStudentSkill} provides a transferable foundation. Overall match: ${matchScore}%.`;
    } else {
        matchExplanation = `This opportunity in ${job.category || 'engineering'} provides an active pathway to apply foundational principles (${matchScore}% match). Prioritize learning ${missingSkills.slice(0, 2).join(' and ')} to prepare for interview assessment.`;
    }

    // Contextual Preparation Actions
    const recommendedPreparation = [
        {
            type: 'roadmap',
            label: `Generate Roadmap for ${job.title}`,
            path: `/roadmap?role=${encodeURIComponent(job.title)}`
        },
        {
            type: 'resume',
            label: `Tailor Resume for ${job.companyName || 'Role'}`,
            path: `/resume-studio/tailor?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.companyName || '')}`
        },
        {
            type: 'courses',
            label: missingSkills.length > 0 ? `Learn ${missingSkills[0]}` : `Recommended Courses for ${job.category || 'Tech'}`,
            path: missingSkills.length > 0 ? `/courses?skill=${encodeURIComponent(missingSkills[0])}` : `/courses`
        },
        {
            type: 'interview',
            label: `Practice Interview Questions for ${job.title}`,
            path: `/interview-prep?role=${encodeURIComponent(job.title)}`
        }
    ];

    const breakdownObj = {
        technicalSkills: technicalSkillsScore,
        educationRelevance: educationRelevanceScore,
        experienceCompatibility: experienceCompatibilityScore,
        careerInterest: careerInterestScore,
        locationPreference: locationPreferenceScore
    };

    return {
        matchScore,
        technicalMatchScore: matchScore,
        suitabilityScore,
        applicationEligibility,
        breakdown: breakdownObj,
        matchBreakdown: breakdownObj,
        matchedSkills,
        relatedSkills,
        missingSkills,
        matchExplanation,
        readiness: {
            strongMatches: whyItMatches,
            skillsToImprove: missingSkills.slice(0, 4),
            eligibilityConcerns,
            recommendedPreparation
        },
        whyItMatches,
        whatYouAreMissing,
        eligibilityConcerns,
        whatToLearnBeforeApplying
    };
}

module.exports = {
    DEFAULT_MATCH_WEIGHTS,
    calculateJobMatch,
    evaluateApplicationEligibility,
    normalizeSkill,
    detectBranch,
    detectJobDomain,
    RELATED_SKILLS_MAP
};
