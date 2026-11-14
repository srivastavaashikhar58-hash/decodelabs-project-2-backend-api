// ============================================================
// script.js — Frontend Client for API Demonstration
// Supports both Live Express Backend and GitHub Pages Demo Mode
// ============================================================

const isGitHubPages = window.location.hostname.includes('github.io');
const API_BASE = '/api';

// DOM Elements
const healthIndicator = document.getElementById('health-indicator');
const healthDetails = document.getElementById('health-details');
const btnRefreshHealth = document.getElementById('btn-refresh-health');

const taskForm = document.getElementById('task-form');
const inputTitle = document.getElementById('task-title');
const inputDesc = document.getElementById('task-desc');
const selectStatus = document.getElementById('task-status');
const btnTestInvalid = document.getElementById('btn-test-invalid');
const formFeedback = document.getElementById('form-feedback');

const taskListContainer = document.getElementById('task-list');
const btnRefreshTasks = document.getElementById('btn-refresh-tasks');
const searchTaskIdInput = document.getElementById('search-task-id');
const btnGetById = document.getElementById('btn-get-by-id');

const consoleOutput = document.getElementById('console-output');
const consoleMeta = document.getElementById('console-meta');
const responseStatusPill = document.getElementById('response-status-pill');
const btnClearConsole = document.getElementById('btn-clear-console');

