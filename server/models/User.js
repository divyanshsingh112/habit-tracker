const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  displayName: String,
  email: String,
  
  // STATS
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 0 }, // <--- THIS MUST BE HERE
  streak: { type: Number, default: 0 },
  
  // INVENTORY
  inventory: [{ 
    id: String, 
    type: String, 
    name: String 
  }],
  activeTheme: { type: String, default: 'light' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);