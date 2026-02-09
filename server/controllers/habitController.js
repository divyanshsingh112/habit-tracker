const Habit = require('../models/Habit'); // Ensure you have this model

// @desc    Get all habits
// @route   GET /api/habits
const getHabits = async (req, res) => {
  try {
    const { uid, year, month } = req.query;
    // Basic filter logic
    const query = { uid };
    if (year) query.year = year;
    if (month) query.month = month;
    
    const habits = await Habit.find(query);
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a habit
// @route   POST /api/habits
const createHabit = async (req, res) => {
  try {
    const { uid, year, month, name, attr } = req.body;
    const newHabit = await Habit.create({
      uid,
      year,
      month,
      name,
      attr,
      data: {} // Start empty
    });
    res.status(201).json(newHabit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle a day
// @route   POST /api/habits/:id/toggle
const toggleHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { day } = req.body;
    
    const habit = await Habit.findById(id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    // Toggle logic for Map/Object
    // Note: In MongoDB, "data" is likely a Map or Object. 
    // If it exists, delete it. If not, set it to true.
    const key = `data.${day}`;
    const isCompleted = habit.data && habit.data.get ? habit.data.get(day) : habit.data[day];

    if (isCompleted) {
        // If using Mongoose Map: habit.data.delete(day);
        // If using Mixed Object:
        const updatedData = { ...habit.data };
        delete updatedData[day];
        habit.data = updatedData;
    } else {
        if (!habit.data) habit.data = {};
        // Use Mongoose 'set' if Map, or direct assign if Object
        habit.data[day] = true; 
    }
    
    // Mark as modified if using Mixed type
    habit.markModified('data');
    await habit.save();

    res.status(200).json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    await Habit.findByIdAndDelete(id);
    res.status(200).json({ message: 'Habit deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔴 CRITICAL FIX: Make sure this exports an object with ALL functions
module.exports = {
  getHabits,
  createHabit,
  toggleHabit,
  deleteHabit
};