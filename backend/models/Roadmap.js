const mongoose = require('mongoose');

const SkillProgressSchema = new mongoose.Schema({
    name: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

const StageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    weeks: { type: Number, default: 4 },
    status: { type: String, enum: ['Completed', 'In progress', 'Locked'], default: 'Locked' },
    skills: [SkillProgressSchema],
    resources: [{
        name: { type: String, required: true },
        url: { type: String },
        type: { type: String, default: 'Course' } // 'Course', 'Practice', 'Doc'
    }]
});

const RoadmapSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: { type: String, required: true },
    field: { type: String, required: true },
    stages: [StageSchema],
    percentComplete: { type: Number, default: 0 },
    stagesComplete: { type: Number, default: 0 },
    totalStages: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
