const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  displayName: String,
  email: String,
  
  // STATS
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  
  // ✅ FIX: Define inventory as a list of Objects, NOT strings
  inventory: [{ 
    id: String, 
    type: String, 
    name: String,
    price: Number, // Added price just in case
    desc: String   // Added desc just in case
  }],
  
  activeTheme: { type: String, default: 'light' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);