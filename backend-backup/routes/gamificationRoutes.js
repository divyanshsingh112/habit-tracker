const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');

// ✅ FIXED: Routes now match the controller names exactly
router.get('/stats/:userId', gamificationController.getStats);
router.post('/stats/:userId', gamificationController.updateStats);

router.post('/shop/buy/:userId', gamificationController.buyItem);
router.post('/shop/equip/:userId', gamificationController.equipItem);

router.get('/streak/:userId', gamificationController.getStreak);
router.get('/leaderboard', gamificationController.getLeaderboard);

module.exports = router;