const User = require('../models/User');

const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

exports.getStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId, heroInventory: [] });
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
    if (!user) user = new User({ userId, heroInventory: [] });

    if (xpChange) {
        user.xp = Math.max(0, (user.xp || 0) + Number(xpChange));
        user.level = calculateLevel(user.xp);
    }

    if (coinsChange !== undefined) {
        // ✅ FIX: Use Math.max(0) to prevent negative balance
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
    const itemData = req.body.item || req.body;

    if (!userId) return res.status(400).json({ error: "User ID missing" });
    if (!itemData || typeof itemData.price === 'undefined') {
       return res.status(400).json({ error: "Invalid item data" });
    }

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Safety check
    if (!user.heroInventory) user.heroInventory = [];

    const alreadyOwns = user.heroInventory.some(i => i.itemId === itemData.id);
    if (alreadyOwns && itemData.type !== 'consumable') {
        return res.status(400).json({ error: "Item already owned" });
    }

    // ✅ FIX: Strict Server-Side Balance Check
    if ((user.coins || 0) < itemData.price) {
        return res.status(400).json({ error: "Not enough coins" });
    }
    
    // Deduct
    user.coins -= itemData.price;
    
    // Add Item
    user.heroInventory.push({
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
    
    // If it's a theme, update activeTheme
    if (item.type === 'theme') {
        user.activeTheme = item.id; 
    }
    
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStreak = async (req, res) => res.json({ streak: 0 });
exports.getLeaderboard = async (req, res) => res.json([]);