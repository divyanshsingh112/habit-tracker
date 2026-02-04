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
  
  // 🔥 NEW FIELD NAME: "itemsOwned"
  // This bypasses the old "inventory" crash completely.
  itemsOwned: [{ 
    itemId: String, 
    type: String, 
    name: String,
    price: Number
  }],
  
  activeTheme: { type: String, default: 'light' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);