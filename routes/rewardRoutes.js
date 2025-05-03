const express = require('express');
const {
    claimDailyReward,
    getDailyRewardStatus
} = require('../controllers/rewardController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// All reward routes require authentication
router.use(protect);

router.post('/daily-claim', claimDailyReward);
router.get('/daily-status', getDailyRewardStatus);

module.exports = router; 