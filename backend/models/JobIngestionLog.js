const mongoose = require('mongoose');

const JobIngestionLogSchema = new mongoose.Schema({
    sourceId: {
        type: String,
        required: true,
        index: true
    },
    sourceName: {
        type: String,
        required: true
    },
    sourceType: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'PARTIAL', 'FAILED'],
        required: true,
        index: true
    },
    jobsFetched: {
        type: Number,
        default: 0
    },
    jobsAccepted: {
        type: Number,
        default: 0
    },
    jobsRejected: {
        type: Number,
        default: 0
    },
    newJobsCreated: {
        type: Number,
        default: 0
    },
    existingJobsUpdated: {
        type: Number,
        default: 0
    },
    duplicateJobsDetected: {
        type: Number,
        default: 0
    },
    jobsExpired: {
        type: Number,
        default: 0
    },
    executionDurationMs: {
        type: Number,
        default: 0
    },
    triggerType: {
        type: String,
        enum: ['SCHEDULED', 'MANUAL'],
        default: 'SCHEDULED'
    },
    errorLog: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        message: String,
        details: mongoose.Schema.Types.Mixed
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('JobIngestionLog', JobIngestionLogSchema);
