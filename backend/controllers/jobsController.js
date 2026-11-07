const Job = require('../models/Job');
const Company = require('../models/Company');
const SavedJob = require('../models/SavedJob');
const JobApplication = require('../models/JobApplication');
const JobAlert = require('../models/JobAlert');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { calculateJobMatch } = require('../services/matchingEngine');
const { CURATED_COMPANIES } = require('../data/curatedCompanies');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// In-memory cache for high-frequency public reads (TTL: 60s)
const memoryCache = {
    dbCompaniesWithCounts: null,
    cacheExpiry: 0
};

// Helper to extract student profile if optional auth header is present
async function getStudentProfileFromReq(req) {
    try {
        if (req.user && req.user.id) {
            const profile = await Profile.findOne({ user: req.user.id });
            return profile;
        }

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production');
            if (decoded && decoded.user && decoded.user.id) {
                const profile = await Profile.findOne({ user: decoded.user.id });
                return profile;
            }
        }
    } catch (e) {
        // Token expired or invalid; return null gracefully
    }
    return null;
}

// @desc    Get all active jobs with search, multi-attribute filters, sorting & pagination
// @route   GET /api/jobs
// @access  Public (Enhanced with personalized match if authenticated)
exports.getJobs = async (req, res) => {
    try {
        const {
            search,
            category,
            company,
            location,
            workMode,
            type,
            experience,
            freshersEligible,
            salaryMin,
            skills,
            sourceType,
            recentlyVerified,
            geoScope = 'all',
            country,
            state,
            city,
            visaSponsorship,
            relocationAssistance,
            remoteEligibility,
            currency,
            sort = 'best_match',
            page = 1,
            limit = 10
        } = req.query;

        const filter = { status: 'Active' };

        // Ingestion Source Filter
        if (sourceType && sourceType !== 'All') {
            filter.sourceType = sourceType;
        }

        // Freshness / Recently Verified Filter
        if (recentlyVerified === 'true' || recentlyVerified === '24h') {
            filter.lastVerifiedDate = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
        } else if (recentlyVerified === '7d') {
            filter.lastVerifiedDate = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
        }

        // Geographical Scope Filter (India, International, Remote Worldwide, or All)
        const normalizedGeoScope = (geoScope || 'all').toLowerCase();
        let geoConditions = null;

        if (normalizedGeoScope === 'india') {
            geoConditions = {
                $or: [
                    { locationType: 'Domestic' },
                    { country: 'India' },
                    { remoteEligibility: 'India Eligible' }
                ]
            };
        } else if (normalizedGeoScope === 'international') {
            geoConditions = {
                $or: [
                    { locationType: 'International' },
                    { country: { $exists: true, $nin: ['', 'India'] } },
                    { locationType: 'Remote_Country_Specific', country: { $ne: 'India' } }
                ]
            };
        } else if (normalizedGeoScope === 'remote') {
            geoConditions = {
                $or: [
                    { workMode: 'Remote' },
                    { locationType: 'Remote_Worldwide' },
                    { locationType: 'Remote_Country_Specific' }
                ]
            };
        }

        // Granular Geographic Filters
        if (country && country !== 'All') {
            filter.country = new RegExp(`^${country.trim()}$`, 'i');
        }
        if (state && state !== 'All') {
            filter.state = new RegExp(`^${state.trim()}$`, 'i');
        }
        if (city && city !== 'All') {
            filter.city = new RegExp(`^${city.trim()}$`, 'i');
        }
        if (visaSponsorship && visaSponsorship !== 'All') {
            filter.visaSponsorship = visaSponsorship;
        }
        if (relocationAssistance && relocationAssistance !== 'All') {
            filter.relocationAssistance = relocationAssistance;
        }
        if (remoteEligibility && remoteEligibility !== 'All') {
            filter.remoteEligibility = remoteEligibility;
        }
        if (currency && currency !== 'All') {
            filter.salaryCurrency = currency.toUpperCase();
        }

        // 1. Text / Keyword Search
        if (search && search.trim()) {
            const query = search.trim();
            filter.$or = [
                { title: new RegExp(query, 'i') },
                { companyName: new RegExp(query, 'i') },
                { skills: { $in: [new RegExp(query, 'i')] } },
                { department: new RegExp(query, 'i') },
                { category: new RegExp(query, 'i') },
                { city: new RegExp(query, 'i') },
                { country: new RegExp(query, 'i') }
            ];
        }

        // 2. Category Filter
        if (category && category !== 'All' && category !== 'All Categories') {
            filter.$or = [
                { category: new RegExp(category, 'i') },
                { department: new RegExp(category, 'i') }
            ];
        }

        // 3. Company Filter
        if (company && company !== 'All') {
            filter.companyName = new RegExp(`^${company.trim()}$`, 'i');
        }

        // 4. Location Filter
        if (location && location !== 'All' && location !== 'Any') {
            filter.location = new RegExp(location.trim(), 'i');
        }

        // 5. Work Mode Filter
        if (workMode && workMode !== 'All') {
            filter.workMode = new RegExp(`^${workMode.trim()}$`, 'i');
        }

        // 6. Employment Type Filter
        if (type && type !== 'All') {
            filter.type = new RegExp(`^${type.trim()}$`, 'i');
        }

        // 7. Experience Filter
        if (experience && experience !== 'All') {
            filter.experience = new RegExp(experience.trim(), 'i');
        }

        // 8. Freshers Eligible Filter
        if (freshersEligible === 'true' || freshersEligible === true) {
            filter.freshersEligible = true;
        }

        // 9. Required Skills Filter
        if (skills) {
            const skillArray = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillArray.length > 0) {
                filter.skills = { $in: skillArray.map(s => new RegExp(`^${s}$`, 'i')) };
            }
        }

        // Merge geoConditions if present
        if (geoConditions) {
            if (filter.$or) {
                filter.$and = [
                    { $or: filter.$or },
                    geoConditions
                ];
                delete filter.$or;
            } else {
                Object.assign(filter, geoConditions);
            }
        }

        // Fetch student profile for personalized matching
        const studentProfile = await getStudentProfileFromReq(req);

        // Execute query
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Fetch matching jobs
        let allMatchingJobs = await Job.find(filter)
            .lean();

        // Calculate explainable personalized match score and application eligibility for each job
        allMatchingJobs = allMatchingJobs.map(job => {
            const matchInfo = calculateJobMatch(studentProfile || {}, job);
            return {
                ...job,
                matchScore: matchInfo.matchScore,
                suitabilityScore: matchInfo.suitabilityScore,
                applicationEligibility: matchInfo.applicationEligibility,
                matchBreakdown: matchInfo.breakdown,
                matchedSkills: matchInfo.matchedSkills,
                missingSkills: matchInfo.missingSkills,
                matchExplanation: matchInfo.matchExplanation,
                readiness: matchInfo.readiness
            };
        });

        // Apply Sorting
        if (sort === 'best_match' || sort === 'highest_match') {
            allMatchingJobs.sort((a, b) => {
                const suitDiff = (b.suitabilityScore || 0) - (a.suitabilityScore || 0);
                if (suitDiff !== 0) return suitDiff;
                return (b.matchScore || 0) - (a.matchScore || 0);
            });
        } else if (sort === 'recent' || sort === 'recently_discovered') {
            allMatchingJobs.sort((a, b) => new Date(b.firstSeenAt || b.createdAt) - new Date(a.firstSeenAt || a.createdAt));
        } else if (sort === 'recently_verified') {
            allMatchingJobs.sort((a, b) => new Date(b.lastVerifiedDate || b.updatedAt) - new Date(a.lastVerifiedDate || a.updatedAt));
        } else if (sort === 'company') {
            allMatchingJobs.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
        }

        const totalCount = allMatchingJobs.length;
        const totalPages = Math.ceil(totalCount / limitNum) || 1;
        const paginatedJobs = allMatchingJobs.slice(skip, skip + limitNum);

        // Extract available unique categories, locations, countries & cities for dynamic filters
        const [distinctCategories, distinctLocations, distinctCountries, distinctCities, indiaCount, intlCount, remoteCount, totalActiveCount] = await Promise.all([
            Job.distinct('category', { status: 'Active' }),
            Job.distinct('location', { status: 'Active' }),
            Job.distinct('country', { status: 'Active', country: { $ne: '' } }),
            Job.distinct('city', { status: 'Active', city: { $ne: '' } }),
            Job.countDocuments({
                status: 'Active',
                $or: [
                    { locationType: 'Domestic' },
                    { country: 'India' },
                    { remoteEligibility: 'India Eligible' }
                ]
            }),
            Job.countDocuments({
                status: 'Active',
                $or: [
                    { locationType: 'International' },
                    { country: { $exists: true, $nin: ['', 'India'] } },
                    { locationType: 'Remote_Country_Specific', country: { $ne: 'India' } }
                ]
            }),
            Job.countDocuments({
                status: 'Active',
                $or: [
                    { workMode: 'Remote' },
                    { locationType: 'Remote_Worldwide' },
                    { locationType: 'Remote_Country_Specific' }
                ]
            }),
            Job.countDocuments({ status: 'Active' })
        ]);

        return res.json({
            jobs: paginatedJobs,
            totalCount,
            totalPages,
            currentPage: pageNum,
            categories: distinctCategories.filter(Boolean),
            locations: distinctLocations.filter(Boolean),
            countries: distinctCountries.filter(Boolean).sort(),
            cities: distinctCities.filter(Boolean).sort(),
            geoCounts: {
                india: indiaCount,
                international: intlCount,
                remote: remoteCount,
                all: totalActiveCount
            }
        });
    } catch (err) {
        console.error('Error in getJobs:', err);
        return res.status(500).json({ msg: 'Server error retrieving jobs' });
    }
};

