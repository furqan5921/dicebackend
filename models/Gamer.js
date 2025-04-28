const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const GamerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    state: {
        type: String,
        required: [true, 'Please provide a state']
    },
    city: {
        type: String,
        required: [true, 'Please provide a city']
    },
    role: {
        type: String,
        enum: ['user', 'gamer', 'admin'],
        default: 'gamer'
    },
    group: {
        type: String,
        enum: ['groupA', 'groupB'],
        required: [true, 'Please select a group']
    },
    termsAccepted: {
        type: Boolean,
        default: false
    },
    policyAccepted: {
        type: Boolean,
        default: false
    },
    joiningFees: {
        type: Number,
        default: 0
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        default: function () {
            const date = new Date();
            date.setFullYear(date.getFullYear() + 1);
            return date;
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Encrypt password using bcrypt
GamerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
GamerSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match gamer entered password to hashed password in database
GamerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Gamer', GamerSchema); 