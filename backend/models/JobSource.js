const mongoose = require('mongoose');

const JobSourceSchema = new mongoose.Schema({
    sourceId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    sourceName: {
        type: String,
        required: true,
        trim: true
    },
    sourceType: {
        type: String,
        enum: ['ATS_GREENHOUSE', 'ATS_LEVER', 'JSON_FEED'],
        required: true,
        index: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    boardToken: {
        type: String,
        default: '',
        trim: true
    },
    feedUrl: {
        type: String,
        default: '',
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    syncFrequencyMinutes: {
        type: Number,
        default: 360 // 6 hours
    },
    lastAttemptedSync: {
        type: Date,
        default: null
    },
    lastSuccessfulSync: {
        type: Date,
        default: null
    },
    nextScheduledSync: {
        type: Date,
        default: null
    },
    failureCount: {
        type: Number,
        default: 0
    },
    lastError: {
        type: String,
        default: null
    },
    totalJobsDiscovered: {
        type: Number,
        default: 0
    },
    activeJobsCount: {
        type: Number,
        default: 0
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

JobSourceSchema.index({ isActive: 1, nextScheduledSync: 1 });

module.exports = mongoose.model('JobSource', JobSourceSchema);

