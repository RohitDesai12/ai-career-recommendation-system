const mongoose = require('mongoose');

const JobAlertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        default: '',
        trim: true
    },
    company: {
        type: String,
        default: '',
        trim: true
    },
    keywords: {
        type: [String],
        default: []
    },
    skills: {
        type: [String],
        default: []
    },
    location: {
        type: String,
        default: 'Any'
    },
    geoScope: {
        type: String,
        enum: ['India', 'International', 'Remote Worldwide', 'All'],
        default: 'All'
    },
    targetCountry: {
        type: String,
        default: ''
    },
    targetCity: {
        type: String,
        default: ''
    },
    visaSponsorshipOnly: {
        type: Boolean,
        default: false
    },
    jobType: {
        type: String,
        default: 'All' // Full-time, Internship, All
    },
    workMode: {
        type: String,
        default: 'All' // Remote, Hybrid, On-site, All
    },
    freshersOnly: {
        type: Boolean,
        default: false
    },
    frequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Instant'],
        default: 'Daily'
    },
    minMatchScore: {
        type: Number,
        default: 60
    },
    notificationChannel: {
        type: String,
        enum: ['IN_APP', 'EMAIL', 'BOTH', 'in-app', 'email', 'both'],
        default: 'IN_APP',
        set: v => (v ? v.toUpperCase().replace('-', '_') : 'IN_APP')
    },
    notifiedJobIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    triggeredCount: {
        type: Number,
        default: 0
    },
    notificationsSent: {
        type: Number,
        default: 0
    },
    failedNotifications: {
        type: Number,
        default: 0
    },
    lastTriggeredAt: {
        type: Date
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

module.exports = mongoose.model('JobAlert', JobAlertSchema);
