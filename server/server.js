const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron'); // <-- IMPORT CRON
require('dotenv').config();

const habitRoutes = require('./routes/habitRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // <-- IMPORT ROUTES
const { sendReminders } = require('./controllers/notificationController'); // <-- IMPORT SENDER

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

app.use('/', habitRoutes);
app.use('/', gamificationRoutes);
app.use('/', notificationRoutes); // <-- USE ROUTES

// --- CRON JOB: Run every day at 9:00 AM ---
// Syntax: 'Minute Hour * * *'
cron.schedule('0 9 * * *', () => {
  console.log('Running Daily Reminder Job...');
  sendReminders();
});

app.get('/', (req, res) => res.send('Habit Tracker API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));