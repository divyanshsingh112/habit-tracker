require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const MonthData = require('./models/MonthData');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES ---

// 1. GET ALL YEARS for a specific User
app.get('/api/years/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // Get distinct years ONLY for this user
    const years = await MonthData.find({ userId }).distinct('year');
    res.json(years); 
  } catch (err) {
    console.error("Error getting years:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. GET HABITS for a User
app.get('/api/habits/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;
  try {
    const data = await MonthData.findOne({ userId, year, month });
    // IMPORTANT: If no data, return empty array [] so frontend doesn't hang
    res.json(data ? data.habits : []);
  } catch (err) {
    console.error("Error getting habits:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. SAVE HABITS (Create Year or Update Habits)
app.post('/api/habits/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;
  const { habits } = req.body;

  try {
    const updatedData = await MonthData.findOneAndUpdate(
      { userId, year, month },
      { userId, year, month, habits }, // Ensure userId is saved!
      { new: true, upsert: true } 
    );
    res.json(updatedData);
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));