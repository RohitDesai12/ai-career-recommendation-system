const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        default: 'Untitled Resume'
    },
    targetRole: {
        type: String,
        default: 'Software Engineer',
        trim: true
    },
    template: {
        type: String,
        default: 'Modern'
    },
    accentColor: {
        type: String,
        default: '#4F46E5'
    },
    fontFamily: {
        type: String,
        default: 'Inter'
    },
    fontSize: {
        type: String,
        default: 'medium'
    },
    personalInfo: {
        fullName: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        location: { type: String, default: '' },
        website: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' }
    },
    summary: {
        type: String,
        default: ''
    },
    experience: [{
        role: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: 'Present' },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' },
        bulletPoints: [{ type: String }]
    }],
    education: [{
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        location: { type: String, default: '' },
        graduationYear: { type: String, default: '' },
        gpa: { type: String, default: '' }
    }],
    skills: [{
        category: { type: String, default: 'Technical Skills' },
        items: [{ type: String }]
    }],
    projects: [{
        title: { type: String, required: true },
        description: { type: String, default: '' },
        techStack: [{ type: String }],
        link: { type: String, default: '' },
        github: { type: String, default: '' }
    }],
    certifications: [{
        name: { type: String, required: true },
        issuer: { type: String, default: '' },
        issueDate: { type: String, default: '' },
        credentialUrl: { type: String, default: '' }
    }],
    achievements: [{
        title: { type: String, required: true },
        description: { type: String, default: '' },
        year: { type: String, default: '' }
    }],
    languages: [{
        language: { type: String, required: true },
        proficiency: { type: String, default: 'Fluent' }
    }],
    customSections: [{
        title: { type: String, required: true },
        content: { type: String, default: '' },
        items: [{
            title: { type: String, default: '' },
            subtitle: { type: String, default: '' },
            date: { type: String, default: '' },
            description: { type: String, default: '' }
        }]
    }],
    links: [{
        label: { type: String, default: '' },
        url: { type: String, default: '' }
    }],
    score: {
        overall: { type: Number, default: 75 },
        atsScore: { type: Number, default: 75 },
        contentQuality: { type: Number, default: 80 },
        skillsMatch: { type: Number, default: 70 },
        structureFormat: { type: Number, default: 85 }
    },
    isTailored: {
        type: Boolean,
        default: false
    },
    targetJobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        default: null
    },
    targetJobTitle: {
        type: String,
        default: ''
    },
    targetJobCompany: {
        type: String,
        default: ''
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

ResumeSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Resume', ResumeSchema);
