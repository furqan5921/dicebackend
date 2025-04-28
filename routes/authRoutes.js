const express = require('express');
const {
    registerUser,
    registerGamer,
    login,
    getMe,
    logout
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/register-gamer', registerGamer);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router; 