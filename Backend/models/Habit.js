const mongoose = require('mongoose');

const habitSchema = mongoose.Schema({
  uid: { type: String, required: true },     // Firebase User ID
  year: { type: Number, required: true },    // 2026
  month: { type: String, required: true },   // 'February'
  name: { type: String, required: true },    // 'Morning Run'
  attr: { type: String, default: 'warrior' }, // 'warrior', 'mage', etc.
  data: { type: Object, default: {} }        // { "1": true, "15": true }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Habit', habitSchema);