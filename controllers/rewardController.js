const User = require('../models/User');
const Gamer = require('../models/Gamer');
const DailyReward = require('../models/DailyReward');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Check and claim daily reward
// @route   POST /api/rewards/daily-claim
// @access  Private
exports.claimDailyReward = asyncHandler(async (req, res, next) => {
    // Get user from request
    const userId = req.user.id;
    const userModel = req.user.role === 'gamer' ? 'Gamer' : 'User';

    // Get current date with time set to midnight (for date comparison)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find or create daily reward record
    let dailyReward = await DailyReward.findOne({
        userId,
        userModel
    });

    // If no reward record exists, create first visit record
    if (!dailyReward) {
        dailyReward = new DailyReward({
            userId,
            userModel,
            lastVisitDate: today,
            currentStreak: 1
        });

        // Calculate reward for first visit
        const rewardAmount = dailyReward.calculateRewardAmount();

        // Add reward to history
        dailyReward.rewardsHistory.push({
            date: today,
            tokens: rewardAmount,
            streakDay: 1
        });

        // Update user's token balance
        if (userModel === 'Gamer') {
            await Gamer.findByIdAndUpdate(userId, {
                $inc: { tokens: rewardAmount }
            });
        } else {
            await User.findByIdAndUpdate(userId, {
                $inc: { tokens: rewardAmount }
            });
        }

        await dailyReward.save();

        return res.status(200).json({
            success: true,
            data: {
                reward: rewardAmount,
                streak: 1,
                message: "First day reward claimed!"
            }
        });
    }

    // Get last visit date with time set to midnight
    const lastVisit = new Date(dailyReward.lastVisitDate);
    const lastVisitDate = new Date(
        lastVisit.getFullYear(),
        lastVisit.getMonth(),
        lastVisit.getDate()
    );

    // Calculate days since last visit
    const diffTime = today.getTime() - lastVisitDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Check if user already claimed reward today
    if (diffDays === 0) {
        return res.status(400).json({
            success: false,
            error: "You've already claimed your daily reward today"
        });
    }

    // Update streak based on visit pattern
    if (diffDays === 1) {
        // Consecutive day visit - increment streak (max 7)
        dailyReward.currentStreak = Math.min(dailyReward.currentStreak + 1, 7);
    } else {
        // Missed a day or more - reset streak to 1
        dailyReward.currentStreak = 1;
    }

    // Update last visit date
    dailyReward.lastVisitDate = today;

    // Calculate reward amount
    const rewardAmount = dailyReward.calculateRewardAmount();

    // Add to rewards history
    dailyReward.rewardsHistory.push({
        date: today,
        tokens: rewardAmount,
        streakDay: dailyReward.currentStreak
    });

    // Update user token balance
    if (userModel === 'Gamer') {
        await Gamer.findByIdAndUpdate(userId, {
            $inc: { tokens: rewardAmount }
        });
    } else {
        await User.findByIdAndUpdate(userId, {
            $inc: { tokens: rewardAmount }
        });
    }

    await dailyReward.save();

    // Return reward data
    res.status(200).json({
        success: true,
        data: {
            reward: rewardAmount,
            streak: dailyReward.currentStreak,
            message: `Day ${dailyReward.currentStreak} reward claimed!`
        }
    });
});

// @desc    Get daily reward status
// @route   GET /api/rewards/daily-status
// @access  Private
exports.getDailyRewardStatus = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const userModel = req.user.role === 'gamer' ? 'Gamer' : 'User';

    // Get user's current token balance
    let userTokens = 0;
    if (userModel === 'Gamer') {
        const gamer = await Gamer.findById(userId);
        userTokens = gamer.tokens;
    } else {
        const user = await User.findById(userId);
        userTokens = user.tokens;
    }

    // Find daily reward record
    const dailyReward = await DailyReward.findOne({ userId, userModel });

    if (!dailyReward) {
        return res.status(200).json({
            success: true,
            data: {
                canClaim: true,
                nextReward: 100,
                streak: 0,
                lastClaim: null,
                tokens: userTokens,
                isFirstClaim: true
            }
        });
    }

    // Get current date with time set to midnight
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get last visit date with time set to midnight
    const lastVisit = new Date(dailyReward.lastVisitDate);
    const lastVisitDate = new Date(
        lastVisit.getFullYear(),
        lastVisit.getMonth(),
        lastVisit.getDate()
    );

    // Calculate days since last visit
    const diffTime = today.getTime() - lastVisitDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Determine next streak value
    let nextStreak = diffDays === 1
        ? Math.min(dailyReward.currentStreak + 1, 7)
        : (diffDays > 1 ? 1 : dailyReward.currentStreak);

    // Calculate next reward
    const rewardAmounts = [100, 200, 300, 500, 600, 800, 1000];
    const nextReward = rewardAmounts[Math.min(nextStreak - 1, 6)];

    // Return status
    res.status(200).json({
        success: true,
        data: {
            canClaim: diffDays > 0, // Can claim if it's a new day
            nextReward: nextReward,
            streak: dailyReward.currentStreak,
            lastClaim: dailyReward.lastVisitDate,
            tokens: userTokens,
            isFirstClaim: false,
            history: dailyReward.rewardsHistory.slice(-7) // Last 7 rewards
        }
    });
}); 