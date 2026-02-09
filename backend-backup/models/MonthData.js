const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  
  // ADDED: The RPG Attribute (Strength, Intellect, etc.)
  attribute: { type: String, required: true }, 

  // CHANGED: Category is optional (since we rely on attribute)
  category: { type: String, default: 'General' },

  // CHANGED: Must be String to store Timestamps (for Streak Logic), not Boolean
  completedDays: { 
    type: Map, 
    of: String, 
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