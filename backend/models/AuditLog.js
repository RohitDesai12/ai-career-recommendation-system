const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    adminName: {
        type: String,
        default: 'System Admin'
    },
    action: {
        type: String,
        required: true
    },
    target: {
        type: String,
        default: ''
    },
    targetType: {
        type: String,
        enum: ['Job', 'Company', 'User', 'Application', 'Report', 'Content', 'PrivacyRequest', 'System'],
        default: 'System'
    },
    details: {
        type: String,
        default: ''
    },
    ip: {
        type: String,
        default: '127.0.0.1'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
