const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  year: { type: Number, required: true },
  month: { type: String, required: true },
  name: { type: String, required: true },
  attr: { type: String, default: 'warrior' }, // warrior, mage, etc.
  data: { type: Object, default: {} } // Stores { "1": true, "2": true }
}, { timestamps: true });

module.exports = mongoose.model('Habit', HabitSchema);