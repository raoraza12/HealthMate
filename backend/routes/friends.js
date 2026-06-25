const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/friends/suggestions
// @desc    Get connection suggestions (all users except current user and current friends)
// @access  Private
router.get('/suggestions', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Find all users who are not already in the currentUser's friends list
        // and are not the currentUser themselves
        const suggestions = await User.find({
            _id: { $ne: currentUser._id, $nin: currentUser.friends }
        }).select('-password');

        res.json(suggestions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/friends/connect
// @desc    Connect with a user (add as friend bidirectionally)
// @access  Private
router.post('/connect', auth, async (req, res) => {
    const { friendId } = req.body;

    try {
        if (req.user.id === friendId) {
            return res.status(400).json({ msg: 'You cannot connect with yourself' });
        }

        const user = await User.findById(req.user.id);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ msg: 'User or target connection not found' });
        }

        // Check if already friends
        if (user.friends.includes(friendId)) {
            return res.status(400).json({ msg: 'Already connected with this user' });
        }

        // Connect bidirectionally
        user.friends.push(friendId);
        friend.friends.push(req.user.id);

        await user.save();
        await friend.save();

        res.json({ msg: 'Successfully connected', friends: user.friends });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/friends/list
// @desc    Get current connections/friends list
// @access  Private
router.get('/list', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends', '-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user.friends);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