// @desc    Get Personalized Job Recommendations for Authenticated Student
// @route   GET /api/jobs/recommended
// @access  Private (Student)
exports.getRecommendedJobs = async (req, res) => {
    try {
        const { geoScope = 'all' } = req.query;
        const studentProfile = await Profile.findOne({ user: req.user.id }).lean();
        const allActiveJobs = await Job.find({ status: 'Active' }).lean();

        if (!allActiveJobs || allActiveJobs.length === 0) {
            return res.json({
                recommendations: [],
                insights: {
                    totalMatchingJobs: 0,
                    strongMatchesCount: 0,
                    topMatchedSkills: [],
                    topMissingSkills: [],
                    profileCompletion: 60,
                    geoCounts: { india: 0, international: 0, remote: 0, all: 0 }
                }
            });
        }

        // Live geo counts across all active jobs
        const indiaCount = allActiveJobs.filter(j => j.locationType === 'Domestic' || j.country === 'India' || j.remoteEligibility === 'India Eligible').length;
        const intlCount = allActiveJobs.filter(j => j.locationType === 'International' || (j.country && j.country !== 'India')).length;
        const remoteCount = allActiveJobs.filter(j => j.workMode === 'Remote' || j.locationType === 'Remote_Worldwide' || j.locationType === 'Remote_Country_Specific').length;
        const totalActiveCount = allActiveJobs.length;

        // Scope filter
        let activeJobs = allActiveJobs;
        const normalizedGeo = (geoScope || 'all').toLowerCase();
        if (normalizedGeo === 'india') {
            activeJobs = allActiveJobs.filter(j => j.locationType === 'Domestic' || j.country === 'India' || j.remoteEligibility === 'India Eligible');
        } else if (normalizedGeo === 'international') {
            activeJobs = allActiveJobs.filter(j => j.locationType === 'International' || (j.country && j.country !== 'India'));
        } else if (normalizedGeo === 'remote') {
            activeJobs = allActiveJobs.filter(j => j.workMode === 'Remote' || j.locationType === 'Remote_Worldwide' || j.locationType === 'Remote_Country_Specific');
        }

        // Run explainable matching engine on scoped jobs
        const scoredJobs = activeJobs.map(job => {
            const matchInfo = calculateJobMatch(studentProfile || {}, job);
            return {
                ...job,
                matchScore: matchInfo.matchScore,
                suitabilityScore: matchInfo.suitabilityScore,
                applicationEligibility: matchInfo.applicationEligibility,
                matchBreakdown: matchInfo.breakdown,
                matchedSkills: matchInfo.matchedSkills,
                relatedSkills: matchInfo.relatedSkills,
                missingSkills: matchInfo.missingSkills,
                matchExplanation: matchInfo.matchExplanation,
                readiness: matchInfo.readiness,
                whyItMatches: matchInfo.whyItMatches,
                whatYouAreMissing: matchInfo.whatYouAreMissing,
                eligibilityConcerns: matchInfo.eligibilityConcerns,
                whatToLearnBeforeApplying: matchInfo.whatToLearnBeforeApplying
            };
        });

        // SECTION 1: TOP MATCHES (Sorted descending by suitability & match score)
        const sortedByMatch = [...scoredJobs].sort((a, b) => {
            const suitDiff = (b.suitabilityScore || 0) - (a.suitabilityScore || 0);
            if (suitDiff !== 0) return suitDiff;
            return (b.matchScore || 0) - (a.matchScore || 0);
        });
        const topMatches = sortedByMatch.slice(0, 10);

        // SECTION 2: RECENTLY DISCOVERED (Sorted by firstSeenAt / createdAt desc)
        const sortedByFreshness = [...scoredJobs].sort((a, b) => {
            const dateA = new Date(a.firstSeenAt || a.createdAt || 0).getTime();
            const dateB = new Date(b.firstSeenAt || b.createdAt || 0).getTime();
            return dateB - dateA;
        });
        const recentlyDiscovered = sortedByFreshness.slice(0, 8);

        // SECTION 3: MATCHING YOUR SKILLS (Highest technical skill match >= 65%)
        const matchingYourSkills = [...scoredJobs]
            .filter(j => (j.matchBreakdown?.technicalSkills || 0) >= 65 || (j.matchedSkills || []).length >= 2)
            .sort((a, b) => (b.matchBreakdown?.technicalSkills || 0) - (a.matchBreakdown?.technicalSkills || 0))
            .slice(0, 8);

        // SECTION 4: OPPORTUNITIES TO GROW (Relevant roles with actionable skill gaps)
        const opportunitiesToGrow = [...scoredJobs]
            .filter(j => j.matchScore >= 50 && (j.missingSkills || []).length >= 1)
            .sort((a, b) => (b.suitabilityScore || b.matchScore || 0) - (a.suitabilityScore || a.matchScore || 0))
            .slice(0, 8);

        // SECTION 5: YOUR CAREER INTERESTS (Roles aligning with preferred roles or domain)
        const careerInterests = [...scoredJobs]
            .filter(j => (j.matchBreakdown?.careerInterest || 0) >= 70)
            .sort((a, b) => (b.suitabilityScore || b.matchScore || 0) - (a.suitabilityScore || a.matchScore || 0))
            .slice(0, 8);

        // Backward compatibility primary recommendations list
        const recommendations = topMatches;

        // Calculate macro insights for the student
        const matchedSkillsTally = {};
        const missingSkillsTally = {};

        scoredJobs.forEach(j => {
            (j.matchedSkills || []).forEach(s => {
                matchedSkillsTally[s] = (matchedSkillsTally[s] || 0) + 1;
            });
            (j.missingSkills || []).forEach(s => {
                missingSkillsTally[s] = (missingSkillsTally[s] || 0) + 1;
            });
        });

        const topMatchedSkills = Object.entries(matchedSkillsTally)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([skill]) => skill);

        const topMissingSkills = Object.entries(missingSkillsTally)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([skill]) => skill);

        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentlyDiscoveredCount = activeJobs.filter(j => {
            const seen = new Date(j.firstSeenAt || j.createdAt || 0).getTime();
            return seen >= sevenDaysAgo;
        }).length;

        const freshersEligibleCount = activeJobs.filter(j => j.freshersEligible !== false).length;

        // Profile completeness evaluation
        let completenessScore = 30; // base account
        if (studentProfile?.skills?.length > 0) completenessScore += 25;
        if (studentProfile?.education) completenessScore += 15;
        if (studentProfile?.graduationYear) completenessScore += 10;
        if (studentProfile?.careerPreferences?.preferredRoles?.length > 0) completenessScore += 10;
        if (studentProfile?.resumeData?.atsScore) completenessScore += 10;

        return res.json({
            recommendations,
            sections: {
                topMatches,
                recentlyDiscovered,
                matchingYourSkills: matchingYourSkills.length > 0 ? matchingYourSkills : topMatches.slice(0, 6),
                opportunitiesToGrow: opportunitiesToGrow.length > 0 ? opportunitiesToGrow : sortedByMatch.slice(4, 10),
                careerInterests: careerInterests.length > 0 ? careerInterests : topMatches.slice(0, 6)
            },
            insights: {
                totalActiveOpportunities: activeJobs.length,
                totalOpportunities: activeJobs.length,
                strongMatchesCount: scoredJobs.filter(j => j.matchScore >= 75).length,
                moderateMatchesCount: scoredJobs.filter(j => j.matchScore >= 60 && j.matchScore < 75).length,
                recentlyDiscoveredCount,
                freshersEligibleCount,
                topMatchedSkills,
                topMissingSkills,
                profileCompletion: Math.min(100, completenessScore),
                geoCounts: {
                    india: indiaCount,
                    international: intlCount,
                    remote: remoteCount,
                    all: totalActiveCount
                }
            },
            studentProfileSummary: {
                skills: studentProfile?.skills || [],
                education: studentProfile?.education || '',
                graduationYear: studentProfile?.graduationYear || '',
                preferredRoles: studentProfile?.careerPreferences?.preferredRoles || []
            }
        });
    } catch (err) {
        console.error('Error in getRecommendedJobs:', err);
        return res.status(500).json({ msg: 'Server error computing job recommendations' });
    }
};

