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
  
  // 🔥 IMPORTANT: This must be 'itemsOwned' and it must be an Array of Objects
  itemsOwned: [{ 
    itemId: String, 
    type: String, 
    name: String,
    price: Number
  }],
  
  activeTheme: { type: String, default: 'light' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);