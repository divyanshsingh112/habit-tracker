// server/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db'); // or wherever your db connection is

const habitRoutes = require('./routes/habitRoutes');
// ... other imports

const app = express();

// Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json());

// 🔴 CRITICAL FIX: Ensure this says '/api/habits', not just '/habits'
app.use('/api/habits', habitRoutes); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});