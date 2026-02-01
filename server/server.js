const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION (Cleaned) ---
// Removed deprecated options to fix the warnings
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// --- SCHEMA DEFINITION ---
const habitSchema = new mongoose.Schema({
  id: Number,
  name: String,
  category: String,
  completedDays: Object 
});

const monthSchema = new mongoose.Schema({
  userId: String,
  year: String,
  month: String,
  habits: [habitSchema]
});

const MonthData = mongoose.model('MonthData', monthSchema);

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

// 5. DELETE YEAR (With Debug Logs)
app.delete('/years/:userId/:year', async (req, res) => {
  try {
    const { userId, year } = req.params;
    
    console.log(`Attempting to delete year: ${year} for user: ${userId}`); // DEBUG LOG

    // Delete ALL month records for this specific year
    const result = await MonthData.deleteMany({ userId, year });
    
    console.log(`Deleted count: ${result.deletedCount}`); // DEBUG LOG

    res.json({ message: 'Year deleted successfully', deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 6. LOAD YEARS
app.get('/years/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const distinctYears = await MonthData.find({ userId }).distinct('year');
    res.json(distinctYears);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Habit Tracker API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));