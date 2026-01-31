require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const MonthData = require('./models/MonthData');

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
  // Replace the URL below with your actual Netlify/Vercel URL
  origin: [" https://divyanshsingh112.github.io/habit-tracker/", "http://localhost:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// --- DATABASE CONNECTION ---
// Using process.env.MONGO_URI as seen in your logs
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected')) //
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ROUTES ---

// 0. HEALTH CHECK (Visit your-url.onrender.com/ to see this)
app.get('/', (req, res) => {
  res.send('Habit Tracker API is running...');
});

// 1. GET ALL YEARS for a specific User
// Ensure frontend calls: ${API_URL}/api/years/${userId}
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
// Ensure frontend calls: ${API_URL}/api/habits/${userId}/${year}/${month}
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
// Ensure frontend calls: ${API_URL}/api/habits/${userId}/${year}/${month}
app.post('/api/habits/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;
  const { habits } = req.body;

  try {
    const updatedData = await MonthData.findOneAndUpdate(
      { userId, year, month },
      { userId, year, month, habits }, // Ensure userId is saved for persistence!
      { new: true, upsert: true } 
    );
    res.json(updatedData);
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- START SERVER ---
// Render uses port 10000 by default
const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));