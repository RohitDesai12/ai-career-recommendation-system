const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    logoUrl: {
        type: String,
        default: ''
    },
    industry: {
        type: String,
        required: true,
        index: true
    },
    category: {
        type: String,
        enum: [
            'IT Services',
            'Product-Based Companies',
            'Startups',
            'Consulting',
            'Finance and Banking',
            'Core Engineering',
            'Government and Public Sector'
        ],
        default: 'IT Services',
        index: true
    },
    description: {
        type: String,
        default: ''
    },
    officialWebsite: {
        type: String,
        required: true,
        trim: true
    },
    careerPageUrl: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        default: 'Pan India / Global'
    },
    companySize: {
        type: String,
        default: '10,000+'
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    availableJobCount: {
        type: Number,
        default: 0
    },
    hasLiveIntegration: {
        type: Boolean,
        default: false,
        index: true
    },
    integrationType: {
        type: String,
        enum: ['GREENHOUSE', 'LEVER', 'FEED', 'NONE'],
        default: 'NONE'
    },
    boardToken: {
        type: String,
        default: ''
    },
    lastSyncAt: {
        type: Date,
        default: null
    },
    lastSyncJobCount: {
        type: Number,
        default: 0
    },
    lastSyncStatus: {
        type: String,
        enum: ['IDLE', 'SUCCESS', 'FAILED'],
        default: 'IDLE'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

CompanySchema.index({ companyName: 'text', industry: 'text', description: 'text' });

module.exports = mongoose.model('Company', CompanySchema);

