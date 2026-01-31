require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const MonthData = require('./models/MonthData'); 

const app = express();

// --- METHOD 2: THE "ALLOW ALL" WILDCARD ---
// This allows ANY website to connect. No specific URLs needed.
app.use(cors()); 

app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES (Fixed: REMOVED '/api' so it matches your Frontend) ---

// 0. HEALTH CHECK
app.get('/', (req, res) => {
  res.send('Habit Tracker API is running...');
});

// 1. GET ALL YEARS
app.get('/years/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const years = await MonthData.find({ userId }).distinct('year');
    res.json(years); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET HABITS
app.get('/habits/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;
  try {
    const data = await MonthData.findOne({ userId, year, month });
    res.json(data ? data.habits : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. SAVE HABITS
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
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;