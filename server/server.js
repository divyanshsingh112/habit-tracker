require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// Ensure this path matches where you created your model file
const MonthData = require('./models/MonthData'); 

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
  origin: [
    "https://divyanshsingh112.github.io",  // ✅ CORRECT: No space, no slash
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES ---

// 0. HEALTH CHECK
app.get('/', (req, res) => {
  res.send('Habit Tracker API is running...');
});

// 1. GET ALL YEARS (Fixed: Removed /api)
app.get('/years/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const years = await MonthData.find({ userId }).distinct('year');
    res.json(years); 
  } catch (err) {
    console.error("Error getting years:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. GET HABITS (Fixed: Removed /api)
app.get('/habits/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;
  try {
    const data = await MonthData.findOne({ userId, year, month });
    res.json(data ? data.habits : []);
  } catch (err) {
    console.error("Error getting habits:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. SAVE HABITS (Fixed: Removed /api)
app.post('/habits/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;
  const { habits } = req.body;

  try {
    const updatedData = await MonthData.findOneAndUpdate(
      { userId, year, month },
      { userId, year, month, habits },
      { new: true, upsert: true } 
    );
    res.json(updatedData);
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- START SERVER ---
module.exports = app;