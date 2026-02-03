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

// 1. Habit Data Schema (Updated for RPG Attributes)
const habitSchema = new mongoose.Schema({
  id: Number,
  name: String,
  category: String,   // General category (e.g. "Health")
  attribute: String,  // RPG Attribute: 'str', 'int', 'wis', 'cha'
  completedDays: Object 
});

const monthSchema = new mongoose.Schema({
  userId: String,
  year: String,
  month: String,
  habits: [habitSchema]
});

const MonthData = mongoose.model('MonthData', monthSchema);

// 2. User Stats Schema (Updated for RPG Stats)
const userStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  coins: { type: Number, default: 0 },
  // RPG Stats Storage
  stats: {
    str: { type: Number, default: 0 }, // Strength
    int: { type: Number, default: 0 }, // Intellect
    wis: { type: Number, default: 0 }, // Wisdom
    cha: { type: Number, default: 0 }  // Charisma
  }
});

const UserStats = mongoose.model('UserStats', userStatsSchema);

// --- ROUTES ---

// 1. GET ALL DATA (Habits)
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

// Update Stats (Smart RPG Logic + Level Up/Down)
app.post('/stats/:userId', async (req, res) => {
  try {
    const { xpEarned, attribute } = req.body; // Receive Attribute (e.g. 'str')
    
    let stats = await UserStats.findOne({ userId: req.params.userId });
    if (!stats) stats = await UserStats.create({ userId: req.params.userId });

    // 1. Apply Global XP Change
    stats.xp += xpEarned || 0;
    
    // 2. Update Specific RPG Stat (Only if Gaining XP)
    if (xpEarned > 0 && attribute) {
       // Ensure stats object exists
       if (!stats.stats) stats.stats = { str: 0, int: 0, wis: 0, cha: 0 };
       
       // Increment the correct stat (10 XP = 1 Stat Point)
       if (stats.stats[attribute] !== undefined) {
          stats.stats[attribute] += (xpEarned / 10); 
       }
    }

    // 3. LEVEL UP LOOP (While XP is too high, go up)
    while (stats.xp >= stats.level * 100) {
      stats.xp -= stats.level * 100;
      stats.level += 1;
    }

    // 4. LEVEL DOWN LOOP (While XP is negative, go down)
    while (stats.xp < 0) {
      if (stats.level > 1) {
        stats.level -= 1;
        // When dropping a level, reclaim the XP cap of the lower level
        stats.xp += stats.level * 100; 
      } else {
        // If Level 1 and XP < 0, just cap at 0
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