// @desc    Get Detailed Job Information with Career Compass Match Intelligence
// @route   GET /api/jobs/:id
// @access  Public (Enhanced if authenticated)
exports.getJobById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ msg: 'Job opportunity not found' });
        }

        const job = await Job.findById(req.params.id)
            .lean();

        if (!job) {
            return res.status(404).json({ msg: 'Job opportunity not found' });
        }

        const studentProfile = await getStudentProfileFromReq(req);
        const matchInfo = calculateJobMatch(studentProfile || {}, job);

        return res.json({
            job: {
                ...job,
                matchScore: matchInfo.matchScore,
                suitabilityScore: matchInfo.suitabilityScore,
                applicationEligibility: matchInfo.applicationEligibility
            },
            careerMatch: matchInfo
        });
    } catch (err) {
        console.error('Error in getJobById:', err);
        return res.status(500).json({ msg: 'Server error retrieving job details' });
    }
};

// @desc    Get Curated Company Career Pages Directory
// @route   GET /api/jobs/companies
// @access  Public
exports.getCompanies = async (req, res) => {
    try {
        const { category, search } = req.query;

        let enrichedCompanies;
        const now = Date.now();
        if (memoryCache.dbCompaniesWithCounts && now < memoryCache.cacheExpiry) {
            enrichedCompanies = memoryCache.dbCompaniesWithCounts;
        } else {
            // Fetch DB companies or initialize from curated list
            let dbCompanies = await Company.find().lean();
            if (!dbCompanies || dbCompanies.length === 0) {
                dbCompanies = CURATED_COMPANIES;
            }

            // Tally available verified jobs per company
            const jobCounts = await Job.aggregate([
                { $match: { status: 'Active' } },
                { $group: { _id: { $toLower: '$companyName' }, count: { $sum: 1 } } }
            ]);
            const jobCountMap = {};
            jobCounts.forEach(c => {
                jobCountMap[c._id] = c.count;
            });

            enrichedCompanies = dbCompanies.map(comp => {
                const normalizedName = (comp.companyName || '').toLowerCase();
                return {
                    ...comp,
                    availableJobCount: jobCountMap[normalizedName] || 0
                };
            });

            // Cache for 60 seconds
            memoryCache.dbCompaniesWithCounts = enrichedCompanies;
            memoryCache.cacheExpiry = now + 60000;
        }

        let companies = [...enrichedCompanies];

        // Filter by category
        if (category && category !== 'All' && category !== 'All Categories') {
            companies = companies.filter(c => c.category === category);
        }

        // Filter by search
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            companies = companies.filter(c =>
                (c.companyName || '').toLowerCase().includes(q) ||
                (c.industry || '').toLowerCase().includes(q) ||
                (c.category || '').toLowerCase().includes(q)
            );
        }

        const categories = [
            'All',
            'IT Services',
            'Product-Based Companies',
            'Startups',
            'Consulting',
            'Finance and Banking',
            'Core Engineering',
            'Government and Public Sector'
        ];

        return res.json({
            companies,
            totalCount: companies.length,
            categories
        });
    } catch (err) {
        console.error('Error in getCompanies:', err);
        return res.status(500).json({ msg: 'Server error retrieving companies' });
    }
};

