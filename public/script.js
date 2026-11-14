// ============================================================
// public/script.js — Frontend Client for API Demonstration
// ============================================================
// Interacts with the Express.js Backend API:
// - GET /api/health
// - GET /api/tasks
// - GET /api/tasks/:id
// - POST /api/tasks
// - DELETE /api/tasks/:id
// ============================================================

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

// Helper: Log to Console Box
function logToConsole(method, url, status, data) {
  consoleMeta.textContent = `${method} ${url} → HTTP ${status}`;
  
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

  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();

    logToConsole('GET', `${API_BASE}/health`, res.status, data);

    if (res.ok) {
      healthIndicator.className = 'status-pill status-healthy';
      healthIndicator.textContent = 'Server Online';

      healthDetails.innerHTML = `
        <p><strong>Status:</strong> ${data.status} | <strong>Uptime:</strong> ${data.uptime} | <strong>Env:</strong> ${data.environment}</p>
        <p><small>Checked at: ${new Date(data.timestamp).toLocaleTimeString()}</small></p>
      `;
    } else {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
  } catch (err) {
    healthIndicator.className = 'status-pill status-error';
    healthIndicator.textContent = 'Server Offline';
    healthDetails.innerHTML = `<p style="color: var(--danger)">Error: ${err.message}</p>`;
    logToConsole('GET', `${API_BASE}/health`, 'ERR', { error: err.message });
  }
}

// ------------------------------------------------------------
// 2. Fetch All Tasks (GET /api/tasks)
// ------------------------------------------------------------
async function fetchTasks() {
  taskListContainer.innerHTML = '<p class="loading-text">Loading tasks...</p>';

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
    taskListContainer.innerHTML = `<p style="color: var(--danger)">Connection error: ${err.message}</p>`;
    logToConsole('GET', `${API_BASE}/tasks`, 'ERR', { error: err.message });
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
    alert('Please provide a Task ID.');
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
      fetchTasks(); // Refresh list
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
  // Pre-fill intentionally invalid data:
  // Short title (<3 chars), empty desc, invalid status
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

// ------------------------------------------------------------
// UI Utilities
// ------------------------------------------------------------
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
