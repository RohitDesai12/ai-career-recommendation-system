const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employer',
        required: false
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: false
    },
    companyName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    department: {
        type: String,
        default: 'Engineering',
        index: true
    },
    category: {
        type: String,
        default: 'Software Development',
        index: true
    },
    location: {
        type: String,
        default: 'Remote',
        index: true
    },
    country: {
        type: String,
        default: '',
        index: true,
        trim: true
    },
    countryCode: {
        type: String,
        default: '',
        index: true,
        uppercase: true,
        trim: true
    },
    state: {
        type: String,
        default: '',
        trim: true
    },
    city: {
        type: String,
        default: '',
        index: true,
        trim: true
    },
    locationType: {
        type: String,
        enum: ['Domestic', 'International', 'Remote_Worldwide', 'Remote_Country_Specific', 'Unspecified'],
        default: 'Unspecified',
        index: true
    },
    remoteEligibility: {
        type: String,
        enum: ['India Eligible', 'Worldwide Eligible', 'Specific Countries Only', 'Eligibility Unclear'],
        default: 'Eligibility Unclear',
        index: true
    },
    eligibleCountries: {
        type: [String],
        default: []
    },
    excludedCountries: {
        type: [String],
        default: []
    },
    visaSponsorship: {
        type: String,
        enum: ['Available', 'Not Available', 'Unspecified'],
        default: 'Unspecified',
        index: true
    },
    relocationAssistance: {
        type: String,
        enum: ['Available', 'Not Available', 'Unspecified'],
        default: 'Unspecified'
    },
    workAuthorization: {
        type: String,
        default: '',
        trim: true
    },
    type: {
        type: String,
        default: 'Full-Time',
        index: true
    },
    workMode: {
        type: String,
        default: 'Hybrid',
        index: true
    },
    experience: {
        type: String,
        default: '0–2 years'
    },
    freshersEligible: {
        type: Boolean,
        default: true,
        index: true
    },
    openings: {
        type: Number,
        default: 1
    },
    salary: {
        type: String,
        default: 'Disclosed upon shortlisting'
    },
    salaryMin: {
        type: Number,
        default: 0
    },
    salaryMax: {
        type: Number,
        default: 0
    },
    isDisclosedSalary: {
        type: Boolean,
        default: true
    },
    salaryCurrency: {
        type: String,
        default: 'INR',
        trim: true
    },
    skills: {
        type: [String],
        default: [],
        index: true
    },
    preferredSkills: {
        type: [String],
        default: []
    },
    education: {
        type: String,
        default: "Bachelor's Degree in Computer Science or related field"
    },
    description: {
        type: String,
        default: ''
    },
    responsibilities: {
        type: [String],
        default: []
    },
    benefits: {
        type: [String],
        default: []
    },
    screeningQuestions: {
        type: [String],
        default: []
    },
    deadline: {
        type: String,
        default: 'Open / Ongoing'
    },
    officialApplyUrl: {
        type: String,
        default: ''
    },
    externalApplyUrl: {
        type: String,
        default: ''
    },
    sourceJobId: {
        type: String,
        default: null,
        index: true
    },
    sourceType: {
        type: String,
        enum: ['ATS_GREENHOUSE', 'ATS_LEVER', 'JSON_FEED', 'MANUAL_SEED', 'OFFICIAL_CAREER_PORTAL'],
        default: 'MANUAL_SEED',
        index: true
    },
    sourcePublishedAt: {
        type: Date,
        default: null
    },
    firstSeenAt: {
        type: Date,
        default: Date.now
    },
    lastSeenAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        default: null
    },
    consecutiveMissingCount: {
        type: Number,
        default: 0
    },
    sourceName: {
        type: String,
        default: 'Official Career Portal'
    },
    sourceUrl: {
        type: String,
        default: ''
    },
    lastVerifiedDate: {
        type: Date,
        default: Date.now
    },
    verificationStatus: {
        type: String,
        enum: ['Verified', 'Under Review', 'Unverified'],
        default: 'Verified'
    },
    dataQualityStatus: {
        type: String,
        enum: ['High Quality', 'Acceptable', 'Needs Review', 'Invalid'],
        default: 'Acceptable',
        index: true
    },
    validationErrors: {
        type: [String],
        default: []
    },
    lastQualityCheck: {
        type: Date,
        default: Date.now
    },
    qualityDetails: {
        hasTitle: { type: Boolean, default: true },
        hasCompany: { type: Boolean, default: true },
        hasDescription: { type: Boolean, default: true },
        hasValidUrl: { type: Boolean, default: true },
        hasSkills: { type: Boolean, default: false },
        hasLocation: { type: Boolean, default: true },
        hasExperience: { type: Boolean, default: true },
        qualityScore: { type: Number, default: 80 }
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Paused', 'Closed', 'Draft', 'Rejected', 'Expired'],
        default: 'Active',
        index: true
    },
    applicationsCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Text index for unified full-text search across title, company, skills, description
JobSchema.index({
    title: 'text',
    companyName: 'text',
    skills: 'text',
    description: 'text'
});

// Ingestion and telemetry compound indexes
JobSchema.index({ sourceJobId: 1, companyName: 1 }, { sparse: true });
JobSchema.index({ status: 1, lastSeenAt: -1 });
JobSchema.index({ status: 1, sourceType: 1 });
JobSchema.index({ status: 1, dataQualityStatus: 1, firstSeenAt: -1 });
JobSchema.index({ status: 1, category: 1 });
JobSchema.index({ status: 1, workMode: 1 });
JobSchema.index({ status: 1, freshersEligible: 1 });

// Phase 5: Geographical classification and discovery compound indexes
JobSchema.index({ status: 1, locationType: 1 });
JobSchema.index({ status: 1, country: 1 });
JobSchema.index({ status: 1, countryCode: 1 });
JobSchema.index({ status: 1, city: 1 });
JobSchema.index({ status: 1, remoteEligibility: 1 });
JobSchema.index({ status: 1, visaSponsorship: 1 });

module.exports = mongoose.model('Job', JobSchema);
