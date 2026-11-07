const mongoose = require('mongoose');

const PrivacyConsentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true
    },
    userEmail: {
        type: String,
        default: '',
        trim: true,
        lowercase: true
    },
    consentType: {
        type: String,
        enum: ['registration', 'cookie_preferences', 'marketing_opt_in', 'profile_visibility', 'consent_withdrawal'],
        required: true
    },
    documentVersion: {
        type: String,
        default: 'v1.0'
    },
    preferences: {
        essential: { type: Boolean, default: true },
        functional: { type: Boolean, default: false },
        analytics: { type: Boolean, default: false },
        marketing: { type: Boolean, default: false }
    },
    termsAccepted: {
        type: Boolean,
        default: false
    },
    privacyAccepted: {
        type: Boolean,
        default: false
    },
    ipAddress: {
        type: String,
        default: ''
    },
    userAgent: {
        type: String,
        default: ''
    },
    recordedAt: {
        type: Date,
        default: Date.now
    }
});

PrivacyConsentSchema.index({ user: 1, consentType: 1 });
PrivacyConsentSchema.index({ recordedAt: -1 });

module.exports = mongoose.model('PrivacyConsent', PrivacyConsentSchema);

