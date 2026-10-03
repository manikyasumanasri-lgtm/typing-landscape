const canvas = document.getElementById('landscape');
const ctx = canvas.getContext('2d');
const typingArea = document.getElementById('typing-area');
const wpmDisplay = document.getElementById('wpm');
const promptText = document.getElementById('prompt-text');
const timeLeftDisplay = document.getElementById('time-left');

const sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "A journey of a thousand miles begins with a single step.",
    "To be or not to be, that is the question.",
    "All that glitters is not gold.",
    "Where there is a will, there is a way.",
    "Practice makes perfect.",
    "Actions speak louder than words.",
    "Beauty is in the eye of the beholder.",
    "Every cloud has a silver lining.",
    "Better late than never."
];

let currentSentence = "";
let timerInterval = null;
let timeLeft = 15;

function getRandomSentence() {
    currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
    if(promptText) promptText.innerText = currentSentence;
    timeLeft = 15;
    if(timeLeftDisplay) timeLeftDisplay.innerText = timeLeft;
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        if(timeLeftDisplay) timeLeftDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            typingArea.value = '';
            // Penalty for failing
            decayFactor = Math.max(0, decayFactor - 0.2);
            getRandomSentence();
        }
    }, 1000);
}

getRandomSentence();
const charsDisplay = document.getElementById('chars');
const levelDisplay = document.getElementById('level');
const resetBtn = document.getElementById('reset-btn');

let width, height;
let groundLevel;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    groundLevel = height * 0.7;
}

window.addEventListener('resize', resize);
resize();

let totalChars = 0;
let level = 0;
let currentWpm = 0;
let decayFactor = 1.0;
let lastTypeTime = Date.now();
let startTime = 0;
let typingHistory = [];

const MAX_DECAY = 0;
const DECAY_RATE = 0.005;

// Elements array
let elements = [];

class LandscapeElement {
    constructor(type, x, y, maxScale) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.maxScale = maxScale;
        this.currentScale = 0;
        this.active = true;
    }

    draw(ctx, decay) {
        let scale = this.currentScale * decay;
        if (scale <= 0) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);

        if (this.type === 'grass') {
            ctx.fillStyle = '#2ed573';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-5, -20);
            ctx.lineTo(5, -20);
            ctx.fill();
        } else if (this.type === 'tree') {
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(-5, -30, 10, 30);
            ctx.fillStyle = '#2ed573';
            ctx.beginPath();
            ctx.arc(0, -40, 20, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'house') {
            ctx.fillStyle = '#f1f2f6';
            ctx.fillRect(-20, -30, 40, 30);
            ctx.fillStyle = '#ff4757';
            ctx.beginPath();
            ctx.moveTo(-25, -30);
            ctx.lineTo(0, -50);
            ctx.lineTo(25, -30);
            ctx.fill();
        } else if (this.type === 'building') {
            ctx.fillStyle = '#a4b0be';
            ctx.fillRect(-20, -100, 40, 100);
            ctx.fillStyle = '#dfe4ea';
            for (let i=0; i<4; i++) {
                ctx.fillRect(-10, -90 + i*20, 8, 10);
                ctx.fillRect(2, -90 + i*20, 8, 10);
            }
        } else if (this.type === 'star') {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    update() {
        if (this.currentScale < this.maxScale) {
            this.currentScale += 0.05;
        }
    }
}

function updateStats() {
    const now = Date.now();
    typingHistory = typingHistory.filter(t => now - t < 5000);
    currentWpm = (typingHistory.length / 5) / (5 / 60); // rolling 5-sec window

    wpmDisplay.innerText = Math.round(currentWpm);
    charsDisplay.innerText = totalChars;

    // Async fetch level
    fetch('/api/stats', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({chars: totalChars, seconds: (now - startTime)/1000})
    })
    .then(r => r.json())
    .then(data => {
        level = data.level;
        levelDisplay.innerText = level;
    })
    .catch(() => {
        // Fallback local logic
        if (totalChars >= 1000) level = 5;
        else if (totalChars >= 600) level = 4;
        else if (totalChars >= 300) level = 3;
        else if (totalChars >= 150) level = 2;
        else if (totalChars >= 50) level = 1;
        else level = 0;
        levelDisplay.innerText = level;
    });

    spawnElements();
}

function spawnElements() {
    if (Math.random() > 0.3) return; // limit spawn rate
    let type = null;
    let y = groundLevel;
    let maxScale = 1.0 + Math.random() * 0.5;

    if (level >= 1 && Math.random() < 0.5) type = 'grass';
    if (level >= 2 && Math.random() < 0.4) type = 'tree';
    if (level >= 3 && Math.random() < 0.2) type = 'house';
    if (level >= 4 && Math.random() < 0.1) type = 'building';
    if (level >= 5 && Math.random() < 0.3) {
        type = 'star';
        y = Math.random() * (groundLevel - 50);
        maxScale = 0.5 + Math.random();
    }

    if (type) {
        let x = Math.random() * width;
        elements.push(new LandscapeElement(type, x, y, maxScale));
    }
}

typingArea.addEventListener('input', (e) => {
    if (startTime === 0) startTime = Date.now();
    lastTypeTime = Date.now();
    totalChars++;
    typingHistory.push(lastTypeTime);
    decayFactor = 1.0;
    updateStats();

    if (typingArea.value === currentSentence) {
        totalChars += 20; // Bonus points for completing in time
        typingArea.value = '';
        getRandomSentence();
    }
});

resetBtn.addEventListener('click', () => {
    totalChars = 0;
    level = 0;
    currentWpm = 0;
    typingHistory = [];
    startTime = 0;
    elements = [];
    decayFactor = 1.0;
    typingArea.value = '';
    updateStats();
});

function drawScene() {
    // Sky color based on level
    let skyColors = ['#87CEEB', '#87CEEB', '#FFB6C1', '#FF7F50', '#2C3E50', '#000000'];
    document.body.style.backgroundColor = skyColors[level] || skyColors[5];

    ctx.clearRect(0, 0, width, height);

    // Draw ground
    ctx.fillStyle = '#7bed9f';
    if (level >= 4) ctx.fillStyle = '#2f3542';
    ctx.fillRect(0, groundLevel, width, height - groundLevel);

    // Update decay
    if (Date.now() - lastTypeTime > 3000) {
        decayFactor = Math.max(MAX_DECAY, decayFactor - DECAY_RATE);
    }

    // Sort elements by y so closer elements are drawn last
    elements.sort((a, b) => a.y - b.y);

    elements.forEach(el => {
        el.update();
        el.draw(ctx, decayFactor);
    });

    requestAnimationFrame(drawScene);
}

drawScene();
