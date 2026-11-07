const mongoose = require('mongoose');

const PrivacyRequestSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    userEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    requestType: {
        type: String,
        enum: [
            'general_enquiry',
            'technical_issue',
            'privacy_request',
            'data_deletion',
            'data_export',
            'security_concern',
            'feedback'
        ],
        required: true,
        index: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Processing', 'Completed', 'Rejected'],
        default: 'Pending',
        index: true
    },
    rejectionReason: {
        type: String,
        default: '',
        trim: true
    },
    resolutionNotes: {
        type: String,
        default: '',
        trim: true
    },
    resolvedBy: {
        type: String,
        default: ''
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        default: ''
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

PrivacyRequestSchema.pre('save', function () {
    this.updatedAt = new Date();
    if (!this.ticketId) {
        const randomDigits = Math.floor(100000 + Math.random() * 900000);
        this.ticketId = `CC-REQ-${randomDigits}`;
    }
});

module.exports = mongoose.model('PrivacyRequest', PrivacyRequestSchema);