// @desc    Get Student's Saved Jobs
// @route   GET /api/jobs/saved
// @access  Private (Student)
exports.getSavedJobs = async (req, res) => {
    try {
        const studentProfile = await Profile.findOne({ user: req.user.id }).lean();
        const savedEntries = await SavedJob.find({ user: req.user.id })
            .populate('job')
            .sort({ savedAt: -1 })
            .lean();

        const savedJobs = savedEntries
            .filter(entry => entry.job) // Ensure populated job exists
            .map(entry => {
                const matchInfo = calculateJobMatch(studentProfile || {}, entry.job);
                return {
                    savedId: entry._id,
                    savedAt: entry.savedAt,
                    notes: entry.notes,
                    job: {
                        ...entry.job,
                        matchScore: matchInfo.matchScore,
                        matchBreakdown: matchInfo.breakdown,
                        matchedSkills: matchInfo.matchedSkills,
                        missingSkills: matchInfo.missingSkills
                    }
                };
            });

        return res.json({ savedJobs, count: savedJobs.length });
    } catch (err) {
        console.error('Error in getSavedJobs:', err);
        return res.status(500).json({ msg: 'Server error retrieving saved jobs' });
    }
};

// @desc    Save a Job for Later Review / Preparation
// @route   POST /api/jobs/saved/:id
// @access  Private (Student)
exports.saveJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(404).json({ msg: 'Job not found' });
        }
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        const existing = await SavedJob.findOne({ user: req.user.id, job: jobId });
        if (existing) {
            return res.json({ msg: 'Job is already saved', isSaved: true, savedJob: existing });
        }

        const savedJob = new SavedJob({
            user: req.user.id,
            job: jobId,
            notes: req.body.notes || ''
        });
        await savedJob.save();

        return res.json({ msg: 'Opportunity saved successfully', isSaved: true, savedJob });
    } catch (err) {
        console.error('Error in saveJob:', err);
        return res.status(500).json({ msg: 'Server error saving job' });
    }
};

