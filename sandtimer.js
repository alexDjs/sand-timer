let selectedDuration = 60; // Default 1 minute
let timeRemaining = selectedDuration;
let timer = null;
let isRunning = false;
let isPaused = false;
let isFullscreen = false;
let currentTheme = 'classic';

const display = document.getElementById('display');
const status = document.getElementById('status');
const sandTop = document.getElementById('sandTop');
const sandBottom = document.getElementById('sandBottom');
const hourglass = document.getElementById('hourglass');
const hourglassFull = document.getElementById('hourglassFull');

const displayFull = document.getElementById('displayFull');
const statusFull = document.getElementById('statusFull');
const sandTopFull = document.getElementById('sandTopFull');
const sandBottomFull = document.getElementById('sandBottomFull');
const fullscreenOverlay = document.getElementById('fullscreenOverlay');

const particles = [
    document.getElementById('particle1'),
    document.getElementById('particle2'),
    document.getElementById('particle3'),
    document.getElementById('particle4'),
    document.getElementById('particle5')
];

const particlesFull = [
    document.getElementById('particle1Full'),
    document.getElementById('particle2Full'),
    document.getElementById('particle3Full'),
    document.getElementById('particle4Full'),
    document.getElementById('particle5Full')
];

function showParticles() {
    particles.forEach(p => p.style.display = 'block');
    particlesFull.forEach(p => p.style.display = 'block');
}

function hideParticles() {
    particles.forEach(p => p.style.display = 'none');
    particlesFull.forEach(p => p.style.display = 'none');
}

function toggleFullscreen() {
    if (!isRunning && !isPaused) return; // Only allow in running or paused state
    
    isFullscreen = !isFullscreen;
    fullscreenOverlay.classList.toggle('active');
    
    if (isFullscreen) {
        syncFullscreenDisplay();
    }
}

function syncFullscreenDisplay() {
    displayFull.textContent = display.textContent;
    statusFull.textContent = status.textContent;
    statusFull.className = status.className;
}

function changeTheme(theme) {
    currentTheme = theme;
    
    // Update theme class on both hourglasses
    hourglass.className = `hourglass clickable theme-${theme}`;
    hourglassFull.className = `hourglass theme-${theme}`;
    
    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update particle colors to match theme
    updateParticleColors(theme);
}

function updateParticleColors(theme) {
    const colors = {
        'classic': '#FFD700',
        'glass': '#87CEEB',
        'wood': '#D2691E',
        'gold': '#FFA500',
        'neon': '#FF00FF',
        'ocean': '#1E90FF',
        'fire': '#FF8C00',
        'night': '#E8E8E8'
    };
    
    const color = colors[theme] || '#FFD700';
    
    particles.forEach(p => p.setAttribute('fill', color));
    particlesFull.forEach(p => p.setAttribute('fill', color));
}

function selectTimer(seconds) {
    if (isRunning) {
        stopTimer();
    }
    
    selectedDuration = seconds;
    timeRemaining = seconds;
    updateDisplay();
    
    // Highlight selected button
    document.querySelectorAll('.buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    status.textContent = 'Ready to start';
    status.className = 'status';
    resetSand();
}

function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const timeText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    display.textContent = timeText;
    displayFull.textContent = timeText;
    
    updateSand();
}

