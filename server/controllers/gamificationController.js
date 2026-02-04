const User = require('../models/User');

// Helper to calculate level
const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

exports.getStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    let user = await User.findOne({ userId });
    
    if (!user) {
      user = await User.create({ userId });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.body.userId;
    const { xpChange } = req.body;

    if (!userId) return res.status(400).json({ error: "User ID is required" });

    let user = await User.findOne({ userId });
    if (!user) user = new User({ userId });

    if (xpChange) {
        user.xp = Math.max(0, user.xp + xpChange);
        user.level = calculateLevel(user.xp);
    }
    
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStreak = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    res.json({ streak: user ? user.streak || 0 : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaders = await User.find({})
      .sort({ xp: -1 })
      .limit(10)
      .select('userId displayName level xp streak');
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ FIXED: Robustly handles wrapped or unwrapped item data
exports.buyItem = async (req, res) => {
  try {
    const userId = req.params.userId || req.body.userId;
    
    // TRICK: If req.body.item exists, use it. Otherwise, assume req.body IS the item.
    // This solves the "undefined" error if data is sent directly.
    const item = req.body.item || req.body;

    if (!userId) return res.status(400).json({ error: "User ID missing" });
    
    // Double Check: Ensure 'item' has a price property before proceeding
    if (!item || typeof item.price === 'undefined') {
       // Log the body so you can debug what was actually sent
       console.error("Invalid Item Data Received:", req.body);
       return res.status(400).json({ error: "Invalid item data: Price is missing" });
    }

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Check balance
    if ((user.coins || 0) < item.price) {
        return res.status(400).json({ error: "Not enough coins" });
    }
    
    user.coins -= item.price;
    user.inventory.push(item);
    await user.save();
    res.json(user);
  } catch (err) {
    console.error("Buy Item Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ FIXED: Robustly handles wrapped or unwrapped item data
exports.equipItem = async (req, res) => {
  try {
    const userId = req.params.userId || req.body.userId;
    const item = req.body.item || req.body;
    
    if (!userId) return res.status(400).json({ error: "User ID missing" });

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (item.type === 'theme') {
       user.activeTheme = item.id; 
    }
    
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};