// @desc    Remove a Job from Saved Jobs
// @route   DELETE /api/jobs/saved/:id
// @access  Private (Student)
exports.unsaveJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(404).json({ msg: 'Job not found' });
        }
        await SavedJob.findOneAndDelete({ user: req.user.id, job: jobId });
        return res.json({ msg: 'Job removed from saved list', isSaved: false });
    } catch (err) {
        console.error('Error in unsaveJob:', err);
        return res.status(500).json({ msg: 'Server error removing saved job' });
    }
};

// @desc    Get Student's Tracked External Applications
// @route   GET /api/jobs/applications
// @access  Private (Student)
exports.getApplications = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const userEmail = user?.email?.toLowerCase();

        const applications = await JobApplication.find({
            $or: [
                { user: req.user.id },
                { candidateEmail: userEmail }
            ]
        })
            .populate('job')
            .sort({ lastUpdated: -1, appliedAt: -1 })
            .lean();

        return res.json({ applications, count: applications.length });
    } catch (err) {
        console.error('Error in getApplications:', err);
        return res.status(500).json({ msg: 'Server error retrieving applications' });
    }
};

// @desc    Track an External Application (Triggered when student returns from company website)
// @route   POST /api/jobs/applications
// @access  Private (Student)
exports.trackApplication = async (req, res) => {
    try {
        const {
            jobId,
            companyName,
            role,
            officialApplyUrl,
            status = 'Applied',
            notes = '',
            matchScore = 85
        } = req.body;

        if (!jobId) {
            return res.status(400).json({ msg: 'Job identifier is required to track application' });
        }

        const user = await User.findById(req.user.id);
        const job = await Job.findById(jobId);

        let application = await JobApplication.findOne({
            job: jobId,
            $or: [{ user: req.user.id }, { candidateEmail: user.email.toLowerCase() }]
        });

        if (application) {
            application.status = status;
            application.notes = notes || application.notes;
            if (req.body.nextFollowUpDate) application.nextFollowUpDate = new Date(req.body.nextFollowUpDate);
            application.lastUpdated = new Date();
            if (officialApplyUrl) application.officialApplyUrl = officialApplyUrl;
            
            // Add timeline event
            if (!Array.isArray(application.timeline)) application.timeline = [];
            application.timeline.push({
                status: application.status,
                timestamp: new Date(),
                note: notes || `Application record updated`
            });
            await application.save();
        } else {
            application = new JobApplication({
                job: jobId,
                user: req.user.id,
                candidateName: user.name || 'Candidate',
                candidateEmail: user.email.toLowerCase(),
                role: role || job?.title || 'Applicant',
                companyName: companyName || job?.companyName || '',
                officialApplyUrl: officialApplyUrl || job?.officialApplyUrl || '',
                applicationType: 'External',
                status: status,
                isManualStatus: true,
                matchScore: matchScore,
                notes: notes,
                nextFollowUpDate: req.body.nextFollowUpDate ? new Date(req.body.nextFollowUpDate) : null,
                timeline: [{
                    status: status,
                    timestamp: new Date(),
                    note: notes || `External application tracked on company career portal`
                }],
                appliedAt: new Date(),
                lastUpdated: new Date()
            });
            await application.save();

            // Increment job applications count
            if (job) {
                job.applicationsCount = (job.applicationsCount || 0) + 1;
                await job.save();
            }
        }

        return res.json({ msg: 'Application tracked successfully', application });
    } catch (err) {
        console.error('Error in trackApplication:', err);
        return res.status(500).json({ msg: 'Server error tracking application' });
    }
};

