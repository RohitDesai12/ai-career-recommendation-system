const mongoose = require('mongoose');

const EducationRecordSchema = new mongoose.Schema({
    degree: { type: String, required: true, trim: true },
    level: {
        type: String,
        enum: ['Undergraduate', 'Postgraduate', 'Higher Secondary', 'Secondary', 'Diploma', 'Doctorate', 'Other'],
        default: 'Undergraduate'
    },
    specialization: { type: String, default: '', trim: true },
    institution: { type: String, required: true, trim: true },
    location: { type: String, default: '', trim: true },
    startYear: { type: String, default: '' },
    endYear: { type: String, default: '' },
    currentYear: { type: String, default: '' }, // e.g. "3rd Year", "Final Year", "Graduated"
    grade: { type: String, default: '' },
    gradingScale: {
        type: String,
        enum: ['10.0 Scale', '4.0 Scale', 'Percentage (100%)', 'Letter Grade', 'Other'],
        default: '10.0 Scale'
    }
}, { _id: true });

const CategorizedSkillSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: {
        type: String,
        enum: [
            'Programming Languages',
            'Frontend Development',
            'Backend Development',
            'Databases',
            'AI & Machine Learning',
            'Data Engineering',
            'Cloud & DevOps',
            'Tools & Technologies',
            'Cybersecurity',
            'Other Technical'
        ],
        default: 'Programming Languages'
    },
    proficiency: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Proficient', 'Advanced'],
        default: 'Intermediate'
    },
    yearsExperience: { type: String, default: '' }
}, { _id: true });

const WorkExperienceSchema = new mongoose.Schema({
    company: { type: String, required: true, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    employmentType: {
        type: String,
        enum: ['Full-time', 'Internship', 'Part-time', 'Contract', 'Freelance'],
        default: 'Internship'
    },
    location: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    currentlyWorking: { type: Boolean, default: false },
    responsibilities: { type: String, default: '' },
    technologies: { type: [String], default: [] },
    achievements: { type: String, default: '' },
    certificateUrl: { type: String, default: '' }
}, { _id: true });

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    detailedDescription: { type: String, default: '' },
    techStack: { type: [String], default: [] },
    category: {
        type: String,
        enum: ['Web Development', 'AI & Machine Learning', 'Mobile App', 'Cloud & DevOps', 'Data Engineering', 'Systems & Embedded', 'Other'],
        default: 'Web Development'
    },
    github: { type: String, default: '' },
    link: { type: String, default: '' }, // Live demo
    startDate: { type: String, default: '' },
    completionDate: { type: String, default: '' },
    role: { type: String, default: '' },
    contributions: { type: String, default: '' },
    image: { type: String, default: '' },
    featured: { type: Boolean, default: false }
}, { _id: true });

const CertificationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    issueDate: { type: String, default: '' },
    expiryDate: { type: String, default: '' },
    credentialId: { type: String, default: '' },
    credentialUrl: { type: String, default: '' }
}, { _id: true });

const AchievementSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    category: {
        type: String,
        enum: ['Hackathon', 'Competition', 'Academic', 'Technical Event', 'Publication', 'Award', 'Other'],
        default: 'Competition'
    },
    description: { type: String, default: '' },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' },
    url: { type: String, default: '' }
}, { _id: true });

const LanguageSchema = new mongoose.Schema({
    language: { type: String, required: true, trim: true },
    proficiency: {
        type: String,
        enum: ['Basic', 'Conversational', 'Professional', 'Fluent', 'Native'],
        default: 'Conversational'
    }
}, { _id: true });

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Designation & Professional Headline
    designation: {
        type: String,
        default: 'Student & Aspiring Software Engineer',
        trim: true
    },
    summary: {
        type: String,
        default: '',
        trim: true
    },

    // Personal & Contact Info
    dob: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    preferredContactMethod: {
        type: String,
        enum: ['Email', 'Phone', 'LinkedIn'],
        default: 'Email'
    },

    // Public Profile & Privacy Preferences
    isPublic: { type: Boolean, default: true },
    publicPreferences: {
        showEmail: { type: Boolean, default: false },
        showPhone: { type: Boolean, default: false },
        showEducation: { type: Boolean, default: true },
        showExperience: { type: Boolean, default: true },
        showProjects: { type: Boolean, default: true },
        showSkills: { type: Boolean, default: true },
        showCertifications: { type: Boolean, default: true }
    },

    // Education & Academics (Multi-record + Legacy compatibility)
    educationHistory: [EducationRecordSchema],
    education: { type: String, default: null }, // Legacy
    college: { type: String, default: '' }, // Legacy
    graduationYear: { type: String, default: '' }, // Legacy
    department: { type: String, default: '' }, // Legacy

    // Skills (Categorized + Legacy compatibility)
    categorizedSkills: [CategorizedSkillSchema],
    skills: [String], // Legacy flat array
    skill_ratings: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    softSkills: {
        type: [String],
        default: ['Communication', 'Problem-solving', 'Teamwork', 'Time management', 'Adaptability']
    },
    languages: [LanguageSchema],

    // Work Experience & Internships
    isFresher: { type: Boolean, default: true },
    workExperience: [WorkExperienceSchema],

    // Projects & Portfolio
    projects: [ProjectSchema],

    // Certifications & Achievements
    certifications: [CertificationSchema],
    achievements: [AchievementSchema],

    // Professional & Social Links
    professionalLinks: {
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        leetcode: { type: String, default: '' },
        hackerrank: { type: String, default: '' },
        kaggle: { type: String, default: '' },
        portfolio: { type: String, default: '' },
        other: { type: String, default: '' }
    },

    // Career Preferences (Connected to Jobs module)
    careerPreferences: {
        preferredRoles: { type: [String], default: [] },
        geoScope: {
            type: String,
            enum: ['india', 'international', 'remote', 'all'],
            default: 'india'
        },
        preferredCountries: { type: [String], default: ['India'] },
        preferredStates: { type: [String], default: [] },
        preferredCities: { type: [String], default: [] },
        workModes: { type: [String], default: ['Hybrid', 'Remote'] },
        minSalary: { type: Number, default: 0 },
        employmentTypes: { type: [String], default: ['Full Time', 'Internship'] },
        experienceLevel: { type: String, default: '0-2 years' },
        preferredIndustries: { type: [String], default: ['Technology', 'Software', 'Fintech'] },
        willingToRelocate: { type: Boolean, default: true },
        internationalWorkAuthorization: { type: Boolean, default: false },
        jobAlertsEnabled: { type: Boolean, default: true },
        alertFrequency: { type: String, enum: ['Daily', 'Weekly', 'Instant'], default: 'Daily' }
    },

    targetCareer: {
        type: String,
        default: null
    },
    recommendedCareers: [{
        title: String,
        confidence: Number,
        description: String
    }],
    interests: [String],
    aptitudeScore: {
        type: Number,
        default: null
    },
    resumeUrl: {
        type: String,
        default: null
    },
    resumeData: {
        atsScore: { type: Number, default: null },
        shortlistChance: { type: Number, default: null },
        keywordScore: { type: Number, default: null },
        role: { type: String, default: null },
        strengths: { type: [String], default: [] },
        improvements: { type: [String], default: [] },
        analyzedAt: { type: Date, default: null }
    },
    savedCourses: {
        type: [Number],
        default: []
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Profile', ProfileSchema);
