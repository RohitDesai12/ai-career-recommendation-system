const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    reporterName: {
        type: String,
        default: 'Anonymous'
    },
    reporterEmail: {
        type: String,
        default: ''
    },
    reportedItem: {
        type: String,
        required: true
    },
    itemType: {
        type: String,
        enum: ['Job', 'Company', 'User', 'Content'],
        required: true
    },
    itemId: {
        type: String,
        default: ''
    },
    reason: {
        type: String,
        required: true
    },
    details: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Resolved', 'Dismissed'],
        default: 'Pending'
    },
    resolutionNotes: {
        type: String,
        default: ''
    },
    resolvedBy: {
        type: String,
        default: ''
    },
    resolvedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', ReportSchema);
