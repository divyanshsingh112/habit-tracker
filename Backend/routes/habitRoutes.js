const express = require('express');
const router = express.Router();
const { 
  getHabits, 
  createHabit, 
  toggleHabit, 
  deleteHabit 
} = require('../controllers/habitController');

router.get('/', getHabits);
router.post('/', createHabit);
router.post('/:id/toggle', toggleHabit);
router.delete('/:id', deleteHabit);

module.exports = router;