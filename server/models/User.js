const mongoose = require('mongoose');

// 1. Define Item Schema explicitly to prevent structure errors
const ItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  name: String,
  type: String,
  price: Number
}, { _id: false }); // Prevents Mongoose from creating extra IDs

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  displayName: String,
  email: String,
  
  // STATS
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  
  // 🔥 NEW FIELD: "heroInventory"
  // This new name guarantees a fresh start without crashes
  heroInventory: { 
    type: [ItemSchema], 
    default: [] 
  },
  
  activeTheme: { type: String, default: 'light' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);