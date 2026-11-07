const mongoose = require('mongoose');

const SkillProgressSchema = new mongoose.Schema({
    name: { type: String, required: true },
    status: {
        type: String,
        enum: ['Not Started', 'Beginner', 'Intermediate', 'Advanced', 'Completed'],
        default: 'Not Started'
    },
    completed: { type: Boolean, default: false },
    required: { type: Number, default: 75 },
    category: { type: String, default: 'Technical' }
});

const ResourceProgressSchema = new mongoose.Schema({
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        default: null
    },
    name: { type: String, required: true },
    provider: { type: String, default: 'Official Documentation' },
    url: { type: String, required: true },
    type: { type: String, default: 'Doc' }, // 'Doc', 'Course', 'Practice', 'Video', 'Tutorial'
    duration: { type: String, default: '2-3 hours' },
    isFree: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 },
    completed: { type: Boolean, default: false },
    isCustom: { type: Boolean, default: false }
});

const StageProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    duration: { type: String, default: '1-2 Weeks' },
    skills: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    suggestedTechnologies: { type: [String], default: [] },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started'
    },
    githubUrl: { type: String, default: '' },
    liveDemoUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
    completedAt: { type: Date, default: null }
});

const StageSchema = new mongoose.Schema({
    stageNumber: { type: Number, default: 1 },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    weeks: { type: Number, default: 4 },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed', 'Locked'],
        default: 'Locked'
    },
    progressPercent: { type: Number, default: 0 },
    skills: [SkillProgressSchema],
    resources: [ResourceProgressSchema],
    projects: [StageProjectSchema],
    aiTip: { type: String, default: '' }
});

const RoadmapMilestoneSchema = new mongoose.Schema({
    title: { type: String, required: true },
    stageNumber: { type: Number, default: 1 },
    durationWeeks: { type: Number, default: 2 },
    targetTimeframe: { type: String, default: 'In 2 weeks' },
    completed: { type: Boolean, default: false }
});

const RoadmapSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: { type: String, required: true },
    field: { type: String, required: true },
    targetCareer: { type: String, default: '' },
    learningPaceHoursPerWeek: { type: Number, default: 10 },
    preferredLearningStyle: {
        type: String,
        enum: ['Mixed', 'Hands-on', 'Video', 'Reading'],
        default: 'Mixed'
    },
    stages: [StageSchema],
    milestones: [RoadmapMilestoneSchema],
    percentComplete: { type: Number, default: 0 },
    stagesComplete: { type: Number, default: 0 },
    totalStages: { type: Number, default: 4 },
    completedSkillsCount: { type: Number, default: 0 },
    totalSkillsCount: { type: Number, default: 0 },
    completedProjectsCount: { type: Number, default: 0 },
    totalProjectsCount: { type: Number, default: 0 },
    totalResourcesCount: { type: Number, default: 0 },
    estimatedMonths: { type: String, default: '~4 Months' },
    careerReadinessScore: { type: Number, default: 25 },
    isPrimary: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Paused', 'Completed', 'Archived'],
        default: 'In Progress'
    },
    version: { type: Number, default: 1 },
    lastAccessedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
