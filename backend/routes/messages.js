const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Report = require('../models/Report');
const User = require('../models/User');

// @route   GET api/messages/conversations
// @desc    Get list of users the current user has chatted with
// @access  Private
router.get('/conversations', auth, async (req, res) => {
    try {
        const currentUserId = req.user.id;

        // Fetch all messages involving the current user, sorted by most recent
        const messages = await Message.find({
            $or: [{ sender: currentUserId }, { receiver: currentUserId }]
        }).sort({ timestamp: -1 });

        const conversationsMap = {};

        for (const msg of messages) {
            const otherUserId = msg.sender.toString() === currentUserId 
                ? msg.receiver.toString() 
                : msg.sender.toString();

            if (!conversationsMap[otherUserId]) {
                conversationsMap[otherUserId] = {
                    lastMessage: msg.content,
                    timestamp: msg.timestamp,
                    reportRef: msg.reportRef,
                    unreadCount: 0,
                    otherUserId: otherUserId
                };
            }

            // Count unread messages sent by the other user to the current user
            if (msg.sender.toString() === otherUserId && msg.receiver.toString() === currentUserId && !msg.isRead) {
                conversationsMap[otherUserId].unreadCount += 1;
            }
        }

        const otherUserIds = Object.keys(conversationsMap);
        if (otherUserIds.length === 0) {
            return res.json([]);
        }

        // Fetch user profiles of all those users
        const users = await User.find({ _id: { $in: otherUserIds } }).select('-password');

        const conversations = users.map(user => {
            const convDetails = conversationsMap[user._id.toString()];
            return {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    specialty: user.specialty,
                    bio: user.bio,
                    phone: user.phone,
                    isAvailable: user.isAvailable,
                    gender: user.gender,
                    avatar: user.avatar
                },
                lastMessage: convDetails.lastMessage,
                timestamp: convDetails.timestamp,
                reportRef: convDetails.reportRef,
                unreadCount: convDetails.unreadCount
            };
        });

        // Sort conversations by latest message timestamp
        conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(conversations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/messages/unread-count
// @desc    Get total unread messages count for current user
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await Message.countDocuments({ receiver: req.user.id, isRead: false });
        res.json({ count });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/messages/:userId
// @desc    Get message history between current user and another user
// @access  Private
router.get('/:userId', auth, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.userId;

        // Mark messages as read
        await Message.updateMany(
            { sender: otherUserId, receiver: currentUserId, isRead: false },
            { $set: { isRead: true } }
        );

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        })
        .populate('reportRef')
        .sort({ timestamp: 1 }); // Chronological order

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/messages
// @desc    Send a message (optionally with a report attached)
// @access  Private
router.post('/', auth, async (req, res) => {
    const { receiver, content, reportRef } = req.body;

    try {
        if (!receiver || (!content && !reportRef)) {
            return res.status(400).json({ msg: 'Please provide receiver and message content' });
        }

        // Check if reportRef is provided, and automatically share the report with the receiver
        if (reportRef) {
            const report = await Report.findById(reportRef);
            if (report) {
                // If receiver is not in sharedWith, add them
                if (!report.sharedWith.includes(receiver)) {
                    report.sharedWith.push(receiver);
                    await report.save();
                }
            }
        }

        const newMessage = new Message({
            sender: req.user.id,
            receiver,
            content,
            reportRef: reportRef || null
        });

        const message = await newMessage.save();
        
        // Populate the reportRef if sent
        if (reportRef) {
            await message.populate('reportRef');
        }

        res.json(message);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
