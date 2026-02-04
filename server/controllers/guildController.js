const Guild = require('../models/Guild');

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

exports.createGuild = async (req, res) => {
  try {
    const { name, description, userId, displayName } = req.body;
    
    // Check if user is already in a guild
    const existing = await Guild.findOne({ "members.userId": userId });
    if (existing) return res.status(400).json({ error: "You are already in a guild!" });

    const newGuild = await Guild.create({
      name,
      description,
      inviteCode: generateCode(),
      adminId: userId, // Set Creator as Admin
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
    
    const existing = await Guild.findOne({ "members.userId": userId });
    if (existing) return res.status(400).json({ error: "You are already in a guild!" });

    const guild = await Guild.findOne({ inviteCode });
    if (!guild) return res.status(404).json({ error: "Guild not found!" });

    // --- SELF-HEAL FIX: If old guild has no Admin, assign one ---
    if (!guild.adminId && guild.members.length > 0) {
       guild.adminId = guild.members[0].userId;
    }
    // -----------------------------------------------------------

    guild.members.push({ userId, displayName });
    await guild.save();
    
    res.json(guild);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGuild = async (req, res) => {
  try {
    const guild = await Guild.findOne({ "members.userId": req.params.userId });
    res.json(guild || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { guildId, userId, displayName, message } = req.body;
    const guild = await Guild.findById(guildId);
    if (!guild) return res.status(404).json({ error: "Guild not found" });

    // --- SELF-HEAL FIX: If old guild has no Admin, assign one ---
    if (!guild.adminId && guild.members.length > 0) {
       guild.adminId = guild.members[0].userId;
    }
    // -----------------------------------------------------------

    guild.chat.push({ userId, displayName, message });
    
    // Keep chat clean: Only keep last 50 messages
    if (guild.chat.length > 50) guild.chat.shift();
    
    await guild.save();
    res.json(guild.chat);
  } catch (err) {
    console.error("Message Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.leaveGuild = async (req, res) => {
  try {
    const { guildId, userId } = req.body;
    const guild = await Guild.findById(guildId);
    if (!guild) return res.status(404).json({ error: "Guild not found" });

    // Remove user
    guild.members = guild.members.filter(m => m.userId !== userId);

    // If no one is left, delete the guild
    if (guild.members.length === 0) {
      await Guild.findByIdAndDelete(guildId);
      return res.json({ message: "Guild disbanded (empty)" });
    }

    // If Admin leaves, pass admin rights to the next oldest member
    if (guild.adminId === userId) {
        guild.adminId = guild.members[0].userId;
    }

    await guild.save();
    res.json({ message: "Left guild" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGuild = async (req, res) => {
  try {
    const { guildId, userId } = req.body;
    const guild = await Guild.findById(guildId);
    if (!guild) return res.status(404).json({ error: "Guild not found" });

    // Security Check: Only Admin can delete
    if (guild.adminId !== userId) {
      return res.status(403).json({ error: "Only the Leader can disband the guild!" });
    }

    await Guild.findByIdAndDelete(guildId);
    res.json({ message: "Guild deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};