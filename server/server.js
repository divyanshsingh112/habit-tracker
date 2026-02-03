const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// Import Routes
const habitRoutes = require('./routes/habitRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const guildRoutes = require('./routes/guildRoutes'); // <-- Ensure this file exists in /routes folder

// Import Controllers (for Cron)
const { sendReminders } = require('./controllers/notificationController');

const app = express();
app.use(cors({
  origin: [
    'https://habit-grid-system.vercel.app', // Your Vercel URL
    'http://localhost:5173',               // Your Localhost (for testing)
    'http://localhost:5000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// Use Routes
app.use('/', habitRoutes);
app.use('/', gamificationRoutes);
app.use('/', notificationRoutes);
app.use('/', guildRoutes); // <-- Vital line for the 404 fix

// --- CRON JOB: Run every day at 9:00 AM ---
cron.schedule('0 9 * * *', () => {
  console.log('Running Daily Reminder Job...');
  sendReminders();
});

// Test Route
app.get('/', (req, res) => res.send('Habit Tracker API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));