function updateSand() {
    const percentage = (timeRemaining / selectedDuration) * 100;
    
    // Calculate how much sand remains in top (0-100%)
    const topSandLevel = percentage / 100; // 1.0 (full) to 0.0 (empty)
    const bottomSandLevel = 1 - topSandLevel; // 0.0 (empty) to 1.0 (full)
    
    // Top sand parameters
    const topBottom = 65; // Bottom Y of top chamber
    const topTop = 15; // Top Y of top chamber
    const topMaxHeight = topBottom - topTop; // Max height = 50
    
    // Calculate top sand height (decreases as time passes)
    const topSandHeight = topMaxHeight * topSandLevel;
    const topSandY = topBottom - topSandHeight; // Y position where sand starts
    
    // Calculate top sand width at current level (trapezoid shape)
    const topLeftX = 25 + (topMaxHeight - topSandHeight) * 0.32; // Left edge
    const topRightX = 75 - (topMaxHeight - topSandHeight) * 0.32; // Right edge
    
    // Bottom sand parameters
    const bottomTop = 75; // Top of bottom chamber (neck)
    const bottomBottom = 125; // Bottom of bottom chamber
    const bottomMaxHeight = bottomBottom - bottomTop; // Max height = 50
    
    // Calculate bottom sand height (increases as time passes)
    const bottomSandHeight = bottomMaxHeight * bottomSandLevel;
    const bottomSandY = bottomBottom - bottomSandHeight; // Y position where sand top is
    
    // Bottom chamber is inverted trapezoid: narrow at top (42-58), wide at bottom (25-75)
    // Calculate bottom sand width at the TOP of the sand (changes as sand rises)
    // When bottomSandY = 125 (bottom), width should be 25-75 (full width)
    // When bottomSandY = 75 (neck), width should be 42-58 (narrow)
    const heightFromBottom = bottomBottom - bottomSandY; // How high the sand is
    const bottomTopLeftX = 25 + heightFromBottom * 0.34; // Left edge at sand top
    const bottomTopRightX = 75 - heightFromBottom * 0.34; // Right edge at sand top
    
    // Create paths with proper trapezoid shapes
    const topPath = `M ${topLeftX} ${topSandY} L ${topRightX} ${topSandY} L 58 65 L 42 65 Z`;
    const bottomPath = `M 25 ${bottomBottom} L 75 ${bottomBottom} L ${bottomTopRightX} ${bottomSandY} L ${bottomTopLeftX} ${bottomSandY} Z`;
    
    // Update top sand
    sandTop.setAttribute('d', topPath);
    sandTopFull.setAttribute('d', topPath);
    
    // Update bottom sand
    sandBottom.setAttribute('d', bottomPath);
    sandBottomFull.setAttribute('d', bottomPath);
}

function resetSand() {
    const resetTopPath = 'M 25 15 L 75 15 L 58 65 L 42 65 Z';
    const resetBottomPath = 'M 25 125 L 75 125 L 75 125 L 25 125 Z';
    
    sandTop.setAttribute('d', resetTopPath);
    sandTopFull.setAttribute('d', resetTopPath);
    sandBottom.setAttribute('d', resetBottomPath);
    sandBottomFull.setAttribute('d', resetBottomPath);
}

function startTimer() {
    if (isRunning && !isPaused) return;
    
    if (!isPaused) {
        timeRemaining = selectedDuration;
    }
    
    isRunning = true;
    isPaused = false;
    status.textContent = 'Running...';
    status.className = 'status running';
    statusFull.textContent = 'Running...';
    statusFull.className = 'status running';
    showParticles(); // Show falling sand
    
    timer = setInterval(() => {
        if (timeRemaining <= 0) {
            stopTimer();
            hideParticles();
            status.textContent = "⏰ Time's up!";
            status.className = 'status finished';
            statusFull.textContent = "⏰ Time's up!";
            statusFull.className = 'status finished';
            playAlert();
            return;
        }
        
        timeRemaining--;
        updateDisplay();
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    
    clearInterval(timer);
    isPaused = true;
    isRunning = false;
    status.textContent = 'Paused';
    status.className = 'status';
    statusFull.textContent = 'Paused';
    statusFull.className = 'status';
    hideParticles(); // Hide falling sand when paused
}

function resetTimer() {
    stopTimer();
    timeRemaining = selectedDuration;
    updateDisplay();
    status.textContent = 'Ready to start';
    status.className = 'status';
    statusFull.textContent = 'Ready to start';
    statusFull.className = 'status';
    resetSand();
    hideParticles();
    isFullscreen = false;
    fullscreenOverlay.classList.remove('active');
}

function stopTimer() {
    clearInterval(timer);
    isRunning = false;
    isPaused = false;
    hideParticles();
}

function playAlert() {
    // Browser alert sound (beep)
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+zO/aizsIHG/A7+OZQQ0PVqzn77BdGAU+ltryxnMpBSh7yu/ZizsHHG3A7+OZQQ0PVazn77BdGAU+ldryxnMpBSh7yu/ZizsHHG3A7+OZQQ0PVazn77BdGAU+ldryxnMpBSh7yu/ZizsHHG3A7+OZPw0PV63o8LJfGgZCm+P0y3ctBSyBzvLZizcIGWi77eeeTRAMUKfj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF607+uoVRQKRp/g8r5sIQUpfszt2Ys7CBxvwe/jmUENj1as5++wXRgFPpXa8sZzKQUoe8rv2Ys7BxxtQO/jmT8ND1et6PCyXxoGQpvj9Mt3LQUsgc7y2Ys3CBlou+3nnk0QDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC');
    audio.play().catch(() => {
        // Fallback if audio doesn't work
        alert("⏰ Time's up!");
    });
}

// Initialize
updateDisplay();
hideParticles();
