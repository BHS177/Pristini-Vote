// Persistent vote storage system
// Works with file system (Railway, Heroku, localhost) and can be extended for databases

const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.join(__dirname, 'votes.json');

// Initialize storage file if it doesn't exist
function initStorage() {
  if (!fs.existsSync(STORAGE_FILE)) {
    const initialData = {
      votes: {
        'Zaghwen': 0,
        'Tborba': 0,
        'Dogga+dastour': 0,
        'Jandouba': 0
      },
      userVotes: []
    };
    saveToFile(initialData);
  }
}

// Save data to file
function saveToFile(data) {
  try {
    // Convert Map to array for JSON serialization
    const userVotesArray = [];
    if (data.userVotes instanceof Map) {
      data.userVotes.forEach((destination, name) => {
        userVotesArray.push({ name, destination });
      });
    } else if (Array.isArray(data.userVotes)) {
      userVotesArray.push(...data.userVotes);
    }
    
    const jsonData = {
      votes: data.votes,
      userVotes: userVotesArray,
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(jsonData, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving to file:', error);
    return false;
  }
}

// Load data from file
function loadFromFile() {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      initStorage();
    }
    
    const fileContent = fs.readFileSync(STORAGE_FILE, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Convert array back to Map
    const userVotesMap = new Map();
    if (Array.isArray(data.userVotes)) {
      data.userVotes.forEach(({ name, destination }) => {
        userVotesMap.set(name, destination);
      });
    }
    
    return {
      votes: data.votes || {
        'Zaghwen': 0,
        'Tborba': 0,
        'Dogga+dastour': 0,
        'Jandouba': 0
      },
      userVotes: userVotesMap
    };
  } catch (error) {
    console.error('Error loading from file:', error);
    // Return default if file is corrupted
    return {
      votes: {
        'Zaghwen': 0,
        'Tborba': 0,
        'Dogga+dastour': 0,
        'Jandouba': 0
      },
      userVotes: new Map()
    };
  }
}

// Recalculate votes from userVotes Map
function recalculateVotes(userVotesMap) {
  const votes = {
    'Zaghwen': 0,
    'Tborba': 0,
    'Dogga+dastour': 0,
    'Jandouba': 0
  };
  
  userVotesMap.forEach((destination) => {
    if (votes.hasOwnProperty(destination)) {
      votes[destination]++;
    }
  });
  
  return votes;
}

module.exports = {
  initStorage,
  saveToFile,
  loadFromFile,
  recalculateVotes,
  STORAGE_FILE
};

