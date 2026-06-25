const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Vital = require('../models/Vital');

// @route   POST api/vitals
// @desc    Add a vital entry
// @access  Private
router.post('/', auth, async (req, res) => {
    const { bp, sugar, weight, heartRate, temperature, notes, date } = req.body;

    try {
        const newVital = new Vital({
            userId: req.user.id,
            bp,
            sugar,
            weight,
            heartRate,
            temperature,
            notes,
            date: date || Date.now(),
        });

        const vital = await newVital.save();
        res.json(vital);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/vitals
// @desc    Get all vitals for logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const vitals = await Vital.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(vitals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/vitals/:id
// @desc    Delete a vital entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const vital = await Vital.findById(req.params.id);

        if (!vital) {
            return res.status(404).json({ msg: 'Vital entry not found' });
        }

        // Make sure user owns vital entry
        if (vital.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await vital.deleteOne();

        res.json({ msg: 'Vital entry removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Vital entry not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
