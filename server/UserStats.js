// UserStats.js
const mongoose = require('mongoose');

const UserStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 0 },
  items: {
    streakFreezes: { type: Number, default: 0 },
    themeColor: { type: String, default: 'default' }
  }
});

module.exports = mongoose.model('UserStats', UserStatsSchema);