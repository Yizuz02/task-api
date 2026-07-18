'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000;

app.use(express.json());

// ---------------------------------------------------------------------------
// In-memory data store
// ---------------------------------------------------------------------------

let tasks = [];
let nextId = 1;

function getExampleTasks() {
  return [
    { id: 1, title: 'Learn Express.js', done: true },
    { id: 2, title: 'Build a To-do API', done: false },
    { id: 3, title: 'Document the API with Swagger', done: false }
  ];
}

function resetTasks() {
  tasks = getExampleTasks();
  nextId = tasks.length + 1;
}

// Seed data on startup
resetTasks();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findTaskIndex(id) {
  return tasks.findIndex((t) => t.id === id);
}

function parseBooleanQuery(value) {
  if (value === undefined) return { ok: true, value: undefined };
  if (value === 'true') return { ok: true, value: true };
  if (value === 'false') return { ok: true, value: false };
  return { ok: false, value: undefined };
}

// ---------------------------------------------------------------------------
// Swagger / OpenAPI docs
// ---------------------------------------------------------------------------

const openapiPath = path.join(__dirname, 'openapi.json');
const openapiDocument = JSON.parse(fs.readFileSync(openapiPath, 'utf-8'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Expose the raw spec too, handy for tooling
app.get('/openapi.json', (req, res) => {
  res.json(openapiDocument);
});

// ---------------------------------------------------------------------------
// System endpoints
// ---------------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Stats
app.get('/api/stats', (req, res) => {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pending = total - done;
  res.status(200).json({ total, done, pending });
});

// Reset to example tasks
app.post('/api/reset', (req, res) => {
  resetTasks();
  res.status(200).json(tasks);
});

// ---------------------------------------------------------------------------
// Task CRUD endpoints
// ---------------------------------------------------------------------------

// List all tasks (with optional filtering)
app.get('/api/tasks', (req, res) => {
  const { done, search } = req.query;

  const parsedDone = parseBooleanQuery(done);
  if (!parsedDone.ok) {
    return res.status(400).json({ error: "Query parameter 'done' must be 'true' or 'false'" });
  }

  let result = tasks;

  if (parsedDone.value !== undefined) {
    result = result.filter((t) => t.done === parsedDone.value);
  }

  if (typeof search === 'string' && search.trim() !== '') {
    const needle = search.toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(needle));
  }

  res.status(200).json(result);
});

// Get a single task by id
app.get('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Task id must be an integer' });
  }

  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(200).json(task);
});

// Create a new task
app.post('/api/tasks', (req, res) => {
  const { title } = req.body || {};

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: "'title' is required and must be a non-empty string" });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    done: false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update an existing task
app.put('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Task id must be an integer' });
  }

  const index = findTaskIndex(id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, done } = req.body || {};

  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: "Provide at least 'title' or 'done' to update" });
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: "'title' must be a non-empty string" });
    }
    tasks[index].title = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      return res.status(400).json({ error: "'done' must be a boolean" });
    }
    tasks[index].done = done;
  }

  res.status(200).json(tasks[index]);
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Task id must be an integer' });
  }

  const index = findTaskIndex(id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

// ---------------------------------------------------------------------------
// Fallback 404
// ---------------------------------------------------------------------------

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`To-do API listening on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});
