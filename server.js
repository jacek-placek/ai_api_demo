// server.js
'use strict';

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory "database" (resets on restart)
let nextId = 3;
let users = [
  { id: 1, email: 'janet.weaver@example.com', first_name: 'Janet', last_name: 'Weaver', job: "QA Engineer" },
  { id: 2, email: 'emma.wong@example.com', first_name: 'Emma', last_name: 'Wong', job: "Product Owner" },
];

// Utility
function nowIso() {
  return new Date().toISOString();
}

// Health
app.get('/health', (req, res) => {
    // Simulate a 500 when explicitly requested
  if (req.query.fail === '500') {
    return res.status(500).json({
      error: 'Internal error (simulated)',
      time: new Date().toISOString(),
    });
  }

  res.status(200).json({ status: 'ok', time: nowIso() });
});

// List users (simple pagination)
app.get('/api/users', (req, res) => {
  const page = Number(req.query.page ?? 1);
  const per_page = Number(req.query.per_page ?? 2);

  if (!Number.isFinite(page) || page < 1 || !Number.isFinite(per_page) || per_page < 1) {
    return res.status(400).json({ error: 'Invalid pagination parameters' });
  }

  const start = (page - 1) * per_page;
  const data = users.slice(start, start + per_page);

  res.status(200).json({
    page,
    per_page,
    total: users.length,
    total_pages: Math.max(1, Math.ceil(users.length / per_page)),
    data,
    support: { url: 'https://example.com/support', text: 'Demo API for testing tooling' },
  });
});

//Get all users - unpaginated
app.get('/api/users/all', (_req, res) => {
  res.status(200).json({
    total: users.length,
    data: users,
  });
});

// Get single user
app.get('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) return res.status(404).json({ error: 'User not found' });

  res.status(200).json({
    data: user,
    support: { url: 'https://example.com/support', text: 'Demo API for testing tooling' },
  });
});

// Create user
app.post('/api/users', (req, res) => {
  const { name, job } = req.body ?? {};

  // Keep validation minimal but real
  if (typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Field "name" must be a string (min 2 chars)' });
  }
  if (typeof job !== 'string' || job.trim().length < 2) {
    return res.status(400).json({ error: 'Field "job" must be a string (min 2 chars)' });
  }

  const created = {
    id: nextId++,
    name: name.trim(),
    job: job.trim(),
    createdAt: nowIso(),
  };

  // Optional: also insert into "users" list for continuity
  users.push({
    id: created.id,
    email: `${created.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    first_name: created.name.split(' ')[0],
    last_name: created.name.split(' ').slice(1).join(' ') || 'User',
    job: created.job
  });

  res.status(201).json(created);
});

// Update user (PUT)
app.put('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, job } = req.body ?? {};

  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  // Allow partial-ish update but still validate provided fields
  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    return res.status(400).json({ error: 'If provided, "name" must be a string (min 2 chars)' });
  }
  if (job !== undefined && (typeof job !== 'string' || job.trim().length < 2)) {
    return res.status(400).json({ error: 'If provided, "job" must be a string (min 2 chars)' });
  }

  // For demo, we return reqres-like updatedAt
  res.status(200).json({
    name: name ?? '(unchanged)',
    job: job ?? '(unchanged)',
    updatedAt: nowIso(),
  });
});

// Delete user
// app.delete('/api/users/:id', (req, res) => {
//   const id = Number(req.params.id);
//   users = users.filter(u => u.id !== id);
//   res.status(204).send();
// });

// Delete user (ID in request body)
app.delete('/api/users', (req, res) => {
  const { id } = req.body ?? {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Field "id" must be an integer' });
  }

  const exists = users.some(u => u.id === id);
  if (!exists) {
    return res.status(404).json({ error: 'User not found' });
  }

  users = users.filter(u => u.id !== id);
  res.status(204).send();
});

// Login (success + failure)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email) return res.status(400).json({ error: 'Missing email' });
  if (!password) return res.status(400).json({ error: 'Missing password' });

  // Very simple rule for demo purposes
  if (email === 'eve.holt@reqres.in' && password === 'cityslicka') {
    return res.status(200).json({ token: 'demo-token-123' });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

// Global error handler (keeps output consistent)
app.use((err, _req, res, _next) => {
  res.status(500).json({ error: 'Internal error', detail: String(err?.message ?? err) });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Demo API listening on http://localhost:${port}`);
});
