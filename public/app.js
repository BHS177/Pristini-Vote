// Connect to Socket.io server (only if Socket.io is available)
// For Vercel, we'll use polling instead
let socket = null;
try {
  socket = io();
} catch (e) {
  console.log('Socket.io not available, using polling');
  socket = null;
}

// Store user's full name
let userFullName = null;

// Store current votes
let currentVotes = {
    'Zaghwen': 0,
    'Tborba': 0,
    'Dogga+dastour': 0,
    'Jandouba': 0
};

// Store user's selected destination
let userSelection = null;
let hasVoted = false;

// Initialize the voting interface
function initVoting() {
    const destinations = ['Zaghwen', 'Tborba', 'Dogga+dastour', 'Jandouba'];
    const votingGrid = document.getElementById('votingGrid');
    
    destinations.forEach((destination, index) => {
        const card = createVoteCard(destination, index);
        votingGrid.appendChild(card);
    });
    
    // Load initial votes
    fetchVotes();
    
    // Add entrance animations
    addEntranceAnimations();
}

// Add entrance animations to elements
function addEntranceAnimations() {
    const cards = document.querySelectorAll('.vote-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${0.1 * (index + 1)}s`;
    });
}

// Create a vote card element
function createVoteCard(destination, index) {
    const card = document.createElement('div');
    card.className = 'vote-card';
    card.dataset.destination = destination;
    
    // Add travel emoji based on destination
    const emojis = ['🏛️', '🏔️', '🏛️', '🌲'];
    const emoji = emojis[index] || '📍';
    
    card.innerHTML = `
        <div class="destination-emoji" style="font-size: 3rem; margin-bottom: 15px; animation: emojiFloat 3s ease-in-out infinite; animation-delay: ${index * 0.2}s;">${emoji}</div>
        <div class="destination-name">${destination}</div>
    `;
    
    card.addEventListener('click', () => {
        if (!hasVoted) {
            handleVote(destination, card);
        }
        // Removed notification - cards are disabled after voting
    });
    
    // Add hover sound effect (visual feedback)
    card.addEventListener('mouseenter', () => {
        if (!hasVoted) {
            card.style.transform = 'translateY(-15px) scale(1.03)';
        }
    });
    
    return card;
}

// Handle vote submission
async function handleVote(destination, cardElement) {
    // Silently return if already voted (cards are disabled anyway)
    if (hasVoted) {
        return;
    }

    if (!userFullName) {
        showNotification('Please enter your name first', 'error');
        return;
    }
    
    // Add click animation
    cardElement.style.transform = 'scale(0.95)';
    setTimeout(() => {
        cardElement.style.transform = '';
    }, 150);
    
    // Remove previous selection
    if (userSelection) {
        const prevCard = document.querySelector(`[data-destination="${userSelection}"]`);
        if (prevCard) {
            prevCard.classList.remove('selected');
            // Add deselect animation
            prevCard.style.animation = 'cardEntrance 0.3s ease-out';
        }
    }
    
    // Add selection to clicked card
    cardElement.classList.add('selected');
    userSelection = destination;
    
    // Add selection animation
    cardElement.style.animation = 'selectedPulse 0.5s ease-out';
    
    try {
        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                destination: destination,
                fullName: userFullName
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            hasVoted = true;
            showNotification(`✅ Your vote for ${destination} has been confirmed!`, 'success');
            // Add celebration effect
            addCelebrationEffect(cardElement);
            // Disable all cards
            disableAllCards();
        } else if (data.error === 'already_voted') {
            hasVoted = true;
            showNotification('❌ This name has already voted!', 'error');
            disableAllCards();
        } else {
            showNotification('❌ Failed to submit vote. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error submitting vote:', error);
        showNotification('⚠️ Error connecting to server. Please try again.', 'error');
    }
}

// Disable all voting cards after voting
function disableAllCards() {
    const cards = document.querySelectorAll('.vote-card');
    cards.forEach(card => {
        card.style.opacity = '0.6';
        card.style.cursor = 'not-allowed';
        card.style.pointerEvents = 'none';
    });
}

