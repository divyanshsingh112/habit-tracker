const express = require('express');
const router = express.Router();
const guildController = require('../controllers/guildController');

router.post('/guild/create', guildController.createGuild);
router.post('/guild/join', guildController.joinGuild);
router.get('/guild/:userId', guildController.getGuild);
router.post('/guild/message', guildController.postMessage);

module.exports = router;