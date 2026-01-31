const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  id: Number,
  name: String,
  category: String,
  completedDays: { type: Map, of: Boolean } 
});

const MonthDataSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // NEW: Stores who owns this data
  year: { type: String, required: true },
  month: { type: String, required: true },
  habits: [HabitSchema]
});

// Ensure a user can only have one document for "2026 January"
MonthDataSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthData', MonthDataSchema);