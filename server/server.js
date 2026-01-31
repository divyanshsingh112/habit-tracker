require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const MonthData = require('./models/MonthData');

const app = express();

// --- 1. CORS CONFIGURATION ---
// We allow your GitHub frontend explicitly
app.use(cors({
  origin: ["https://divyanshsingh112.github.io", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// --- 2. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 3. ROUTES (NO '/api' PREFIX) ---

// GET ALL YEARS
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

// GET HABITS
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

// SAVE HABITS
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

// Health Check
app.get('/', (req, res) => res.send('Habit Tracker API Running'));

// --- 4. EXPORT FOR VERCEL ---
// This is critical. Do not remove this line.
module.exports = app;