const User = require('../models/User');

// Helper
const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

exports.getStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.body.userId;
    const { xpChange, coinsChange } = req.body;

    if (!userId) return res.status(400).json({ error: "User ID required" });

    let user = await User.findOne({ userId });
    if (!user) user = new User({ userId });

    // Update XP
    if (xpChange) {
        user.xp = Math.max(0, (user.xp || 0) + Number(xpChange));
        user.level = calculateLevel(user.xp);
    }

    // Update Coins
    if (coinsChange !== undefined) {
        user.coins = Math.max(0, (user.coins || 0) + Number(coinsChange));
    }
    
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.buyItem = async (req, res) => {
  try {
    const userId = req.params.userId || req.body.userId;
    // Allow frontend to send "item" wrapped or unwrapped
    const itemData = req.body.item || req.body;

    if (!userId) return res.status(400).json({ error: "User ID missing" });
    if (!itemData || !itemData.price) return res.status(400).json({ error: "Invalid item data" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // 1. Check Balance
    if ((user.coins || 0) < itemData.price) {
        return res.status(400).json({ error: "Not enough coins" });
    }
    
    // 2. Deduct Coins
    user.coins -= itemData.price;
    
    // 3. Add to NEW list "itemsOwned"
    // We store a clean object to avoid strict mode errors
    user.itemsOwned.push({
        itemId: itemData.id,
        name: itemData.name,
        type: itemData.type,
        price: itemData.price
    });
    
    await user.save();
    res.json(user);
  } catch (err) {
    console.error("Buy Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.equipItem = async (req, res) => {
  try {
    const userId = req.params.userId || req.body.userId;
    const item = req.body.item || req.body;
    
    const user = await User.findOne({ userId });
    
    if (item.type === 'theme') {
       user.activeTheme = item.id; 
    }
    
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Keep existing helpers to prevent crashes
exports.getStreak = async (req, res) => res.json({ streak: 0 });
exports.getLeaderboard = async (req, res) => res.json([]);