const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const Vital = require('../models/Vital');

// @route   GET api/timeline
// @desc    Get merged & sorted list of reports and vitals
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Fetch all reports
        const reports = await Report.find({ userId: req.user.id }).lean();
        
        // Fetch all vitals
        const vitals = await Vital.find({ userId: req.user.id }).lean();

        // Standardize timeline entries
        const timelineEntries = [
            ...reports.map(report => ({
                id: report._id,
                entryType: 'report',
                date: report.uploadDate || report.createdAt,
                title: report.reportType,
                fileUrl: report.fileUrl,
                aiSummaryEnglish: report.aiSummaryEnglish,
                aiSummaryUrdu: report.aiSummaryUrdu,
                abnormalValues: report.abnormalValues || [],
                doctorQuestions: report.doctorQuestions || [],
                foodsToAvoid: report.foodsToAvoid || [],
            })),
            ...vitals.map(vital => ({
                id: vital._id,
                entryType: 'vital',
                date: vital.date || vital.createdAt,
                title: 'Vitals Logged',
                bp: vital.bp,
                sugar: vital.sugar,
                weight: vital.weight,
                heartRate: vital.heartRate,
                temperature: vital.temperature,
                notes: vital.notes
            }))
        ];

        // Sort by date descending (most recent first)
        timelineEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(timelineEntries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
