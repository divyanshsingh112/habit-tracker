const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  displayName: { type: String, default: 'Anonymous Hero' }, // <-- NEW FIELD
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 0 },
  stats: {
    str: { type: Number, default: 0 },
    int: { type: Number, default: 0 },
    wis: { type: Number, default: 0 },
    cha: { type: Number, default: 0 }
  },
  inventory: {
    themes: { type: [String], default: ['light'] },     
    activeTheme: { type: String, default: 'light' },    
    streakFreezes: { type: Number, default: 0 }         
  }
});

module.exports = mongoose.model('UserStats', userStatsSchema);