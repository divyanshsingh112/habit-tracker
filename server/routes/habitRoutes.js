// server/routes/habitRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getHabits, 
  createHabit, 
  toggleHabit, 
  deleteHabit 
} = require('../controllers/habitController');

// 🔴 CRITICAL FIX: These should be just '/' because '/api/habits' is already defined in server.js
router.get('/', getHabits);       // Matches GET /api/habits
router.post('/', createHabit);    // Matches POST /api/habits
router.post('/:id/toggle', toggleHabit); // Matches POST /api/habits/:id/toggle
router.delete('/:id', deleteHabit);      // Matches DELETE /api/habits/:id

module.exports = router;