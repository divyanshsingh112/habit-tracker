const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "A band of heroes." },
  inviteCode: { type: String, required: true, unique: true },
  adminId: { type: String, required: true }, // <--- NEW FIELD: The Owner
  
  members: [{
    userId: String,
    displayName: String,
    joinedAt: { type: Date, default: Date.now }
  }],

  totalXp: { type: Number, default: 0 },

  chat: [{
    userId: String,
    displayName: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Guild', guildSchema);