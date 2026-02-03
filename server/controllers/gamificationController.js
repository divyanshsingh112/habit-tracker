const UserStats = require('../models/UserStats');

exports.getStats = async (req, res) => {
  try {
    let stats = await UserStats.findOne({ userId: req.params.userId });
    if (!stats) stats = await UserStats.create({ userId: req.params.userId });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStats = async (req, res) => {
  try {
    const { xpEarned, attribute, displayName } = req.body; // <-- GET NAME
    let stats = await UserStats.findOne({ userId: req.params.userId });
    if (!stats) stats = await UserStats.create({ userId: req.params.userId });

    // Sync Name if provided
    if (displayName) stats.displayName = displayName;

    // Update XP & Coins
    stats.xp += xpEarned || 0;
    const coinChange = (xpEarned / 2); 
    stats.coins = Math.max(0, (stats.coins || 0) + coinChange);

    if (xpEarned !== 0 && attribute) {
       if (!stats.stats) stats.stats = { str: 0, int: 0, wis: 0, cha: 0 };
       const attrKey = attribute.toLowerCase();
       if (stats.stats[attrKey] !== undefined) {
          stats.stats[attrKey] = Math.max(0, stats.stats[attrKey] + (xpEarned / 10)); 
       }
    }

    // Level Logic
    while (stats.xp >= stats.level * 100) {
      stats.xp -= stats.level * 100;
      stats.level += 1;
    }
    while (stats.xp < 0) {
      if (stats.level > 1) {
        stats.level -= 1;
        stats.xp += stats.level * 100; 
      } else {
        stats.xp = 0;
        break;
      }
    }

    await stats.save();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const topPlayers = await UserStats.find()
      .sort({ level: -1, xp: -1 })
      .limit(10)
      .select('displayName level xp userId');
    res.json(topPlayers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.buyItem = async (req, res) => {
  try {
    const { itemId, price, type } = req.body;
    const stats = await UserStats.findOne({ userId: req.params.userId });

    if (!stats.inventory) stats.inventory = { themes: ['light'], streakFreezes: 0, activeTheme: 'light' };
    if (stats.coins < price) return res.status(400).json({ error: "Not enough coins" });

    stats.coins -= price;
    if (type === 'theme') {
      if (!stats.inventory.themes.includes(itemId)) stats.inventory.themes.push(itemId);
    } else if (type === 'consumable') {
      stats.inventory.streakFreezes += 1;
    }

    await stats.save();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.equipItem = async (req, res) => {
  try {
    const { itemId, type } = req.body;
    const stats = await UserStats.findOne({ userId: req.params.userId });
    if (!stats.inventory) stats.inventory = { themes: ['light'], streakFreezes: 0, activeTheme: 'light' };

    if (type === 'theme') {
      if (stats.inventory.themes.includes(itemId)) stats.inventory.activeTheme = itemId;
    }

    await stats.save();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};