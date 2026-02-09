const Habit = require('../models/Habit');

// @desc    Get Habits for a specific user/year/month
// @route   GET /api/habits
const getHabits = async (req, res) => {
  try {
    const { uid, year, month } = req.query;
    if (!uid) return res.status(400).json({ message: 'Missing UID' });

    const habits = await Habit.find({ uid, year, month });
    
    // Transform _id to id to match frontend expectation
    const formattedHabits = habits.map(h => ({
      id: h._id,
      name: h.name,
      attr: h.attr,
      data: h.data || {}
    }));

    res.status(200).json(formattedHabits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new Quest
// @route   POST /api/habits
const createHabit = async (req, res) => {
  try {
    const { uid, year, month, name, attr } = req.body;
    
    const habit = await Habit.create({
      uid,
      year,
      month,
      name,
      attr,
      data: {}
    });

    res.status(201).json({
      id: habit._id,
      name: habit.name,
      attr: habit.attr,
      data: habit.data
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle a Day (Check/Uncheck)
// @route   POST /api/habits/:id/toggle
const toggleHabit = async (req, res) => {
  try {
    const { day, completed } = req.body;
    const habit = await Habit.findById(req.params.id);

    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    // Update the specific day in the data object
    const updatedData = { ...habit.data };
    
    if (completed) {
      updatedData[day] = true;
    } else {
      delete updatedData[day];
    }

    habit.data = updatedData;
    habit.markModified('data'); // Tell Mongoose the Object changed
    await habit.save();

    res.status(200).json({ success: true, data: habit.data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a Quest
// @route   DELETE /api/habits/:id
const deleteHabit = async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Quest abandoned' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EXPORT ALL FUNCTIONS AS AN OBJECT
module.exports = {
  getHabits,
  createHabit,
  toggleHabit,
  deleteHabit
};