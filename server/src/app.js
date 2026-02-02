const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const actividadesRoutes = require('./routes/actividadesRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/actividades', actividadesRoutes);

module.exports = app;
