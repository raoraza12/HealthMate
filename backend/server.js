const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static uploaded files
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vitals', require('./routes/vitals'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/timeline', require('./routes/timeline'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/ai-agent', require('./routes/ai-agent'));
app.use('/api/dashboard-stats', require('./routes/dashboard-stats'));

// Default route
app.get('/', (req, res) => {
    res.send('HealthMate API is running...');
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/healthmate')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB initially. Retrying in background...', err.message);
    });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
