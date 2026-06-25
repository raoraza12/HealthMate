const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Report = require('../models/Report');
const Message = require('../models/Message');

// Try to import Vital model if it exists
let Vital;
try {
    Vital = require('../models/Vital');
} catch (e) {
    Vital = null;
}

// @route   GET api/dashboard-stats
// @desc    Get aggregated user dashboard statistics
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password').populate('friends', 'name email role specialty avatar');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Get report count and abnormal flags
        const reports = await Report.find({ userId }).sort({ uploadDate: -1 });
        const totalReports = reports.length;
        const totalAbnormal = reports.reduce((sum, r) => sum + (r.abnormalValues?.length || 0), 0);
        const recentReports = reports.slice(0, 5);

        // Get vitals count
        let totalVitals = 0;
        let latestVital = null;
        if (Vital) {
            const vitals = await Vital.find({ userId }).sort({ date: -1 });
            totalVitals = vitals.length;
            latestVital = vitals[0] || null;
        }

        // Get friends/connections count
        const totalFriends = user.friends?.length || 0;

        // Get messages count
        const totalMessagesSent = await Message.countDocuments({ sender: userId });
        const totalMessagesReceived = await Message.countDocuments({ receiver: userId });
        const unreadMessages = await Message.countDocuments({ receiver: userId, isRead: false });

        // Get shared reports (reports shared with this user or by this user)
        let sharedWithMe = 0;
        if (user.role === 'doctor') {
            sharedWithMe = await Report.countDocuments({ sharedWith: userId });
        }
        const publicReports = await Report.countDocuments({ userId, isPublic: true });

        // Build recent activity timeline
        const activities = [];

        // Recent reports as activity
        for (const r of recentReports.slice(0, 3)) {
            activities.push({
                type: 'report',
                title: `Uploaded ${r.reportType}`,
                subtitle: r.abnormalValues?.length > 0 ? `${r.abnormalValues.length} abnormal values detected` : 'All values normal',
                date: r.uploadDate,
                icon: 'FileText',
                accent: '#7c3aed',
            });
        }

        // Recent messages as activity
        const recentMessages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ timestamp: -1 }).limit(3).populate('sender receiver', 'name');

        for (const m of recentMessages) {
            const isSender = m.sender._id.toString() === userId;
            activities.push({
                type: 'message',
                title: isSender ? `Sent message to ${m.receiver.name}` : `Received message from ${m.sender.name}`,
                subtitle: m.content.substring(0, 60) + (m.content.length > 60 ? '...' : ''),
                date: m.timestamp,
                icon: 'MessageSquare',
                accent: '#2563eb',
            });
        }

        // Sort activities by date
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Account age
        const accountCreated = user.createdAt;
        const daysSinceJoined = Math.floor((Date.now() - new Date(accountCreated)) / (1000 * 60 * 60 * 24));

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialty: user.specialty,
                bio: user.bio,
                phone: user.phone,
                isAvailable: user.isAvailable,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
            stats: {
                totalReports,
                totalAbnormal,
                totalVitals,
                totalFriends,
                totalMessagesSent,
                totalMessagesReceived,
                unreadMessages,
                sharedWithMe,
                publicReports,
                daysSinceJoined,
            },
            friends: user.friends || [],
            recentReports,
            latestVital,
            activities: activities.slice(0, 8),
        });
    } catch (err) {
        console.error('Dashboard stats error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