// @desc    Update Application Status & Notes (Manual tracking updates)
// @route   PUT /api/jobs/applications/:id
// @access  Private (Student)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const appId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(appId)) {
            return res.status(404).json({ msg: 'Application record not found' });
        }

        const { status, notes } = req.body;
        const user = await User.findById(req.user.id);
        const userEmail = user?.email?.toLowerCase();

        const application = await JobApplication.findOne({
            _id: appId,
            $or: [{ user: req.user.id }, { candidateEmail: userEmail }]
        });

        if (!application) {
            return res.status(404).json({ msg: 'Application record not found' });
        }

        if (status) application.status = status;
        if (typeof notes === 'string') application.notes = notes;
        if (req.body.nextFollowUpDate) application.nextFollowUpDate = new Date(req.body.nextFollowUpDate);
        application.lastUpdated = new Date();
        application.isManualStatus = true;

        if (!Array.isArray(application.timeline)) application.timeline = [];
        application.timeline.push({
            status: application.status,
            timestamp: new Date(),
            note: notes || `Application moved to ${application.status}`
        });

        await application.save();
        return res.json({ msg: 'Application record updated', application });
    } catch (err) {
        console.error('Error in updateApplicationStatus:', err);
        return res.status(500).json({ msg: 'Server error updating application' });
    }
};

