const mongoose = require('mongoose');

const DailyRewardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    required: true,
    enum: ['User', 'Gamer']
  },
  lastVisitDate: {
    type: Date,
    default: Date.now
  },
  currentStreak: {
    type: Number,
    default: 1
  },
  rewardsHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    tokens: {
      type: Number,
      required: true
    },
    streakDay: {
      type: Number,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate reward amount based on streak
DailyRewardSchema.methods.calculateRewardAmount = function() {
  const rewardAmounts = [100, 200, 300, 500, 600, 800, 1000];
  return rewardAmounts[Math.min(this.currentStreak - 1, 6)];
};

module.exports = mongoose.model('DailyReward', DailyRewardSchema); 