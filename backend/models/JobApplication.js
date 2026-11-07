const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        index: true
    },
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employer',
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true
    },
    candidateName: {
        type: String,
        required: true,
        trim: true
    },
    candidateEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    companyName: {
        type: String,
        default: '',
        trim: true
    },
    officialApplyUrl: {
        type: String,
        default: ''
    },
    applicationType: {
        type: String,
        enum: ['External', 'Direct'],
        default: 'External'
    },
    matchScore: {
        type: Number,
        default: 85 // 0-100%
    },
    matchReason: {
        type: String,
        default: 'Technical synergy in required job skills.'
    },
    skills: {
        type: [String],
        default: []
    },
    experienceYears: {
        type: Number,
        default: 1
    },
    avatar: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: [
            'Saved',
            'Preparing',
            'Applied',
            'Assessment',
            'Interview',
            'Offer',
            'Rejected',
            'Withdrawn',
            // Legacy aliases for backward compatibility:
            'Reviewed',
            'Shortlisted',
            'Hired',
            'Under Review'
        ],
        default: 'Applied',
        index: true
    },
    isManualStatus: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String,
        default: ''
    },
    nextFollowUpDate: {
        type: Date,
        default: null
    },
    timeline: [{
        status: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: {
            type: String,
            default: ''
        }
    }],
    appliedAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Enforce unique application per candidate/user per job
JobApplicationSchema.index({ job: 1, user: 1 }, { unique: true, sparse: true });
JobApplicationSchema.index({ job: 1, candidateEmail: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
