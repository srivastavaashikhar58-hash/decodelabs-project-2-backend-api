// ============================================================
// src/controllers/taskController.js — Business logic for tasks
// ============================================================
// WHY: Controllers hold the "brain" of each route. They
//      decide what to do with the data and what to send back.
//      Keeping logic here (not in routes) makes code cleaner.
// ============================================================

const { v4: uuidv4 } = require('uuid');

// ---- IN-MEMORY DATA STORE ----
// NOTE: Data is stored in an array. It resets when the server
//       restarts. For a real app you would use a database like
//       MongoDB or PostgreSQL. This is fine for a beginner
//       project that demonstrates API concepts.
let tasks = [
  {
    id: '1',
    title: 'Learn Express.js',
    description: 'Study how to build REST APIs using Express.js framework',
    status: 'in-progress',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Complete DecodeLabs Project 2',
    description: 'Build and deploy a Backend API project for the internship',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

// -----------------------------------------------------------------
// GET /api/tasks — Return every task
// -----------------------------------------------------------------
function getAllTasks(req, res) {
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
}

// -----------------------------------------------------------------
// GET /api/tasks/:id — Return one task by ID
// -----------------------------------------------------------------
function getTaskById(req, res) {
  const { id } = req.params;
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: `Task with ID "${id}" not found`
    });
  }

  res.status(200).json({
    success: true,
    data: task
  });
}

// -----------------------------------------------------------------
// POST /api/tasks — Create a new task
// -----------------------------------------------------------------
function createTask(req, res) {
  const { title, description, status } = req.body;

  const newTask = {
    id: uuidv4(),
    title: title.trim(),
    description: description.trim(),
    status,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: newTask
  });
}

// -----------------------------------------------------------------
// DELETE /api/tasks/:id — Delete a task (bonus endpoint)
// -----------------------------------------------------------------
function deleteTask(req, res) {
  const { id } = req.params;
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: `Task with ID "${id}" not found`
    });
  }

  const deleted = tasks.splice(index, 1)[0];

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: deleted
  });
}

// -----------------------------------------------------------------
// PUT /api/tasks/:id — Update a task (bonus endpoint)
// -----------------------------------------------------------------
function updateTask(req, res) {
  const { id } = req.params;
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: `Task with ID "${id}" not found`
    });
  }

  const { title, description, status } = req.body;

  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (status !== undefined) task.status = status;
  task.updatedAt = new Date().toISOString();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  deleteTask,
  updateTask
};
