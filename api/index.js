// Vercel serverless function entry point
const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Import shared vote storage (in production, use a database)
// For Vercel, we'll use a simple in-memory store (resets on cold start)
let votes = {
  'Zaghwen': 0,
  'Tborba': 0,
  'Dogga+dastour': 0,
  'Jandouba': 0
};

let userVotes = new Map();

function normalizeName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return '';
  }
  return fullName.trim().toLowerCase().replace(/\s+/g, ' ');
}

// API Routes
app.get('/api/votes', (req, res) => {
  res.json(votes);
});

app.get('/api/voters', (req, res) => {
  const votersList = [];
  userVotes.forEach((destination, normalizedName) => {
    votersList.push({
      name: normalizedName,
      destination: destination
    });
  });
  votersList.sort((a, b) => {
    if (a.destination !== b.destination) {
      return a.destination.localeCompare(b.destination);
    }
    return a.name.localeCompare(b.name);
  });
  res.json({ voters: votersList, total: votersList.length });
});

app.post('/api/check-name', (req, res) => {
  const { fullName } = req.body;
  
  if (!fullName) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const normalizedName = normalizeName(fullName);
  
  if (normalizedName.length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }

  const alreadyVoted = userVotes.has(normalizedName);
  res.json({ alreadyVoted });
});

app.post('/api/vote', (req, res) => {
  const { destination, fullName } = req.body;
  
  if (!destination || !['Zaghwen', 'Tborba', 'Dogga+dastour', 'Jandouba'].includes(destination)) {
    return res.status(400).json({ error: 'Invalid destination' });
  }

  if (!fullName || typeof fullName !== 'string') {
    return res.status(400).json({ error: 'Full name is required' });
  }

  const normalizedName = normalizeName(fullName);

  if (normalizedName.length < 2) {
    return res.status(400).json({ error: 'Full name must be at least 2 characters' });
  }

  if (userVotes.has(normalizedName)) {
    return res.status(400).json({ success: false, error: 'already_voted' });
  }

  votes[destination]++;
  userVotes.set(normalizedName, destination);
  
  res.json({ success: true, votes });
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

module.exports = app;

