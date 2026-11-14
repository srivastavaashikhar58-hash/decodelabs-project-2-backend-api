// ============================================================
// tests/api.test.js — Automated API Test Suite
// ============================================================
// Tests all endpoints and edge cases:
// 1. GET  /api/health      -> 200 OK + expected schema
// 2. GET  /api/tasks       -> 200 OK + array of tasks
// 3. GET  /api/tasks/:id   -> 200 OK for valid ID
// 4. GET  /api/tasks/:id   -> 404 Not Found for non-existent ID
// 5. POST /api/tasks       -> 201 Created for valid payload
// 6. POST /api/tasks       -> 400 Bad Request when title is missing
// 7. POST /api/tasks       -> 400 Bad Request when title is too short (<3 chars)
// 8. POST /api/tasks       -> 400 Bad Request when status is invalid
// 9. PUT  /api/tasks/:id   -> 200 OK for updates
// 10. DELETE /api/tasks/:id-> 200 OK for deletion
// 11. GET /api/nonexistent -> 404 Not Found
// ============================================================

const http = require('http');
const app = require('../src/app');

// Test runner helper
let server;
let baseUrl;
let passedCount = 0;
let failedCount = 0;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(rawData);
        } catch (e) {
          json = rawData;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
    failedCount++;
  }
}

async function main() {
  console.log('====================================================');
  console.log('🧪 Starting Automated API Test Suite (DecodeLabs)');
  console.log('====================================================\n');

  // Start server on random available port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`Test server running at ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // 1. GET /api/health
    await runTest('GET /api/health returns 200 and healthy status', async () => {
      const res = await request('GET', '/api/health');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.body.success === true, 'Expected success: true');
      assert(res.body.status === 'healthy', 'Expected status: healthy');
      assert(typeof res.body.uptime === 'string', 'Expected uptime string');
    });

    // 2. GET /api/tasks
    await runTest('GET /api/tasks returns 200 and list of tasks', async () => {
      const res = await request('GET', '/api/tasks');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.body.success === true, 'Expected success: true');
      assert(Array.isArray(res.body.data), 'Expected data to be array');
      assert(res.body.count >= 2, 'Expected at least 2 default tasks');
    });

    // 3. GET /api/tasks/:id (valid ID)
    await runTest('GET /api/tasks/1 returns 200 and specific task', async () => {
      const res = await request('GET', '/api/tasks/1');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.body.success === true, 'Expected success: true');
      assert(res.body.data.id === '1', 'Expected task ID 1');
      assert(res.body.data.title === 'Learn Express.js', 'Expected matching title');
    });

    // 4. GET /api/tasks/:id (non-existent ID)
    await runTest('GET /api/tasks/non-existent returns 404 Not Found', async () => {
      const res = await request('GET', '/api/tasks/non-existent-999');
      assert(res.status === 404, `Expected 404, got ${res.status}`);
      assert(res.body.success === false, 'Expected success: false');
      assert(res.body.error.includes('not found'), 'Expected error message mentioning not found');
    });

    // 5. POST /api/tasks (valid input)
    let createdTaskId = null;
    await runTest('POST /api/tasks with valid body returns 201 Created', async () => {
      const newPayload = {
        title: 'Build automated tests',
        description: 'Verify all endpoints respond with proper status codes',
        status: 'in-progress'
      };
      const res = await request('POST', '/api/tasks', newPayload);
      assert(res.status === 201, `Expected 201, got ${res.status}`);
      assert(res.body.success === true, 'Expected success: true');
      assert(res.body.data.title === newPayload.title, 'Title must match');
      assert(res.body.data.id !== undefined, 'ID must be generated');
      createdTaskId = res.body.data.id;
    });

    // 6. POST /api/tasks (missing title)
    await runTest('POST /api/tasks without title returns 400 Bad Request', async () => {
      const invalidPayload = {
        description: 'Missing title field',
        status: 'pending'
      };
      const res = await request('POST', '/api/tasks', invalidPayload);
      assert(res.status === 400, `Expected 400, got ${res.status}`);
      assert(res.body.success === false, 'Expected success: false');
      assert(Array.isArray(res.body.details), 'Expected validation details array');
      assert(res.body.details.some(d => d.includes('title')), 'Should mention title');
    });

    // 7. POST /api/tasks (title too short)
    await runTest('POST /api/tasks with title < 3 chars returns 400 Bad Request', async () => {
      const invalidPayload = {
        title: 'Hi',
        description: 'Title is too short',
        status: 'pending'
      };
      const res = await request('POST', '/api/tasks', invalidPayload);
      assert(res.status === 400, `Expected 400, got ${res.status}`);
      assert(res.body.success === false, 'Expected success: false');
      assert(res.body.details.some(d => d.includes('at least 3 characters')), 'Should state min length');
    });

    // 8. POST /api/tasks (invalid status value)
    await runTest('POST /api/tasks with invalid status returns 400 Bad Request', async () => {
      const invalidPayload = {
        title: 'Valid Title Here',
        description: 'Valid Description Here',
        status: 'not-a-valid-status'
      };
      const res = await request('POST', '/api/tasks', invalidPayload);
      assert(res.status === 400, `Expected 400, got ${res.status}`);
      assert(res.body.success === false, 'Expected success: false');
      assert(res.body.details.some(d => d.includes('must be one of')), 'Should specify valid statuses');
    });

    // 9. PUT /api/tasks/:id (update task)
    await runTest('PUT /api/tasks/:id updates task and returns 200', async () => {
      assert(createdTaskId !== null, 'createdTaskId must exist');
      const updatePayload = {
        status: 'completed'
      };
      const res = await request('PUT', `/api/tasks/${createdTaskId}`, updatePayload);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.body.data.status === 'completed', 'Status should be updated to completed');
    });

    // 10. DELETE /api/tasks/:id
    await runTest('DELETE /api/tasks/:id removes task and returns 200', async () => {
      assert(createdTaskId !== null, 'createdTaskId must exist');
      const res = await request('DELETE', `/api/tasks/${createdTaskId}`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.body.success === true, 'Expected success: true');

      // Verify it no longer exists
      const verifyRes = await request('GET', `/api/tasks/${createdTaskId}`);
      assert(verifyRes.status === 404, 'Deleted task must now return 404');
    });

    // 11. Catch-all 404
    await runTest('GET /api/unknown-endpoint returns 404 Not Found', async () => {
      const res = await request('GET', '/api/unknown-route-test');
      assert(res.status === 404, `Expected 404, got ${res.status}`);
      assert(res.body.success === false, 'Expected success: false');
    });

  } finally {
    server.close();
    console.log('\n====================================================');
    console.log(`📊 Test Summary: ${passedCount} passed, ${failedCount} failed`);
    console.log('====================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    }
  }
}

main();
