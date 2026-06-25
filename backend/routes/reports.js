const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const User = require('../models/User');
const { analyzeReport } = require('../utils/gemini');

// Setup local uploads directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage in memory so we can parse with Gemini and conditionally upload/save
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, or PDF files are allowed.'));
        }
    }
});

// Configure Cloudinary
const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name';

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('Cloudinary successfully configured.');
} else {
    console.log('Cloudinary not configured. Falling back to local file storage.');
}

// Upload file helper
const uploadFile = async (fileBuffer, originalName, mimeType, req) => {
    if (isCloudinaryConfigured) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'healthmate_reports',
                    public_id: path.parse(originalName).name + '_' + Date.now()
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url);
                }
            );
            uploadStream.end(fileBuffer);
        });
    } else {
        // Save locally
        const uniqueName = Date.now() + '_' + originalName.replace(/\s+/g, '_');
        const filePath = path.join(uploadDir, uniqueName);
        fs.writeFileSync(filePath, fileBuffer);
        // Return local server URL path
        const port = process.env.PORT || 5000;
        const protocol = req.protocol;
        const host = req.get('host');
        return `${protocol}://${host}/uploads/${uniqueName}`;
    }
};

// @route   POST api/reports/upload
// @desc    Upload report & get Gemini AI summary
// @access  Private
router.post('/upload', auth, upload.single('report'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'Please upload a file' });
    }

    try {
        console.log('Starting Gemini analysis...');
        // 1. Analyze with Gemini first
        const aiAnalysis = await analyzeReport(req.file.buffer, req.file.mimetype);

        console.log('Gemini analysis complete. Uploading file...');
        // 2. Upload to Cloudinary or save locally
        const fileUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, req);

        // Determine report type based on name or simple logic
        let reportType = 'Lab Report';
        const lowerName = req.file.originalname.toLowerCase();
        if (lowerName.includes('prescription') || lowerName.includes('nuskha') || lowerName.includes('parchi')) {
            reportType = 'Prescription';
        } else if (lowerName.includes('xray') || lowerName.includes('x-ray')) {
            reportType = 'X-Ray';
        } else if (lowerName.includes('ultrasound')) {
            reportType = 'Ultrasound';
        }

        // 3. Save to Database
        const newReport = new Report({
            userId: req.user.id,
            fileUrl,
            reportType,
            aiSummaryEnglish: aiAnalysis.aiSummaryEnglish,
            aiSummaryUrdu: aiAnalysis.aiSummaryUrdu,
            abnormalValues: aiAnalysis.abnormalValues,
            doctorQuestions: aiAnalysis.doctorQuestions,
            foodsToAvoid: aiAnalysis.foodsToAvoid || [],
            isPublic: req.body.isPublic !== undefined ? req.body.isPublic === 'true' || req.body.isPublic === true : true,
        });

        const report = await newReport.save();
        res.json(report);
    } catch (err) {
        console.error('Upload route error:', err);
        res.status(500).json({ msg: 'Server Error during report processing' });
    }
});

// @route   GET api/reports
// @desc    Get all reports for user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.user.id }).sort({ uploadDate: -1 });
        res.json(reports);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/reports/public/feed
// @desc    Get all public reports (Doctor only)
// @access  Private
router.get('/public/feed', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser || currentUser.role !== 'doctor') {
            return res.status(401).json({ msg: 'Only doctors can access the public reports feed' });
        }

        const reports = await Report.find({ isPublic: true })
            .populate('userId', 'name email')
            .sort({ uploadDate: -1 });

        res.json(reports);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/reports/shared
// @desc    Get all reports shared with the logged-in doctor
// @access  Private
router.get('/shared', auth, async (req, res) => {
    try {
        const reports = await Report.find({ sharedWith: req.user.id })
            .populate('userId', 'name email')
            .sort({ uploadDate: -1 });
        res.json(reports);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/reports/:id
// @desc    Get report by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ msg: 'Report not found' });
        }

        // Check ownership or doctor access permissions
        const currentUser = await User.findById(req.user.id);
        const isOwner = report.userId.toString() === req.user.id;
        const isSharedWithDoc = report.sharedWith && report.sharedWith.includes(req.user.id);
        const isPublicDocAccess = currentUser && currentUser.role === 'doctor' && report.isPublic;

        if (!isOwner && !isSharedWithDoc && !isPublicDocAccess) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        res.json(report);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Report not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/reports/:id
// @desc    Delete report
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ msg: 'Report not found' });
        }

        // Check user ownership
        if (report.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Optional: If stored locally, delete the file.
        if (!report.fileUrl.includes('res.cloudinary.com')) {
            try {
                const fileName = report.fileUrl.split('/uploads/')[1];
                if (fileName) {
                    const filePath = path.join(uploadDir, fileName);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            } catch (err) {
                console.error('Error deleting local file:', err);
            }
        }

        await report.deleteOne();
        res.json({ msg: 'Report removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Report not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
