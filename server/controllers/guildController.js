const Guild = require('../models/Guild');
const UserStats = require('../models/UserStats');

// Helper to generate a random 6-char code
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

exports.createGuild = async (req, res) => {
  try {
    const { name, description, userId, displayName } = req.body;
    
    // Check if user is already in a guild (Optional rule: 1 guild per user?)
    // For now, let's assume they can only create one if they aren't in one.
    
    const newGuild = await Guild.create({
      name,
      description,
      inviteCode: generateCode(),
      members: [{ userId, displayName }]
    });

    res.json(newGuild);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.joinGuild = async (req, res) => {
  try {
    const { inviteCode, userId, displayName } = req.body;
    
    const guild = await Guild.findOne({ inviteCode });
    if (!guild) return res.status(404).json({ error: "Guild not found!" });

    // Prevent duplicate joining
    const isMember = guild.members.some(m => m.userId === userId);
    if (isMember) return res.status(400).json({ error: "Already a member!" });

    guild.members.push({ userId, displayName });
    await guild.save();
    
    res.json(guild);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGuild = async (req, res) => {
  try {
    // Find the guild where this user is a member
    const guild = await Guild.findOne({ "members.userId": req.params.userId });
    res.json(guild || null); // Return null if no guild (frontend handles UI)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { guildId, userId, displayName, message } = req.body;
    
    const guild = await Guild.findById(guildId);
    if (!guild) return res.status(404).json({ error: "Guild not found" });

    // Add message
    guild.chat.push({ userId, displayName, message });
    
    // Keep chat clean: Only keep last 50 messages
    if (guild.chat.length > 50) guild.chat.shift();
    
    await guild.save();
    res.json(guild.chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};