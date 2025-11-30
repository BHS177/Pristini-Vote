// Generate unique user ID (combines timestamp and random number)
const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Connect to Socket.io server
const socket = io();

// Store current votes
let currentVotes = {
    'Zaghwen': 0,
    'Tborba': 0,
    'Dogga+dastour': 0,
    'Jandouba': 0
};

// Store user's selected destination
let userSelection = null;

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
        <div class="vote-count" id="count-${destination}">0</div>
        <div class="vote-label">Votes</div>
        <div class="progress-bar-container">
            <div class="progress-bar" id="progress-${destination}" style="width: 0%"></div>
        </div>
    `;
    
    card.addEventListener('click', () => handleVote(destination, card));
    
    // Add hover sound effect (visual feedback)
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-15px) scale(1.03)';
    });
    
    return card;
}

// Handle vote submission
async function handleVote(destination, cardElement) {
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
                userId: userId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('✨ Vote submitted successfully!', 'success');
            // Add celebration effect
            addCelebrationEffect(cardElement);
        } else {
            showNotification('❌ Failed to submit vote. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error submitting vote:', error);
        showNotification('⚠️ Error connecting to server. Please try again.', 'error');
    }
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
function updateVotesDisplay(votes) {
    const destinations = Object.keys(votes);
    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    
    // Update each destination's vote count
    destinations.forEach(destination => {
        const countElement = document.getElementById(`count-${destination}`);
        const progressElement = document.getElementById(`progress-${destination}`);
        
        if (countElement && progressElement) {
            const newCount = votes[destination];
            const oldCount = parseInt(countElement.textContent) || 0;
            
            // Animate count change
            if (newCount !== oldCount) {
                countElement.classList.add('updating');
                animateCount(countElement, oldCount, newCount);
                
                // Add ripple effect to progress bar
                progressElement.style.animation = 'none';
                setTimeout(() => {
                    progressElement.style.animation = '';
                }, 10);
                
                setTimeout(() => {
                    countElement.classList.remove('updating');
                }, 600);
            }
            
            // Update progress bar with smooth animation
            const percentage = totalVotes > 0 ? (newCount / totalVotes) * 100 : 0;
            progressElement.style.width = `${percentage}%`;
        }
    });
    
    // Update total votes
    const totalVotesElement = document.getElementById('totalVotes');
    if (totalVotesElement) {
        const oldTotal = parseInt(totalVotesElement.textContent) || 0;
        if (totalVotes !== oldTotal) {
            animateCount(totalVotesElement, oldTotal, totalVotes);
        }
    }
    
    // Update current votes
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
socket.on('votesUpdated', (votes) => {
    updateVotesDisplay(votes);
});

// Add connection status indicator
socket.on('connect', () => {
    console.log('Connected to server');
    showNotification('🟢 Connected - Votes sync in real-time!', 'success');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    showNotification('🔴 Disconnected - Reconnecting...', 'error');
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initVoting();
    
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