// @desc    Delete / Withdraw Application Tracking
// @route   DELETE /api/jobs/applications/:id
// @access  Private (Student)
exports.deleteApplication = async (req, res) => {
    try {
        const appId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(appId)) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        const user = await User.findById(req.user.id);
        const userEmail = user?.email?.toLowerCase();

        const application = await JobApplication.findOneAndDelete({
            _id: appId,
            $or: [{ user: req.user.id }, { candidateEmail: userEmail }]
        });

        if (!application) {
            return res.status(404).json({ msg: 'Application not found' });
        }

        return res.json({ msg: 'Application untracked successfully' });
    } catch (err) {
        console.error('Error in deleteApplication:', err);
        return res.status(500).json({ msg: 'Server error removing application tracking' });
    }
};

// @desc    Get Student Application Journey Statistics
// @route   GET /api/jobs/applications/stats
// @access  Private (Student)
exports.getApplicationStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const userEmail = user?.email?.toLowerCase();

        const apps = await JobApplication.find({
            $or: [{ user: req.user.id }, { candidateEmail: userEmail }]
        }).lean();

        const stats = {
            total: apps.length,
            inProgress: apps.filter(a => ['Saved', 'Preparing', 'Applied', 'Assessment', 'Interview'].includes(a.status)).length,
            saved: apps.filter(a => a.status === 'Saved').length,
            preparing: apps.filter(a => a.status === 'Preparing').length,
            applied: apps.filter(a => a.status === 'Applied').length,
            assessments: apps.filter(a => a.status === 'Assessment').length,
            interviews: apps.filter(a => a.status === 'Interview').length,
            offers: apps.filter(a => a.status === 'Offer').length,
            rejected: apps.filter(a => a.status === 'Rejected').length,
            withdrawn: apps.filter(a => a.status === 'Withdrawn').length,
            upcomingFollowUps: apps.filter(a => a.nextFollowUpDate && new Date(a.nextFollowUpDate).getTime() >= Date.now()).length
        };

        return res.json({ stats, ...stats });
    } catch (err) {
        console.error('Error in getApplicationStats:', err);
        return res.status(500).json({ msg: 'Server error retrieving application stats' });
    }
};

