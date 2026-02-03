const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "A band of heroes." },
  // A short code to share with friends (e.g., "GYM-BROS-22")
  inviteCode: { type: String, required: true, unique: true },
  
  // Who is in the guild?
  members: [{
    userId: String,
    displayName: String,
    joinedAt: { type: Date, default: Date.now }
  }],

  // Total XP earned by all members combined
  totalXp: { type: Number, default: 0 },

  // Simple Chat History (Last 50 messages)
  chat: [{
    userId: String,
    displayName: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Guild', guildSchema);