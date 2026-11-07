const mongoose = require('mongoose');

const EmployerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyName: {
        type: String,
        default: '',
        trim: true
    },
    workEmail: {
        type: String,
        default: '',
        trim: true,
        lowercase: true
    },
    companyWebsite: {
        type: String,
        default: '',
        trim: true
    },
    website: {
        type: String,
        default: '',
        trim: true
    },
    companySize: {
        type: String,
        default: '11–50'
    },
    industry: {
        type: String,
        default: 'Information Technology'
    },
    contactPerson: {
        type: String,
        default: '',
        trim: true
    },
    phone: {
        type: String,
        default: '',
        trim: true
    },
    companyLogo: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: ''
    },
    aboutCompany: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: 'Bangalore, India'
    },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Suspended', 'Rejected'],
        default: 'Verified'
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    foundedYear: {
        type: String,
        default: '2020'
    },
    plan: {
        type: String,
        enum: ['Free', 'Professional', 'Business'],
        default: 'Professional'
    },
    planStatus: {
        type: String,
        enum: ['Active', 'Trial', 'Expired', 'Cancelled'],
        default: 'Active'
    },
    billingCycle: {
        type: String,
        enum: ['Monthly', 'Annual'],
        default: 'Monthly'
    },
    nextBillingDate: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    settings: {
        notifyNewApplications: { type: Boolean, default: true },
        notifyCandidateMessages: { type: Boolean, default: true },
        notifyInterviewUpdates: { type: Boolean, default: true },
        notifyJobStatus: { type: Boolean, default: true },
        emailDigest: { type: Boolean, default: true },
        defaultJobVisibility: { type: String, default: 'Public' },
        autoAcknowledge: { type: Boolean, default: true }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Employer', EmployerSchema);
