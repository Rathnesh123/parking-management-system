const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const seedDatabase = require('./seed');

// Import routes
const dashboardRoutes = require('./routes/dashboardRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const slotRoutes = require('./routes/slotRoutes');
const parkingRoutes = require('./routes/parkingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parking_db';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/parking', parkingRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
  });
});

// Fallback to index.html for SPA navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('====================================================');
    console.log('✅ Connected to MongoDB successfully!');
    console.log(`📦 Database: parking_db`);
    console.log(`🧭 View in MongoDB Compass: ${MONGODB_URI}`);
    console.log('====================================================');

    // Automatically seed sample data if collections are empty
    await seedDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Parking Management Server running at: http://localhost:${PORT}`);
      console.log(`🌐 Open http://localhost:${PORT} in your browser`);
      console.log('====================================================');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('Please make sure your MongoDB service is running (e.g. via Windows Services or MongoDB Compass).');
  });
