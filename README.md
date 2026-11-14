# 🎓 Student Task Management API — DecodeLabs Project 2

A robust, production-ready RESTful Backend API built with **Node.js** and **Express.js** as part of the **DecodeLabs Internship Program (Project 2: Backend API Development)**.

Developed by: **Shikhar Srivastava**  
Repository: [https://github.com/srivastavaashikhar58-hash/decodelabs-project-2-backend-api](https://github.com/srivastavaashikhar58-hash/decodelabs-project-2-backend-api)  
Live GitHub Hosted Demonstration: [https://srivastavaashikhar58-hash.github.io/decodelabs-project-2-backend-api/](https://srivastavaashikhar58-hash.github.io/decodelabs-project-2-backend-api/)  
Live Cloud API (Render Blueprint): [https://decodelabs-project-2-backend-api.onrender.com](https://decodelabs-project-2-backend-api.onrender.com)

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Objectives & Core Concepts](#objectives--core-concepts)
3. [Technology Stack](#technology-stack)
4. [Architecture & Folder Structure](#architecture--folder-structure)
5. [Installation & Local Setup](#installation--local-setup)
6. [API Endpoint Documentation](#api-endpoint-documentation)
7. [Validation Rules & Error Handling](#validation-rules--error-handling)
8. [Automated Testing](#automated-testing)
9. [Deployment Guide (Render)](#deployment-guide-render)
10. [Data Persistence Limitations](#data-persistence-limitations)
11. [Mentor Interview Quick Reference](#mentor-interview-quick-reference)

---

## 1. Project Overview

The **Student Task Management API** demonstrates how a modern backend service receives, validates, processes, stores, and responds to HTTP client requests. It exposes standard REST endpoints for managing academic tasks (assignments, project milestones, study schedules) and serves an interactive web dashboard for real-time inspection.

---

## 2. Objectives & Core Concepts

- **RESTful Routing**: Clean separation of resources (`/api/tasks`, `/api/health`) using standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
- **Defensive Input Validation**: Validating request payloads before touching business logic, returning descriptive `400 Bad Request` responses on failures.
- **Appropriate HTTP Status Codes**:
  - `200 OK`: Request succeeded (retrieval, update, deletion).
  - `201 Created`: Resource successfully created via `POST`.
  - `400 Bad Request`: Payload validation failed (missing or invalid fields).
  - `404 Not Found`: Requested resource ID or route does not exist.
  - `500 Internal Server Error`: Unhandled server-side exceptions.
- **Middleware Chain**: Separation of concerns across logging (`requestLogger`), body parsing (`express.json`), static serving, and global error handling (`errorHandler`).
- **Automated Verification**: End-to-end integration test suite verifying 11 different success and failure scenarios.

---

## 3. Technology Stack

- **Runtime Environment**: Node.js (v18+)
- **Web Framework**: Express.js (v4.18+)
- **Libraries**:
  - `cors`: Cross-Origin Resource Sharing enablement
  - `dotenv`: Environment variable management
  - `uuid`: RFC4122 unique identifier generator
- **Testing**: Built-in Node.js HTTP testing framework (zero extra heavy dependencies)
- **Frontend Demonstration**: Semantic HTML5, Modern CSS3 (CSS Grid & Flexbox), Vanilla JavaScript (Fetch API)
- **Hosting Platform**: Render / Cloud Platform with automated Git deployment

---

## 4. Architecture & Folder Structure

```
decodelabs-project-2-backend-api/
├── src/
│   ├── controllers/
│   │   └── taskController.js   # Business logic (CRUD operations on data)
│   ├── middleware/
│   │   ├── errorHandler.js     # Global catch-all error handling middleware
│   │   ├── logger.js           # Request logging with timestamp and HTTP verb
│   │   └── validateTask.js     # Request payload validation middleware
│   ├── routes/
│   │   ├── healthRoutes.js     # Health check endpoint (/api/health)
│   │   └── taskRoutes.js       # Task REST endpoints (/api/tasks)
│   └── app.js                  # Express app setup and middleware configuration
├── public/
│   ├── index.html              # Interactive API testing dashboard
│   ├── style.css               # Clean dashboard UI styling
│   └── script.js               # Client-side API fetch client & response console
├── tests/
│   └── api.test.js             # Automated test suite (11 test cases)
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore rules for node_modules, logs, etc.
├── package.json                # Project dependencies and npm scripts
├── server.js                   # Application entry point (starts HTTP server)
└── README.md                   # Comprehensive documentation
```

### Why this structure?
- **Separation of Concerns (SoC)**: Routes only define URLs and methods; Controllers hold business logic; Middleware enforces cross-cutting concerns (validation, logging, error handling).
- **Testability**: `app.js` is exported without binding to a port, allowing the test suite in `tests/api.test.js` to spin it up dynamically on ephemeral ports without collisions.

---

## 5. Installation & Local Setup

### Prerequisites
- Node.js (version 18.0.0 or higher)
- npm (version 9.0.0 or higher)
- Git

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/srivastavaashikhar58-hash/decodelabs-project-2-backend-api.git
   cd decodelabs-project-2-backend-api
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   *(Defaults to `PORT=3000` and `NODE_ENV=development`)*

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Access the application:**
   - **Interactive Web Interface**: Open your browser at [http://localhost:3000](http://localhost:3000)
   - **Health API**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
   - **Tasks API**: [http://localhost:3000/api/tasks](http://localhost:3000/api/tasks)

---

## 6. API Endpoint Documentation

### Base URL
- Local: `http://localhost:3000/api`
- Production: `https://decodelabs-project-2-backend-api.onrender.com/api`

---

### 1. Server Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Verifies that the server is alive and operating normally.
- **Status Code**: `200 OK`
- **Response Example**:
  ```json
  {
    "success": true,
    "status": "healthy",
    "message": "Backend API is running smoothly",
    "timestamp": "2026-11-14T08:00:00.000Z",
    "uptime": "142.35 seconds",
    "environment": "development"
  }
  ```

---

### 2. Retrieve All Tasks
- **Endpoint**: `GET /api/tasks`
- **Description**: Returns an array of all current tasks.
- **Status Code**: `200 OK`
- **Response Example**:
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": "1",
        "title": "Learn Express.js",
        "description": "Study how to build REST APIs using Express.js framework",
        "status": "in-progress",
        "createdAt": "2026-11-14T07:55:00.000Z"
      },
      {
        "id": "2",
        "title": "Complete DecodeLabs Project 2",
        "description": "Build and deploy a Backend API project for the internship",
        "status": "pending",
        "createdAt": "2026-11-14T07:55:00.000Z"
      }
    ]
  }
  ```

---

### 3. Retrieve Single Task by ID
- **Endpoint**: `GET /api/tasks/:id`
- **Description**: Returns a specific task matching the supplied `:id`.
- **Status Code**: `200 OK` (or `404 Not Found` if missing)
- **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "1",
      "title": "Learn Express.js",
      "description": "Study how to build REST APIs using Express.js framework",
      "status": "in-progress",
      "createdAt": "2026-11-14T07:55:00.000Z"
    }
  }
  ```
- **Error Response Example (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "error": "Task with ID \"99\" not found"
  }
  ```

---

### 4. Create New Task
- **Endpoint**: `POST /api/tasks`
- **Description**: Creates and returns a newly added student task.
- **Headers**: `Content-Type: application/json`
- **Status Code**: `201 Created`
- **Request Body**:
  ```json
  {
    "title": "Prepare Presentation for DecodeLabs",
    "description": "Outline key architectural features and endpoint demonstrations",
    "status": "pending"
  }
  ```
- **Response Example (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "data": {
      "id": "b1e2c3d4-5678-90ab-cdef-1234567890ab",
      "title": "Prepare Presentation for DecodeLabs",
      "description": "Outline key architectural features and endpoint demonstrations",
      "status": "pending",
      "createdAt": "2026-11-14T08:05:00.000Z"
    }
  }
  ```

---

### 5. Update Task (Bonus)
- **Endpoint**: `PUT /api/tasks/:id`
- **Description**: Modifies fields on an existing task.
- **Status Code**: `200 OK`
- **Request Body**:
  ```json
  {
    "status": "completed"
  }
  ```
- **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Task updated successfully",
    "data": {
      "id": "1",
      "title": "Learn Express.js",
      "description": "Study how to build REST APIs using Express.js framework",
      "status": "completed",
      "updatedAt": "2026-11-14T08:10:00.000Z"
    }
  }
  ```

---

### 6. Delete Task (Bonus)
- **Endpoint**: `DELETE /api/tasks/:id`
- **Description**: Deletes a task by ID.
- **Status Code**: `200 OK`
- **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Task deleted successfully",
    "data": {
      "id": "1",
      "title": "Learn Express.js"
    }
  }
  ```

---

## 7. Validation Rules & Error Handling

All incoming `POST /api/tasks` requests are validated by `validateTask.js`:

| Field | Rule | Error Condition | Error Message |
|-------|------|-----------------|---------------|
| `title` | Required | Missing or null | `Field "title" is required.` |
| `title` | Type & Length | `< 3` or `> 100` chars | `"title" must be at least 3 characters long.` |
| `description` | Required | Missing or null | `Field "description" is required.` |
| `description` | Length | `> 500` chars | `"description" must be at most 500 characters long.` |
| `status` | Enum | Not `pending`, `in-progress`, `completed` | `"status" must be one of: pending, in-progress, completed.` |

### Sample Validation Failure (`400 Bad Request`):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "\"title\" must be at least 3 characters long.",
    "Field \"description\" is required.",
    "\"status\" must be one of: pending, in-progress, completed. Received: \"invalid-status\"."
  ]
}
```

---

## 8. Automated Testing

The project includes an automated test runner (`tests/api.test.js`) testing 11 distinct conditions:

Run tests locally with:
```bash
npm test
```

### Test Output:
```
====================================================
🧪 Starting Automated API Test Suite (DecodeLabs)
====================================================

Test server running at http://127.0.0.1:53758

[2026-11-14T08:02:11.951Z]  GET  /api/health
  ✅ PASS: GET /api/health returns 200 and healthy status
[2026-11-14T08:02:11.955Z]  GET  /api/tasks
  ✅ PASS: GET /api/tasks returns 200 and list of tasks
[2026-11-14T08:02:11.956Z]  GET  /api/tasks/1
  ✅ PASS: GET /api/tasks/1 returns 200 and specific task
[2026-11-14T08:02:11.957Z]  GET  /api/tasks/non-existent-999
  ✅ PASS: GET /api/tasks/non-existent returns 404 Not Found
[2026-11-14T08:02:11.961Z]  POST  /api/tasks
  ✅ PASS: POST /api/tasks with valid body returns 201 Created
[2026-11-14T08:02:11.962Z]  POST  /api/tasks
  ✅ PASS: POST /api/tasks without title returns 400 Bad Request
[2026-11-14T08:02:11.963Z]  POST  /api/tasks
  ✅ PASS: POST /api/tasks with title < 3 chars returns 400 Bad Request
[2026-11-14T08:02:11.963Z]  POST  /api/tasks
  ✅ PASS: POST /api/tasks with invalid status returns 400 Bad Request
[2026-11-14T08:02:11.964Z]  PUT  /api/tasks/:id
  ✅ PASS: PUT /api/tasks/:id updates task and returns 200
[2026-11-14T08:02:11.964Z]  DELETE  /api/tasks/:id
  ✅ PASS: DELETE /api/tasks/:id removes task and returns 200
[2026-11-14T08:02:11.965Z]  GET  /api/unknown-endpoint
  ✅ PASS: GET /api/unknown-endpoint returns 404 Not Found

====================================================
📊 Test Summary: 11 passed, 0 failed
====================================================
```

---

## 9. Deployment Guide (Render)

Deploying this Node.js app to **Render** takes 2 minutes:

1. Sign in to [Render](https://render.com) using your GitHub account.
2. Click **New +** → **Web Service**.
3. Connect your repository: `decodelabs-project-2-backend-api`.
4. Configure service settings:
   - **Name**: `decodelabs-project-2-backend-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. Click **Create Web Service**.
6. Render will automatically assign a public URL (e.g., `https://decodelabs-project-2-backend-api.onrender.com`).

---

## 10. Data Persistence Limitations

- **Storage Solution**: For this project, an **in-memory data structure** (JavaScript Array with UUIDs) is used in `src/controllers/taskController.js`.
- **Trade-off & Limitation**: In-memory storage is fast and zero-configuration, making it ideal for demonstration and unit testing. However, **data is not persisted across server restarts or deploys**.
- **Production Path**: In a real production system, this controller would interact with an Object Relational Mapper (such as Prisma or Mongoose) connected to PostgreSQL or MongoDB.

---

## 11. Mentor Interview Quick Reference

When presenting this project to your DecodeLabs mentors:
1. **Explain the Request Lifecycle**:
   - Client sends HTTP Request (`POST /api/tasks`).
   - `express.json()` parses body into `req.body`.
   - `requestLogger` logs the method and URL.
   - `validateTask` middleware inspects fields. If invalid, halts request and returns `400`.
   - `taskController.createTask` assigns UUID, creates record, and responds with `201 Created`.
2. **Explain Why Middleware Is Useful**:
   - Keeps business logic clean by handling security, logging, and input validation before the controller runs.
3. **Highlight Error Handling**:
   - Every route is protected by `errorHandler.js` preventing server crashes and ensuring the API always returns standard JSON responses.
