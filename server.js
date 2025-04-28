const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/error');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://dice-raja.vercel.app',
        'https://diceraja.umkk.life'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is up and running',
        timestamp: new Date().toISOString()
    });
});

// Error Handler Middleware (Should be after routes)
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dice_raja')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Start server
const PORT = process.env.PORT || 8007;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
});