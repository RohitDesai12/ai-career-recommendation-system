const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/ml', require('./routes/ml'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/interview-prep', require('./routes/interviewPrep'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Database Connection & Server Start
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log('Database connection error:', err));
