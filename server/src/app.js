const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const actividadesRoutes = require('./routes/actividadesRoutes');

const app = express();

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'https://verkkom-app-git-main-alexis-pedrazas-projects.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
            return callback(null, true);
        }
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true
}));
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api/actividades', actividadesRoutes);

module.exports = app;
