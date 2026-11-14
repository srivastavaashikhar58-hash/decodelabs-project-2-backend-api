// ============================================================
// src/routes/taskRoutes.js — API Routes for Student Tasks
// ============================================================
// Defines HTTP verbs and path mappings to controller methods.
// Validates inputs using the validateTask middleware.
// ============================================================

const express = require('express');
const router = express.Router();
const { validateTask } = require('../middleware/validateTask');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// GET /api/tasks - Retrieve all tasks
router.get('/', getAllTasks);

// GET /api/tasks/:id - Retrieve a specific task by ID
router.get('/:id', getTaskById);

// POST /api/tasks - Create a new task (runs validation middleware first)
router.post('/', validateTask, createTask);

// PUT /api/tasks/:id - Update an existing task
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Delete a task by ID
router.delete('/:id', deleteTask);

module.exports = router;
