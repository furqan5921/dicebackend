const User = require('../models/User');
const Gamer = require('../models/Gamer');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, phone, password, state, city, role } = req.body;

    // Create user
    const user = await User.create({
        name,
        email,
        phone,
        password,
        state,
        city,
        role: 'user'
    });

    sendTokenResponse(user, 201, res);
});

// @desc    Register gamer
// @route   POST /api/auth/register-gamer
// @access  Public
exports.registerGamer = asyncHandler(async (req, res, next) => {
    const { name, email, phone, password, state, city, group, termsAccepted, policyAccepted } = req.body;

    // Validate terms and policy acceptance
    if (!termsAccepted || !policyAccepted) {
        return next(new ErrorResponse('You must accept the terms and policy to register as a gamer', 400));
    }

    // Create gamer
    const gamer = await Gamer.create({
        name,
        email,
        phone,
        password,
        state,
        city,
        role: 'gamer',
        group,
        termsAccepted,
        policyAccepted,
        joiningFees: 1000 // Default joining fee
    });

    sendTokenResponse(gamer, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password, role } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    let user;

    // Check for user based on role
    if (role === 'gamer') {
        user = await Gamer.findOne({ email }).select('+password');

        // Validate gamer account is active
        if (user && !user.isActive) {
            return next(new ErrorResponse('Your gamer account has expired', 401));
        }
    } else {
        user = await User.findOne({ email }).select('+password');
    }

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    let user;

    if (req.user.role === 'gamer') {
        user = await Gamer.findById(req.user.id);
    } else {
        user = await User.findById(req.user.id);
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        data: {}
    });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
}; 