// @desc    Get Student Job Alerts
// @route   GET /api/jobs/alerts
// @access  Private (Student)
exports.getJobAlerts = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const alerts = await JobAlert.find({
            $or: [{ user: req.user.id }, { userEmail: user?.email }]
        }).sort({ createdAt: -1 });

        return res.json({ alerts, count: alerts.length });
    } catch (err) {
        console.error('Error in getJobAlerts:', err);
        return res.status(500).json({ msg: 'Server error retrieving job alerts' });
    }
};

// @desc    Create or Update Job Alert Preferences
// @route   POST /api/jobs/alerts
// @access  Private (Student)
exports.createJobAlert = async (req, res) => {
    try {
        const {
            title,
            role,
            company,
            skills,
            location = 'Any',
            geoScope = 'All',
            targetCountry = '',
            targetCity = '',
            visaSponsorshipOnly = false,
            jobType = 'All',
            workMode = 'All',
            freshersOnly = false,
            frequency = 'Daily',
            minMatchScore = 60,
            notificationChannel = 'IN_APP'
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ msg: 'Alert title is required' });
        }

        const user = await User.findById(req.user.id);

        const newAlert = new JobAlert({
            user: req.user.id,
            userEmail: user.email.toLowerCase(),
            title: title.trim(),
            role: (role || '').trim(),
            company: (company || '').trim(),
            skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
            location: location.trim(),
            geoScope,
            targetCountry: (targetCountry || '').trim(),
            targetCity: (targetCity || '').trim(),
            visaSponsorshipOnly: Boolean(visaSponsorshipOnly),
            jobType,
            workMode,
            freshersOnly: Boolean(freshersOnly),
            frequency,
            minMatchScore: Number(minMatchScore) || 60,
            notificationChannel,
            isActive: true
        });

        await newAlert.save();
        return res.json({ msg: 'Job alert created successfully', alert: newAlert });
    } catch (err) {
        console.error('Error in createJobAlert:', err);
        return res.status(500).json({ msg: 'Server error creating job alert' });
    }
};

// @desc    Delete Job Alert
// @route   DELETE /api/jobs/alerts/:id
// @access  Private (Student)
exports.deleteJobAlert = async (req, res) => {
    try {
        const alertId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(alertId)) {
            return res.status(404).json({ msg: 'Job alert not found' });
        }

        const deleted = await JobAlert.findOneAndDelete({ _id: alertId, user: req.user.id });
        if (!deleted) {
            return res.status(404).json({ msg: 'Job alert not found' });
        }

        return res.json({ msg: 'Job alert deleted successfully' });
    } catch (err) {
        console.error('Error in deleteJobAlert:', err);
        return res.status(500).json({ msg: 'Server error deleting job alert' });
    }
};

// @desc    Toggle Job Alert Active Status
// @route   PATCH /api/jobs/alerts/:id/toggle
// @access  Private (Student)
exports.toggleJobAlert = async (req, res) => {
    try {
        const alertId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(alertId)) {
            return res.status(404).json({ msg: 'Job alert not found' });
        }

        const alert = await JobAlert.findOne({ _id: alertId, user: req.user.id });
        if (!alert) {
            return res.status(404).json({ msg: 'Job alert not found' });
        }

        alert.isActive = !alert.isActive;
        await alert.save();
        return res.json({ msg: `Alert ${alert.isActive ? 'activated' : 'paused'}`, alert });
    } catch (err) {
        console.error('Error in toggleJobAlert:', err);
        return res.status(500).json({ msg: 'Server error toggling alert' });
    }
};