// ---- CLIENT-SIDE SIMULATION FOR GITHUB PAGES ----
// GitHub Pages hosts static files without running Node.js.
// When hosted on github.io, this simulation ensures visitors and mentors
// can test every GET/POST endpoint, validation rule, and status code live!
let mockTasks = [
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

let useSimulatedBackend = isGitHubPages;

// Log to Console Box
function logToConsole(method, url, status, data) {
  const modeTag = useSimulatedBackend ? ' [Demo Engine]' : ' [Live Server]';
  consoleMeta.textContent = `${method} ${url} → HTTP ${status}${modeTag}`;
  
  responseStatusPill.className = `status-pill status-${status}`;
  responseStatusPill.textContent = `Status: ${status}`;

  consoleOutput.textContent = JSON.stringify(data, null, 2);
}

// ------------------------------------------------------------
// 1. Health Check (GET /api/health)
// ------------------------------------------------------------
async function checkHealth() {
  healthIndicator.className = 'status-pill status-checking';
  healthIndicator.textContent = 'Checking server...';

  if (useSimulatedBackend) {
    const mockHealth = {
      success: true,
      status: 'healthy',
      message: 'Student Task Management API is running (Demo Mode)',
      timestamp: new Date().toISOString(),
      uptime: `${(performance.now() / 1000).toFixed(2)} seconds`,
      environment: 'github-pages-preview'
    };
    logToConsole('GET', `${API_BASE}/health`, 200, mockHealth);
    healthIndicator.className = 'status-pill status-healthy';
    healthIndicator.textContent = 'Demo API Online';
    healthDetails.innerHTML = `
      <p><strong>Status:</strong> ${mockHealth.status} | <strong>Mode:</strong> GitHub Pages Preview | <strong>Uptime:</strong> ${mockHealth.uptime}</p>
      <p><small>Previewing in-browser API logic with real validation & HTTP status codes.</small></p>
    `;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    logToConsole('GET', `${API_BASE}/health`, res.status, data);

    healthIndicator.className = 'status-pill status-healthy';
    healthIndicator.textContent = 'Server Online';

    healthDetails.innerHTML = `
      <p><strong>Status:</strong> ${data.status} | <strong>Uptime:</strong> ${data.uptime} | <strong>Env:</strong> ${data.environment}</p>
      <p><small>Connected to Node.js / Express server.</small></p>
    `;
  } catch (err) {
    useSimulatedBackend = true;
    checkHealth();
  }
}

// ------------------------------------------------------------
// 2. Fetch All Tasks (GET /api/tasks)
// ------------------------------------------------------------
async function fetchTasks() {
  taskListContainer.innerHTML = '<p class="loading-text">Loading tasks...</p>';

  if (useSimulatedBackend) {
    const responseData = {
      success: true,
      count: mockTasks.length,
      data: mockTasks
    };
    logToConsole('GET', `${API_BASE}/tasks`, 200, responseData);
    renderTaskList(mockTasks);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/tasks`);
    const data = await res.json();

    logToConsole('GET', `${API_BASE}/tasks`, res.status, data);

    if (res.ok && data.success) {
      renderTaskList(data.data);
    } else {
      taskListContainer.innerHTML = `<p style="color: var(--danger)">Failed to load tasks</p>`;
    }
  } catch (err) {
    useSimulatedBackend = true;
    fetchTasks();
  }
}

// Render Task Cards
function renderTaskList(tasks) {
  if (!tasks || tasks.length === 0) {
    taskListContainer.innerHTML = '<p class="loading-text">No tasks found. Create one using the form!</p>';
    return;
  }

  taskListContainer.innerHTML = tasks.map(task => `
    <div class="task-card" data-id="${task.id}">
      <div class="task-card-header">
        <h4 class="task-card-title">${escapeHtml(task.title)}</h4>
        <span class="task-tag ${task.status}">${task.status}</span>
      </div>
      <p class="task-card-desc">${escapeHtml(task.description)}</p>
      <div class="task-card-meta">
        <span>ID: <code>${task.id}</code></span>
        <div class="task-actions">
          <button class="task-btn-action" onclick="fetchTaskById('${task.id}')">Inspect</button>
          <button class="task-btn-action del" onclick="deleteTaskById('${task.id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ------------------------------------------------------------
// 3. Fetch Single Task (GET /api/tasks/:id)
// ------------------------------------------------------------
async function fetchTaskById(id) {
  const targetId = id || searchTaskIdInput.value.trim();
  if (!targetId) {
    alert('Please enter a Task ID.');
    return;
  }

  if (useSimulatedBackend) {
    const task = mockTasks.find(t => t.id === targetId);
    if (!task) {
      const errResp = { success: false, error: `Task with ID "${targetId}" not found` };
      logToConsole('GET', `${API_BASE}/tasks/${targetId}`, 404, errResp);
      showFeedback('error', errResp.error);
      return;
    }
    const succResp = { success: true, data: task };
    logToConsole('GET', `${API_BASE}/tasks/${targetId}`, 200, succResp);
    showFeedback('success', `Found task: "${task.title}"`);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/tasks/${encodeURIComponent(targetId)}`);
    const data = await res.json();

    logToConsole('GET', `${API_BASE}/tasks/${targetId}`, res.status, data);

    if (res.ok) {
      showFeedback('success', `Found task: "${data.data.title}"`);
    } else {
      showFeedback('error', data.error || `Task not found (HTTP ${res.status})`);
    }
  } catch (err) {
    logToConsole('GET', `${API_BASE}/tasks/${targetId}`, 'ERR', { error: err.message });
  }
}

// ------------------------------------------------------------
// 4. Create Task (POST /api/tasks)
// ------------------------------------------------------------
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    title: inputTitle.value,
    description: inputDesc.value,
    status: selectStatus.value
  };

  await submitTask(payload);
});

// Helper for sending POST request
async function submitTask(payload) {
  formFeedback.className = 'feedback-box hidden';

  if (useSimulatedBackend) {
    // Exact same validation rules as Express validateTask middleware
    const errors = [];
    const ALLOWED = ['pending', 'in-progress', 'completed'];

    if (!payload.title || typeof payload.title !== 'string' || payload.title.trim().length === 0) {
      errors.push('Field "title" is required.');
    } else if (payload.title.trim().length < 3) {
      errors.push('"title" must be at least 3 characters long.');
    } else if (payload.title.trim().length > 100) {
      errors.push('"title" must be at most 100 characters long.');
    }

    if (!payload.description || typeof payload.description !== 'string' || payload.description.trim().length === 0) {
      errors.push('Field "description" is required.');
    } else if (payload.description.trim().length > 500) {
      errors.push('"description" must be at most 500 characters long.');
    }

    if (!payload.status || !ALLOWED.includes(payload.status)) {
      errors.push(`"status" must be one of: ${ALLOWED.join(', ')}. Received: "${payload.status}".`);
    }

    if (errors.length > 0) {
      const errResp = {
        success: false,
        error: 'Validation failed',
        details: errors
      };
      logToConsole('POST', `${API_BASE}/tasks`, 400, errResp);
      const detailsList = `<ul>${errors.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`;
      showFeedback('error', `<strong>Validation Error (400 Bad Request):</strong> ${errResp.error}${detailsList}`);
      return;
    }

    // Success: 201 Created
    const newTask = {
      id: 'task-' + Math.floor(Math.random() * 90000 + 10000),
      title: payload.title.trim(),
      description: payload.description.trim(),
      status: payload.status,
      createdAt: new Date().toISOString()
    };
    mockTasks.push(newTask);

    const succResp = {
      success: true,
      message: 'Task created successfully',
      data: newTask
    };
    logToConsole('POST', `${API_BASE}/tasks`, 201, succResp);
    showFeedback('success', `Task created! ID: ${newTask.id}`);
    taskForm.reset();
    fetchTasks();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    logToConsole('POST', `${API_BASE}/tasks`, res.status, data);

    if (res.status === 201) {
      showFeedback('success', `Task created! ID: ${data.data.id}`);
      taskForm.reset();
      fetchTasks();
    } else if (res.status === 400) {
      const detailsList = data.details
        ? `<ul>${data.details.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`
        : '';
      showFeedback('error', `<strong>Validation Error (400 Bad Request):</strong> ${escapeHtml(data.error)}${detailsList}`);
    } else {
      showFeedback('error', `Server error (${res.status}): ${escapeHtml(data.error || 'Unknown error')}`);
    }
  } catch (err) {
    showFeedback('error', `Network error: ${err.message}`);
    logToConsole('POST', `${API_BASE}/tasks`, 'ERR', { error: err.message });
  }
}

// ------------------------------------------------------------
// 5. Test Invalid Input (Triggers 400 Bad Request)
// ------------------------------------------------------------
btnTestInvalid.addEventListener('click', () => {
  inputTitle.value = 'Hi';
  inputDesc.value = '';
  selectStatus.value = 'invalid-status';

  submitTask({
    title: 'Hi',
    description: '',
    status: 'invalid-status'
  });
});

// ------------------------------------------------------------
// 6. Delete Task (DELETE /api/tasks/:id)
// ------------------------------------------------------------
async function deleteTaskById(id) {
  if (!confirm(`Delete task ${id}?`)) return;

  if (useSimulatedBackend) {
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) {
      const errResp = { success: false, error: `Task with ID "${id}" not found` };
      logToConsole('DELETE', `${API_BASE}/tasks/${id}`, 404, errResp);
      showFeedback('error', errResp.error);
      return;
    }
    const deleted = mockTasks.splice(index, 1)[0];
    const succResp = { success: true, message: 'Task deleted successfully', data: deleted };
    logToConsole('DELETE', `${API_BASE}/tasks/${id}`, 200, succResp);
    showFeedback('success', `Task ${id} deleted.`);
    fetchTasks();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const data = await res.json();

    logToConsole('DELETE', `${API_BASE}/tasks/${id}`, res.status, data);

    if (res.ok) {
      showFeedback('success', `Task ${id} deleted.`);
      fetchTasks();
    } else {
      showFeedback('error', data.error || `Could not delete task`);
    }
  } catch (err) {
    logToConsole('DELETE', `${API_BASE}/tasks/${id}`, 'ERR', { error: err.message });
  }
}

// UI Utilities
function showFeedback(type, htmlContent) {
  formFeedback.className = `feedback-box ${type}`;
  formFeedback.innerHTML = htmlContent;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Clear console
btnClearConsole.addEventListener('click', () => {
  consoleOutput.textContent = '// Console cleared.';
  consoleMeta.textContent = 'Cleared';
  responseStatusPill.className = 'status-pill status-idle';
  responseStatusPill.textContent = 'Status: Idle';
});

// Listeners
btnRefreshHealth.addEventListener('click', checkHealth);
btnRefreshTasks.addEventListener('click', fetchTasks);
btnGetById.addEventListener('click', () => fetchTaskById());

// Initial run
window.addEventListener('DOMContentLoaded', () => {
  checkHealth();
  fetchTasks();
});
