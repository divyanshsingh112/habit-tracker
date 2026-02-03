const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// --- SCHEMAS ---

// 1. Habit Data Schema
const habitSchema = new mongoose.Schema({
  id: Number,
  name: String,
  category: String,
  attribute: String, // 'str', 'int', 'wis', 'cha'
  completedDays: Object 
});

const monthSchema = new mongoose.Schema({
  userId: String,
  year: String,
  month: String,
  habits: [habitSchema]
});

const MonthData = mongoose.model('MonthData', monthSchema);

// 2. User Stats Schema (UPDATED FOR RPG CHART)
const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 0 },
  // The RPG Stats
  stats: {
    str: { type: Number, default: 0 }, // Warrior (Skills)
    int: { type: Number, default: 0 }, // Mage (Intellect)
    wis: { type: Number, default: 0 }, // Monk (Stamina)
    cha: { type: Number, default: 0 }  // Bard (Charisma)
  }
});

const UserStats = mongoose.model('UserStats', userStatsSchema);

// --- ROUTES ---

// 1. GET ALL DATA
app.get('/all-data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const allData = await MonthData.find({ userId });
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET STREAK
app.get('/streak/:userId', async (req, res) => {
  try {
    res.json({ streak: 0 }); 
  } catch (err) {
    res.json({ streak: 0 });
  }
});

// 3. GET SPECIFIC MONTH
app.get('/habits/:userId/:year/:month', async (req, res) => {
  try {
    const { userId, year, month } = req.params;
    const data = await MonthData.findOne({ userId, year, month });
    res.json(data ? data.habits : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. SAVE HABITS
app.post('/habits/:userId/:year/:month', async (req, res) => {
  try {
    const { userId, year, month } = req.params;
    const { habits } = req.body;
    
    await MonthData.findOneAndUpdate(
      { userId, year, month },
      { habits },
      { upsert: true, new: true }
    );
    res.json({ message: "Saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE YEAR
app.delete('/years/:userId/:year', async (req, res) => {
  try {
    const { userId, year } = req.params;
    const result = await MonthData.deleteMany({ userId, year });
    res.json({ message: 'Year deleted successfully', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. GAMIFICATION ROUTES

// Get Stats
app.get('/stats/:userId', async (req, res) => {
  try {
    let stats = await UserStats.findOne({ userId: req.params.userId });
    if (!stats) {
      stats = await UserStats.create({ userId: req.params.userId });
    }
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Stats (UPDATED LOGIC)
app.post('/stats/:userId', async (req, res) => {
  try {
    const { xpEarned, attribute } = req.body; 
    
    let stats = await UserStats.findOne({ userId: req.params.userId });
    if (!stats) stats = await UserStats.create({ userId: req.params.userId });

    // 1. Update Global XP
    stats.xp += xpEarned || 0;

    // 2. Update Specific RPG Stat
    if (xpEarned > 0 && attribute) {
       if (!stats.stats) stats.stats = { str: 0, int: 0, wis: 0, cha: 0 };
       
       // Increment stat (10 XP = 1 Stat Point)
       // Force attribute to lower case to match schema keys
       const attrKey = attribute.toLowerCase();
       if (stats.stats[attrKey] !== undefined) {
          stats.stats[attrKey] += (xpEarned / 10); 
       }
    }

    // 3. Level Up/Down Logic
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
});

app.get('/', (req, res) => res.send('Habit Tracker API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));