
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');

// Connect to Database
connectDB();

const app = express();

// --- Middleware ---
// Enable CORS for all routes and origins
app.use(cors({
  origin: ['http://localhost:5173', 'https://unmuteworld.vercel.app'],
  credentials: true
}));
// Parse JSON bodies
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

// --- Root Endpoint ---
app.get('/', (req, res) => {
  res.send('Unmute World API is running!');
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
