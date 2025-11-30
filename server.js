const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store votes in memory (in production, use a database)
const votes = {
  'Zaghwen': 0,
  'Tborba': 0,
  'Dogga+dastour': 0,
  'Jandouba': 0
};

// Store user votes to prevent double voting (using full name)
const userVotes = new Map(); // Maps normalizedName -> destination

// Normalize name to ensure consistent matching
// Handles: extra spaces, case differences, leading/trailing spaces
function normalizeName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return '';
  }
  // Trim, convert to lowercase, replace multiple spaces with single space
  return fullName.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the admin page for viewing vote results
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API endpoint to get current votes
app.get('/api/votes', (req, res) => {
  res.json(votes);
});

// API endpoint to get all voters with their votes (for admin)
app.get('/api/voters', (req, res) => {
  const votersList = [];
  userVotes.forEach((destination, normalizedName) => {
    votersList.push({
      name: normalizedName,
      destination: destination
    });
  });
  // Sort by destination, then by name
  votersList.sort((a, b) => {
    if (a.destination !== b.destination) {
      return a.destination.localeCompare(b.destination);
    }
    return a.name.localeCompare(b.name);
  });
  res.json({ voters: votersList, total: votersList.length });
});

// API endpoint to check if name has already voted
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

// API endpoint to submit a vote
app.post('/api/vote', (req, res) => {
  const { destination, fullName } = req.body;
  
  if (!destination || !['Zaghwen', 'Tborba', 'Dogga+dastour', 'Jandouba'].includes(destination)) {
    return res.status(400).json({ error: 'Invalid destination' });
  }

  if (!fullName || typeof fullName !== 'string') {
    return res.status(400).json({ error: 'Full name is required' });
  }

  // Normalize name to ensure consistent matching
  // This handles: "John  Smith" vs "John Smith", "JOHN SMITH" vs "john smith", etc.
  const normalizedName = normalizeName(fullName);

  if (normalizedName.length < 2) {
    return res.status(400).json({ error: 'Full name must be at least 2 characters' });
  }

  // Check if this name has already voted - only allow one vote per person
  // Each full name can only vote once, no matter how they enter it
  if (userVotes.has(normalizedName)) {
    return res.status(400).json({ success: false, error: 'already_voted' });
  }

  // New vote - one vote per person only
  // Store the normalized name to prevent duplicate votes
  votes[destination]++;
  userVotes.set(normalizedName, destination);
  
  console.log(`Vote recorded: ${normalizedName} voted for ${destination}`);

  // Broadcast updated votes to all connected clients
  io.emit('votesUpdated', votes);
  
  res.json({ success: true, votes });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send current votes to newly connected client
  socket.emit('votesUpdated', votes);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

