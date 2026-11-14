// ============================================================
// src/app.js — Express application setup
// ============================================================
// WHY: We separate the "app" from "server.js" so we can
//      import the app into tests without starting the server.
// ============================================================

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// Import our middleware
const { requestLogger } = require('./middleware/logger');
const { errorHandler }  = require('./middleware/errorHandler');

// Import routes
const taskRoutes   = require('./routes/taskRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Create the Express application
const app = express();

// ---- GLOBAL MIDDLEWARE ----

// Allow cross-origin requests (so frontends on other domains can call us)
app.use(cors());

// Parse incoming JSON bodies (POST requests send JSON)
app.use(express.json());

// Log every request to the console
app.use(requestLogger);

// Serve the frontend dashboard from the "public" folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---- ROUTES ----

// Health-check route
app.use('/api', healthRoutes);

// Task CRUD routes
app.use('/api/tasks', taskRoutes);

// ---- 404 CATCH-ALL ----
// If no route matched, return a 404 JSON response
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ---- GLOBAL ERROR HANDLER ----
// Must be the LAST app.use() — catches errors from any route
app.use(errorHandler);

module.exports = app;
