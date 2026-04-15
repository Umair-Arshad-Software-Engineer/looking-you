const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to Inventory Management System API',
        status: 'Server is running'
    });
});

// Routes
app.use('/api', require('./routes/health.routes'));

module.exports = app;
