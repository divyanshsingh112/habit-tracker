const User = require('../models/User');

// Helper to calculate level
const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

exports.getUserStats = async (req, res) => {
  try {
    let user = await User.findOne({ userId: req.params.userId });
    if (!user) {
      user = await User.create({ userId: req.params.userId });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateXp = async (req, res) => {
  try {
    const { userId, xpChange } = req.body;
    let user = await User.findOne({ userId });
    
    if (!user) user = new User({ userId });

    user.xp = Math.max(0, user.xp + xpChange);
    user.level = calculateLevel(user.xp);
    
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ FIXED: Missing Streak Function
exports.getStreak = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    // Return 0 if user not found, otherwise return their streak
    res.json({ streak: user ? user.streak || 0 : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ADDED: Missing Leaderboard Function
exports.getLeaderboard = async (req, res) => {
  try {
    // Get top 10 users sorted by XP (descending)
    const leaders = await User.find({})
      .sort({ xp: -1 })
      .limit(10)
      .select('userId displayName level xp streak'); // Only send necessary fields
    
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