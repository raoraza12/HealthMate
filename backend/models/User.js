const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['patient', 'doctor'],
        default: 'patient',
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
    }],
    specialty: {
        type: String,
        default: '',
    },
    bio: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'male',
    },
    avatar: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
