const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fileUrl: {
        type: String, // Cloudinary URL
        required: true,
    },
    reportType: {
        type: String, // Lab, X-Ray, Prescription, etc.
        required: true,
        default: 'Lab Report',
    },
    uploadDate: {
        type: Date,
        default: Date.now,
    },
    aiSummaryEnglish: {
        type: String,
        default: '',
    },
    aiSummaryUrdu: {
        type: String,
        default: '',
    },
    abnormalValues: {
        type: [String],
        default: [],
    },
    doctorQuestions: {
        type: [String],
        default: [],
    },
    foodsToAvoid: {
        type: [String],
        default: [],
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
    }],
    isPublic: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
