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

// Store user votes to prevent double voting (using IP + user agent as identifier)
const userVotes = new Map();

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get current votes
app.get('/api/votes', (req, res) => {
  res.json(votes);
});

// API endpoint to submit a vote
app.post('/api/vote', (req, res) => {
  const { destination, userId } = req.body;
  
  if (!destination || !['Zaghwen', 'Tborba', 'Dogga+dastour', 'Jandouba'].includes(destination)) {
    return res.status(400).json({ error: 'Invalid destination' });
  }

  // Check if user has already voted
  if (userVotes.has(userId)) {
    const previousVote = userVotes.get(userId);
    if (previousVote !== destination) {
      // User is changing their vote
      votes[previousVote]--;
      votes[destination]++;
      userVotes.set(userId, destination);
    }
    // If same vote, do nothing
  } else {
    // New vote
    votes[destination]++;
    userVotes.set(userId, destination);
  }

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

