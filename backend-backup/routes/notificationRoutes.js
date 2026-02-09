const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/notifications/subscribe', notificationController.subscribe);

module.exports = router;