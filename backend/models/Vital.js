const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    bp: {
        type: String, // e.g., '120/80'
    },
    sugar: {
        type: Number, // mg/dL
    },
    weight: {
        type: Number, // kg
    },
    heartRate: {
        type: Number, // bpm
    },
    temperature: {
        type: Number, // Fahrenheit
    },
    notes: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Vital', vitalSchema);
