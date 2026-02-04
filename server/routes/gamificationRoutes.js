const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');

// Stats & XP
// Note: Changed 'getStats' to 'getUserStats' to match the controller
router.get('/stats/:userId', gamificationController.getUserStats);
router.post('/stats/:userId', gamificationController.updateXp);

// Shop
router.post('/shop/buy/:userId', gamificationController.buyItem);
router.post('/shop/equip/:userId', gamificationController.equipItem);

// ✅ NEW: Missing Route for Streak (Fixes your 404 error)
router.get('/streak/:userId', gamificationController.getStreak);

// Leaderboard
router.get('/leaderboard', gamificationController.getLeaderboard);

module.exports = router;