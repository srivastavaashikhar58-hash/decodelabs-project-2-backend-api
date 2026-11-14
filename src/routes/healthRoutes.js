// ============================================================
// src/routes/healthRoutes.js — API Server Health Check Route
// ============================================================
// Verifies that the server is alive and functioning properly.
// Returns server uptime, current timestamp, and environment.
// ============================================================

const express = require('express');
const router = express.Router();

// GET /api/health - Server health and status check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    message: 'Backend API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)} seconds`,
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
