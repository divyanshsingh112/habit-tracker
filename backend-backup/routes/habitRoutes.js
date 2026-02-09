const express = require('express');
const router = express.Router();

// 🔴 CRITICAL FIX: Destructure matches the exports above
const { 
  getHabits, 
  createHabit, 
  toggleHabit, 
  deleteHabit 
} = require('../controllers/habitController');

// Debugging check (will print to Render logs if undefined)
if (!getHabits) {
    console.error("❌ ERROR: getHabits is undefined. Check habitController.js exports.");
}

// Routes
router.get('/', getHabits);       // GET /api/habits
router.post('/', createHabit);    // POST /api/habits
router.post('/:id/toggle', toggleHabit); // POST /api/habits/:id/toggle
router.delete('/:id', deleteHabit);      // DELETE /api/habits/:id

module.exports = router;