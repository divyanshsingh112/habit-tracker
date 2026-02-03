const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');

router.get('/stats/:userId', gamificationController.getStats);
router.post('/stats/:userId', gamificationController.updateStats);
router.post('/shop/buy/:userId', gamificationController.buyItem);
router.post('/shop/equip/:userId', gamificationController.equipItem);

// NEW ENDPOINT
router.get('/leaderboard', gamificationController.getLeaderboard);

module.exports = router;