// Add celebration effect when vote is submitted
function addCelebrationEffect(element) {
    const emojis = ['🎉', '✨', '🌟', '🎊'];
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const emoji = document.createElement('div');
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.position = 'absolute';
            emoji.style.left = '50%';
            emoji.style.top = '50%';
            emoji.style.fontSize = '2rem';
            emoji.style.pointerEvents = 'none';
            emoji.style.zIndex = '1000';
            emoji.style.transform = 'translate(-50%, -50%)';
            emoji.style.animation = `confetti 1s ease-out forwards`;
            element.appendChild(emoji);
            
            setTimeout(() => {
                emoji.remove();
            }, 1000);
        }, i * 50);
    }
}

// Add confetti animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti {
        0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) rotate(360deg) scale(0);
            opacity: 0;
        }
    }
    @keyframes emojiFloat {
        0%, 100% {
            transform: translateY(0) rotate(0deg);
        }
        50% {
            transform: translateY(-10px) rotate(5deg);
        }
    }
`;
document.head.appendChild(style);

// Fetch current votes from server
async function fetchVotes() {
    try {
        const response = await fetch('/api/votes');
        const votes = await response.json();
        updateVotesDisplay(votes);
    } catch (error) {
        console.error('Error fetching votes:', error);
    }
}

// Update the votes display
// Note: We don't display vote counts or progress bars to users
function updateVotesDisplay(votes) {
    // Votes are tracked on the server but not displayed to users
    // This prevents people from seeing how many votes each destination has
    currentVotes = votes;
}

// Animate number counting with enhanced easing
function animateCount(element, start, end) {
    const duration = 600;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Enhanced easing function for smoother animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOutCubic);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end;
        }
    }
    
    requestAnimationFrame(update);
}

// Show notification with enhanced animation
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Force reflow to restart animation
    void notification.offsetWidth;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Listen for real-time vote updates from server
if (socket) {
  socket.on('votesUpdated', (votes) => {
    updateVotesDisplay(votes);
  });
} else {
  // Fallback: Poll for updates every 1 second (for Vercel serverless)
  setInterval(() => {
    fetchVotes();
  }, 1000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Show name input modal first
    showNameModal();
    
    // Add parallax effect on scroll (for mobile)
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const header = document.querySelector('header');
        if (header) {
            header.style.transform = `translateY(${scrollTop * 0.3}px)`;
            header.style.opacity = 1 - (scrollTop / 300);
        }
        lastScrollTop = scrollTop;
    });
});

// Show name input modal
function showNameModal() {
    const modal = document.getElementById('nameModal');
    const nameInput = document.getElementById('fullNameInput');
    const submitBtn = document.getElementById('submitNameBtn');
    const nameError = document.getElementById('nameError');
    
    modal.style.display = 'flex';
    nameInput.focus();
    
    // Handle Enter key
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitName();
        }
    });
    
    // Handle submit button
    submitBtn.addEventListener('click', submitName);
    
    function submitName() {
        const name = nameInput.value.trim();
        
        if (!name || name.length < 2) {
            nameError.textContent = 'Please enter your full name (at least 2 characters)';
            nameError.style.display = 'block';
            return;
        }
        
        // Check if name has already voted
        fetch('/api/check-name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fullName: name })
        })
        .then(response => response.json())
        .then(data => {
            if (data.alreadyVoted) {
                nameError.textContent = 'This name has already voted!';
                nameError.style.display = 'block';
                // Don't set hasVoted = true here - let the server handle it
            } else {
                userFullName = name;
                hasVoted = false; // Reset to false when name is accepted
                modal.style.display = 'none';
                document.getElementById('mainContainer').style.display = 'block';
                initVoting();
            }
        })
        .catch(error => {
            console.error('Error checking name:', error);
            // Proceed anyway if check fails
            userFullName = name;
            modal.style.display = 'none';
            document.getElementById('mainContainer').style.display = 'block';
            initVoting();
        });
    }
}

// Add touch feedback for mobile
document.addEventListener('touchstart', (e) => {
    if (e.target.closest('.vote-card')) {
        e.target.closest('.vote-card').style.transform = 'scale(0.98)';
    }
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (e.target.closest('.vote-card')) {
        setTimeout(() => {
            e.target.closest('.vote-card').style.transform = '';
        }, 150);
    }
}, { passive: true });

// Prevent zoom on input focus (iOS Safari)
const nameInput = document.getElementById('fullNameInput');
if (nameInput) {
    nameInput.addEventListener('focus', () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport && window.innerWidth <= 768) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    });

    nameInput.addEventListener('blur', () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        }
    });
}

// Optimize for mobile viewport
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
