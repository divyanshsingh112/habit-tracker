const User = require('../models/User');

// Helper to calculate level
const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

exports.getStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    let user = await User.findOne({ userId });
    
    // Auto-create user if they don't exist
    if (!user) {
      user = await User.create({ userId });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ THE CRITICAL FIX: Handles XP *AND* Coins
exports.updateStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.body.userId;
    // Look for both xpChange AND coinsChange
    const { xpChange, coinsChange } = req.body;

    if (!userId) return res.status(400).json({ error: "User ID is required" });

    let user = await User.findOne({ userId });
    if (!user) user = new User({ userId });

    // 1. Update XP
    if (xpChange) {
        user.xp = Math.max(0, (user.xp || 0) + Number(xpChange));
        user.level = calculateLevel(user.xp);
    }

    // 2. Update Coins (This was likely missing or broken)
    if (coinsChange !== undefined) {
        user.coins = Math.max(0, (user.coins || 0) + Number(coinsChange));
    }
    
    await user.save();
    console.log(`[Stats] Updated User ${userId}: Level ${user.level}, Coins ${user.coins}`);
    res.json(user);
  } catch (err) {
    console.error("Update Stats Error:", err);
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

// ✅ SHOP FIX: Handles "unwrapped" items and checks balance properly
exports.buyItem = async (req, res) => {
  try {
    const userId = req.params.userId || req.body.userId;
    
    // Handle both { item: {...} } and { ... } formats
    const item = req.body.item || req.body;

    if (!userId) return res.status(400).json({ error: "User ID missing" });
    
    // Safety check for price
    if (!item || typeof item.price === 'undefined') {
       return res.status(400).json({ error: "Invalid item data: Price is missing" });
    }

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Check if user is rich enough
    if ((user.coins || 0) < item.price) {
        console.log(`[Shop] Failed: User has ${user.coins}, needs ${item.price}`);
        return res.status(400).json({ error: "Not enough coins" });
    }
    
    // Deduct coins & Add item
    user.coins -= item.price;
    
    // Ensure inventory exists
    if (!user.inventory) user.inventory = [];
    user.inventory.push(item);
    
    await user.save();
    res.json(user);
  } catch (err) {
    console.error("Buy Item Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.equipItem = async (req, res) => {
  try {
    const userId = req.params.userId || req.body.userId;
    const item = req.body.item || req.body;
    
    if (!userId) return res.status(400).json({ error: "User ID missing" });

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