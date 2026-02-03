const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');

router.get('/all-data/:userId', habitController.getAllData);
router.post('/habits/:userId/:year/:month', habitController.updateMonth);
router.delete('/years/:userId/:year', habitController.deleteYear);

module.exports = router;