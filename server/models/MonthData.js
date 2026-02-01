const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  // Map allows us to use day numbers as keys (e.g., "1": true)
  completedDays: { 
    type: Map, 
    of: Boolean, 
    default: {} 
  } 
});

const MonthDataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  year: { type: String, required: true },
  month: { type: String, required: true },
  habits: [HabitSchema]
}, { timestamps: true });

// Ensure a user can only have one unique document per month/year
MonthDataSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthData', MonthDataSchema);