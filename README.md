# Pristini International School - Trip Voting System

A beautiful, real-time voting website for students to vote on their preferred trip destination.

## Features

- 🎨 Beautiful, modern UI with smooth animations
- ⚡ Real-time vote synchronization using WebSockets
- 📊 Live vote counts and progress bars
- 🎯 One vote per user (prevents double voting)
- 📱 Fully responsive design

## Destinations

Students can vote for one of four destinations:
- Zaghwen
- Tborba
- Dogga+dastour
- Jandouba

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## How It Works

- Each user gets a unique ID when they visit the page
- Users click on their preferred destination to vote
- Votes are instantly synchronized across all connected devices
- Vote counts update in real-time with smooth animations
- Progress bars show the percentage of votes for each destination

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Backend:** Node.js with Express
- **Real-time:** Socket.io for WebSocket communication
- **Styling:** Custom CSS with gradients and animations

## Notes

- Votes are stored in memory (will reset when server restarts)
- For production use, consider adding a database (MongoDB, PostgreSQL, etc.)
- The server runs on port 3000 by default (configurable via PORT environment variable)

