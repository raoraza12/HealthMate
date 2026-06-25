const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role, specialty, bio, phone, gender } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            role: role || 'patient',
            specialty: specialty || '',
            bio: bio || '',
            phone: phone || '',
            gender: gender || 'male',
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, gender: user.gender, avatar: user.avatar } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Verify selected role matches database role
        if (role && user.role !== role) {
            return res.status(400).json({ msg: `Incorrect role selected. This account is registered as a ${user.role}.` });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, gender: user.gender, avatar: user.avatar } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/me
// @desc    Get user data
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/auth/profile
// @desc    Update user profile details
// @access  Private
router.put('/profile', auth, async (req, res) => {
    const { specialty, bio, phone, isAvailable, name, gender, avatar } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (specialty !== undefined) user.specialty = specialty;
        if (bio !== undefined) user.bio = bio;
        if (phone !== undefined) user.phone = phone;
        if (isAvailable !== undefined) user.isAvailable = isAvailable;
        if (name !== undefined) user.name = name;
        if (gender !== undefined) user.gender = gender;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only JPEG, JPG, or PNG files are allowed.'));
        }
    }
});

const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name';

const uploadFile = async (fileBuffer, originalName, req) => {
    if (isCloudinaryConfigured) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: 'healthmate_avatars',
                    public_id: 'avatar_' + req.user.id + '_' + Date.now()
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url);
                }
            );
            uploadStream.end(fileBuffer);
        });
    } else {
        const uniqueName = 'avatar_' + req.user.id + '_' + Date.now() + path.extname(originalName);
        const filePath = path.join(uploadDir, uniqueName);
        fs.writeFileSync(filePath, fileBuffer);
        const protocol = req.protocol;
        const host = req.get('host');
        return `${protocol}://${host}/uploads/${uniqueName}`;
    }
};

// @route   POST api/auth/avatar
// @desc    Upload user profile photo (avatar)
// @access  Private
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'Please upload an image file' });
    }
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const fileUrl = await uploadFile(req.file.buffer, req.file.originalname, req);
        user.avatar = fileUrl;
        await user.save();
        res.json({ avatar: user.avatar });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
