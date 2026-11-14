// ============================================================
// server.js — Entry point for the Student Task Management API
// ============================================================
// WHY: This is the file that starts everything. It loads
//      environment variables, imports the Express app, picks
//      a port, and tells the server to start listening.
// ============================================================

// 1. Load environment variables from .env (keeps secrets out of code)
require('dotenv').config();

// 2. Import the configured Express application
const app = require('./src/app');

// 3. Pick the port: use the hosting platform's PORT or fall back to 3000
const PORT = process.env.PORT || 3000;

// 4. Start the server
app.listen(PORT, () => {
  console.log(`\n🚀  Server is running on port ${PORT}`);
  console.log(`📡  API base URL:  http://localhost:${PORT}/api`);
  console.log(`🖥️   Dashboard:     http://localhost:${PORT}\n`);
});
