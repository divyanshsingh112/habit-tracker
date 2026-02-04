const User = require('../models/User');

// Helper to calculate level
const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

// ✅ FIXED: Renamed to match routes (was getUserStats)
exports.getStats = async (req, res) => {
  try {
    // Get ID from URL
    const userId = req.params.userId;
    
    let user = await User.findOne({ userId });
    
    // If user doesn't exist, create them immediately to prevent null errors
    if (!user) {
      user = await User.create({ userId });
    }
    res.json(user);
  } catch (err) {
    console.error("Get Stats Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ FIXED: Renamed to match routes (was updateXp) and reads ID from URL
exports.updateStats = async (req, res) => {
  try {
    // Check both URL and Body for the ID
    const userId = req.params.userId || req.body.userId;
    const { xpChange } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    let user = await User.findOne({ userId });
    
    // Auto-create if missing
    if (!user) user = new User({ userId });

    // Update XP if provided
    if (xpChange) {
        user.xp = Math.max(0, user.xp + xpChange);
        user.level = calculateLevel(user.xp);
    }
    
    await user.save();
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

exports.buyItem = async (req, res) => {
  try {
    const { userId, item } = req.body;
    const user = await User.findOne({ userId });
    
    if (user.coins < item.price) return res.status(400).json({ error: "Not enough coins" });
    
    user.coins -= item.price;
    user.inventory.push(item);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.equipItem = async (req, res) => {
  try {
    const { userId, item } = req.body;
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