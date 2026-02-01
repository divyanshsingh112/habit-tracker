require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const MonthData = require('./models/MonthData');

const app = express();

// --- 1. CORS CONFIGURATION ---
// Update this with your actual Vercel URL once deployed
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://divyanshsingh112.github.io",
    "https://habit-tracker-kooi.vercel.app" // <--- ADD YOUR NEW VERCEL DOMAIN HERE
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

// --- 2. DATABASE ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 3. ROUTES ---
app.get('/years/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const years = await MonthData.find({ userId }).distinct('year');
    res.json(years); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/habits/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;
  try {
    const data = await MonthData.findOne({ userId, year, month });
    res.json(data ? data.habits : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.get('/streak/:userId', async (req, res) => {
  const { userId } = req.params;
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const months = ["January", "February", "March", "April", "May", "June", 
                  "July", "August", "September", "October", "November", "December"];
  const currentMonth = months[now.getMonth()];
  const today = now.getDate();

  try {
    const data = await MonthData.findOne({ userId, year: currentYear, month: currentMonth });
    if (!data) return res.json({ streak: 0 });

    let globalStreak = 0;
    // Count backwards from today to find consecutive active days
    for (let d = today; d > 0; d--) {
      // Check if ANY habit was completed on day 'd'
      const anyCompleted = data.habits.some(h => h.completedDays && h.completedDays.get(d.toString()));
      if (anyCompleted) {
        globalStreak++;
      } else if (d === today) {
        continue; // Streak isn't broken yet if today isn't finished
      } else {
        break;
      }
    }
    res.json({ streak: globalStreak });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Habit Tracker API Running'));

// --- 4. RENDER DYNAMIC PORT ---
const PORT = process.env.PORT || 5000; // Render sets the PORT env variable automatically
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;