// Vercel serverless function entry point
const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());

// Serve static files from public directory
// Use absolute path for Vercel
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath, {
  maxAge: '1d',
  etag: true
}));

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
  // Recalculate votes from userVotes Map to ensure consistency
  // This prevents issues with serverless cold starts
  const calculatedVotes = {
    'Zaghwen': 0,
    'Tborba': 0,
    'Dogga+dastour': 0,
    'Jandouba': 0
  };
  
  userVotes.forEach((destination) => {
    if (calculatedVotes.hasOwnProperty(destination)) {
      calculatedVotes[destination]++;
    }
  });
  
  // Update the votes object to keep it in sync
  votes = calculatedVotes;
  
  res.json(calculatedVotes);
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

// Serve static files explicitly
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/styles.css'), {
    headers: { 'Content-Type': 'text/css' }
  });
});

app.get('/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/app.js'), {
    headers: { 'Content-Type': 'application/javascript' }
  });
});

app.get('/pristini.jpeg', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pristini.jpeg'), {
    headers: { 'Content-Type': 'image/jpeg' }
  });
});

// Handle socket.io script (return empty or redirect)
app.get('/socket.io/socket.io.js', (req, res) => {
  // Socket.io not available on serverless, return empty
  res.status(404).send('// Socket.io not available on serverless - using polling');
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'), {
    headers: { 'Content-Type': 'text/html' }
  });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'), {
    headers: { 'Content-Type': 'text/html' }
  });
});

module.exports = app;

