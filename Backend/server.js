const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');


// Load config
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// UPDATE CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// Middleware
app.use(cors()); // Allows Frontend to talk to Backend
app.use(express.json()); // Allows parsing JSON bodies

// Routes
app.use('/api/habits', require('./routes/habitRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));