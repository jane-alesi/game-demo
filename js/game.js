// Treasure Island Dizzy - Main Game Logic
// Enhanced HTML5 Canvas Game with Music and Visual Effects

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Audio context and music system
let audioContext;
let sounds = {};
let musicEnabled = true;
let sfxEnabled = true;
let backgroundMusic = {
  oscillators: [],
  gainNodes: [],
  isPlaying: false
};

// Music configuration - Treasure Island theme
const musicSequence = [
  // Simple adventure melody
  {note: 262, duration: 0.5}, // C4
  {note: 294, duration: 0.5}, // D4
  {note: 330, duration: 0.5}, // E4
  {note: 349, duration: 0.5}, // F4
  {note: 392, duration: 1.0}, // G4
  {note: 349, duration: 0.5}, // F4
  {note: 330, duration: 0.5}, // E4
  {note: 294, duration: 1.0}, // D4
  
  {note: 330, duration: 0.5}, // E4
  {note: 349, duration: 0.5}, // F4
  {note: 392, duration: 0.5}, // G4
  {note: 440, duration: 0.5}, // A4
  {note: 392, duration: 1.0}, // G4
  {note: 349, duration: 0.5}, // F4
  {note: 330, duration: 0.5}, // E4
  {note: 262, duration: 1.5}, // C4
];

let musicIndex = 0;
let musicTimer = 0;
let currentNoteDuration = 0;

// Initialize audio system
function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    createSounds();
    if (musicEnabled) {
      startBackgroundMusic();
    }
  } catch (e) {
    console.log('Audio not supported');
  }
}

// Audio control buttons
document.getElementById('musicBtn').addEventListener('click', toggleMusic);
document.getElementById('sfxBtn').addEventListener('click', toggleSFX);

function toggleMusic() {
  musicEnabled = !musicEnabled;
  const btn = document.getElementById('musicBtn');
  btn.textContent = musicEnabled ? '🎵 Music: ON' : '🎵 Music: OFF';
  btn.classList.toggle('active', musicEnabled);
  
  if (musicEnabled && audioContext) {
    startBackgroundMusic();
  } else {
    stopBackgroundMusic();
  }
}

function toggleSFX() {
  sfxEnabled = !sfxEnabled;
  const btn = document.getElementById('sfxBtn');
  btn.textContent = sfxEnabled ? '🔊 SFX: ON' : '🔊 SFX: OFF';
  btn.classList.toggle('active', sfxEnabled);
}

// Background music system
function startBackgroundMusic() {
  if (!audioContext || !musicEnabled || backgroundMusic.isPlaying) return;
  
  backgroundMusic.isPlaying = true;
  musicIndex = 0;
  musicTimer = 0;
  playNextNote();
}

function stopBackgroundMusic() {
  backgroundMusic.isPlaying = false;
  // Stop all current oscillators
  backgroundMusic.oscillators.forEach(osc => {
    try { osc.stop(); } catch(e) {}
  });
  backgroundMusic.oscillators = [];
  backgroundMusic.gainNodes = [];
}

function playNextNote() {
  if (!backgroundMusic.isPlaying || !musicEnabled) return;
  
  const note = musicSequence[musicIndex];
  currentNoteDuration = note.duration * 60; // Convert to frames (assuming 60fps)
  
  // Create oscillator for the note
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Set note frequency and type
  oscillator.frequency.setValueAtTime(note.note, audioContext.currentTime);
  oscillator.type = 'triangle'; // Soft, musical tone
  
  // Set volume envelope
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.duration);
  
  // Start oscillator
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + note.duration);
  
  // Store references
  backgroundMusic.oscillators.push(oscillator);
  backgroundMusic.gainNodes.push(gainNode);
  
  // Clean up finished oscillators
  oscillator.onended = () => {
    const index = backgroundMusic.oscillators.indexOf(oscillator);
    if (index > -1) {
      backgroundMusic.oscillators.splice(index, 1);
      backgroundMusic.gainNodes.splice(index, 1);
    }
  };
  
  musicTimer = 0;
}

function updateBackgroundMusic() {
  if (!backgroundMusic.isPlaying || !musicEnabled) return;
  
  musicTimer++;
  if (musicTimer >= currentNoteDuration) {
    musicIndex = (musicIndex + 1) % musicSequence.length;
    playNextNote();
  }
}

// Create procedural sound effects
function createSounds() {
  sounds.jump = createTone(400, 100, 'sine');
  sounds.collect = createTone(800, 150, 'square');
  sounds.step = createTone(200, 50, 'sawtooth');
  sounds.win = createWinSound();
}

function createTone(frequency, duration, type = 'sine') {
  return () => {
    if (!audioContext || !sfxEnabled) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  };
}

function createWinSound() {
  return () => {
    if (!audioContext || !sfxEnabled) return;
    
    // Victory fanfare
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }, i * 100);
    });
  };
}

function playSound(soundName) {
  if (sounds[soundName]) {
    sounds[soundName]();
  }
}

// Game state
let score = 0;
let gameTime = 0;
let particles = [];
let gameWon = false;

// Player properties
const player = {
  x: 100,
  y: 280,
  width: 32,
  height: 44,
  vx: 0,
  vy: 0,
  speed: 4,
  jumpPower: 12,
  onGround: false,
  animFrame: 0,
  direction: 1,
  stepTimer: 0
};

// Physics
const gravity = 0.6;
const groundY = 340;

// Collectibles
const treasures = [
  { x: 200, y: groundY - 25, type: 'coin', collected: false, value: 100 },
  { x: 400, y: groundY - 25, type: 'gem', collected: false, value: 200 },
  { x: 600, y: groundY - 25, type: 'crown', collected: false, value: 300 },
  { x: 350, y: groundY - 80, type: 'coin', collected: false, value: 100 },
];

// Keyboard input
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  
  // Initialize audio on first interaction
  if (!audioContext) {
    initAudio();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Particle system for effects
function createParticle(x, y, color, vx = 0, vy = 0) {
  particles.push({
    x, y, color, vx, vy,
    life: 1.0,
    decay: 0.02,
    size: Math.random() * 3 + 1
  });
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life -= p.decay;
    
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// Enhanced background with parallax effects
function drawBackground() {
  const cloudOffset = (gameTime * 0.3) % 1000;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  
  // Animated clouds
  drawCloud(100 - cloudOffset * 0.5, 60);
  drawCloud(300 - cloudOffset * 0.3, 80);
  drawCloud(500 - cloudOffset * 0.4, 50);
  drawCloud(700 - cloudOffset * 0.2, 70);
  
  // Sea with animated waves
  ctx.save();
  ctx.fillStyle = '#1e90ff';
  ctx.beginPath();
  ctx.moveTo(0, groundY + 40);
  for (let x = 0; x <= WIDTH; x += 10) {
    const waveHeight = Math.sin((x + gameTime * 2) * 0.02) * 3;
    ctx.lineTo(x, groundY + 40 + waveHeight);
  }
  ctx.lineTo(WIDTH, HEIGHT);
  ctx.lineTo(0, HEIGHT);
  ctx.fill();
  ctx.restore();

  // Island sand with gradient texture
  const gradient = ctx.createLinearGradient(0, groundY, 0, groundY + 40);
  gradient.addColorStop(0, '#f4d35e');
  gradient.addColorStop(1, '#e6c547');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, groundY, WIDTH, 40);

  // Detailed rocks
  ctx.fillStyle = '#444';
  for (let i = 0; i < WIDTH; i += 40) {
    drawRock(i + 20, groundY + 35, 15 + Math.sin(i) * 5);
  }

  // Enhanced animated palm trees
  const palmPositions = [150, 280, 450, 650];
  palmPositions.forEach((x, index) => {
    drawPalmTree(x, groundY, index);
  });

  // Treasure chest
  drawTreasureChest(80, groundY - 35);
  
  // Elevated platform
  ctx.fillStyle = '#8b4513';
  ctx.fillRect(320, groundY - 60, 60, 20);
  ctx.strokeStyle = '#654321';
  ctx.strokeRect(320, groundY - 60, 60, 20);
}

function drawCloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
  ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
  ctx.arc(x + 35, y - 15, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawRock(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, 0.6);
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPalmTree(x, groundY, index) {
  // Animated trunk with sway
  ctx.strokeStyle = '#8b5a2b';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  
  const sway = Math.sin(gameTime * 0.01 + index) * 5;
  ctx.quadraticCurveTo(x + sway, groundY - 40, x + sway * 1.5, groundY - 80);
  ctx.stroke();
  
  // Detailed palm fronds
  ctx.fillStyle = '#228b22';
  ctx.strokeStyle = '#1a6b1a';
  ctx.lineWidth = 2;
  
  const frondPositions = [
    {angle: -Math.PI/3, length: 40},
    {angle: -Math.PI/6, length: 35},
    {angle: 0, length: 45},
    {angle: Math.PI/6, length: 38},
    {angle: Math.PI/3, length: 42}
  ];
  
  frondPositions.forEach(frond => {
    ctx.beginPath();
    ctx.ellipse(
      x + sway * 1.5 + Math.cos(frond.angle) * frond.length * 0.7,
      groundY - 80 + Math.sin(frond.angle) * frond.length * 0.7,
      frond.length * 0.4, 8, frond.angle, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.stroke();
  });
}

function drawTreasureChest(x, y) {
  // Base with gradient
  const gradient = ctx.createLinearGradient(x, y, x, y + 25);
  gradient.addColorStop(0, '#cd853f');
  gradient.addColorStop(1, '#a0522d');
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y + 5, 35, 20);
  
  // Lid
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(x, y, 35, 10);
  
  // Golden lock
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(x + 15, y + 8, 5, 8);
  
  // Metal bands
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, 35, 25);
  ctx.strokeRect(x + 5, y + 5, 25, 15);
}

// Enhanced animated player character
function drawPlayer() {
  const px = player.x;
  const py = player.y;
  
  ctx.save();
  ctx.translate(px + player.width/2, py + player.height/2);
  if (player.direction === -1) ctx.scale(-1, 1);
  
  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, player.height/2 + 10, player.width/2, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Body with radial gradient
  const bodyGradient = ctx.createRadialGradient(0, 0, 5, 0, 0, player.width/2);
  bodyGradient.addColorStop(0, '#ffffff');
  bodyGradient.addColorStop(1, '#f0f0f0');
  ctx.fillStyle = bodyGradient;
  
  // Bouncing animation
  const bounce = player.onGround ? 0 : Math.sin(gameTime * 0.2) * 2;
  ctx.beginPath();
  ctx.ellipse(0, bounce, player.width/2 - 2, player.height/2 - 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Animated eyes with blinking
  const blink = (gameTime % 180 < 10) ? 0.3 : 1;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(-6, -8 + bounce, 3, 4 * blink, 0, 0, Math.PI * 2);
  ctx.ellipse(6, -8 + bounce, 3, 4 * blink, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye highlights
  if (blink > 0.5) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-6, -9 + bounce, 1, 1, 0, 0, Math.PI * 2);
    ctx.ellipse(6, -9 + bounce, 1, 1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Animated mouth
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (Math.abs(player.vx) > 0) {
    // Happy mouth when moving
    ctx.arc(0, 2 + bounce, 6, 0, Math.PI);
  } else {
    // Neutral mouth
    ctx.arc(0, 2 + bounce, 4, 0, Math.PI);
  }
  ctx.stroke();
  
  // Animated arms
  const armSwing = Math.sin(gameTime * 0.3) * 0.3;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-player.width/2 + 5, 0);
  ctx.lineTo(-player.width/2 - 8, 8 + armSwing);
  ctx.moveTo(player.width/2 - 5, 0);
  ctx.lineTo(player.width/2 + 8, 8 - armSwing);
  ctx.stroke();
  
  // Animated legs with walking motion
  const legSwing = Math.abs(player.vx) > 0 ? Math.sin(gameTime * 0.4) * 8 : 0;
  ctx.beginPath();
  ctx.moveTo(-6, player.height/2 - 5);
  ctx.lineTo(-6 + legSwing, player.height/2 + 8);
  ctx.moveTo(6, player.height/2 - 5);
  ctx.lineTo(6 - legSwing, player.height/2 + 8);
  ctx.stroke();
  
  ctx.restore();
}

// Enhanced treasure rendering with glow effects
function drawTreasures() {
  treasures.forEach((treasure, index) => {
    if (treasure.collected) return;
    
    const float = Math.sin(gameTime * 0.05 + index) * 3;
    const glow = Math.sin(gameTime * 0.1 + index) * 0.3 + 0.7;
    
    ctx.save();
    ctx.globalAlpha = glow;
    
    switch(treasure.type) {
      case 'coin':
        drawCoin(treasure.x, treasure.y + float);
        break;
      case 'gem':
        drawGem(treasure.x, treasure.y + float);
        break;
      case 'crown':
        drawCrown(treasure.x, treasure.y + float);
        break;
    }
    ctx.restore();
  });
}

function drawCoin(x, y) {
  const gradient = ctx.createRadialGradient(x, y, 5, x, y, 12);
  gradient.addColorStop(0, '#ffd700');
  gradient.addColorStop(1, '#b8860b');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#8b7355';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = '#8b7355';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('$', x, y + 5);
}

function drawGem(x, y) {
  ctx.fillStyle = '#ff69b4';
  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x - 8, y - 4);
  ctx.lineTo(x - 5, y + 8);
  ctx.lineTo(x + 5, y + 8);
  ctx.lineTo(x + 8, y - 4);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = '#ff1493';
  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x - 3, y - 4);
  ctx.lineTo(x, y + 2);
  ctx.lineTo(x + 3, y - 4);
  ctx.closePath();
  ctx.fill();
}

function drawCrown(x, y) {
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 5);
  ctx.lineTo(x - 8, y - 8);
  ctx.lineTo(x - 4, y - 2);
  ctx.lineTo(x, y - 12);
  ctx.lineTo(x + 4, y - 2);
  ctx.lineTo(x + 8, y - 8);
  ctx.lineTo(x + 12, y + 5);
  ctx.closePath();
  ctx.fill();
  
  // Crown jewels
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(x, y - 8, 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#00ff00';
  ctx.beginPath();
  ctx.arc(x - 6, y - 4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#0000ff';
  ctx.beginPath();
  ctx.arc(x + 6, y - 4, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

// Main game update logic
function update() {
  gameTime++;
  
  // Update background music
  updateBackgroundMusic();
  
  // Player input handling
  if (keys['ArrowLeft']) {
    player.vx = -player.speed;
    player.direction = -1;
  } else if (keys['ArrowRight']) {
    player.vx = player.speed;
    player.direction = 1;
  } else {
    player.vx *= 0.8; // Friction
  }
  
  // Step sound effects
  if (Math.abs(player.vx) > 0 && player.onGround) {
    player.stepTimer++;
    if (player.stepTimer > 20) {
      playSound('step');
      player.stepTimer = 0;
    }
  }

  // Jumping
  if (keys['ArrowUp'] && player.onGround) {
    player.vy = -player.jumpPower;
    player.onGround = false;
    playSound('jump');
    
    // Jump particle effects
    for (let i = 0; i < 5; i++) {
      createParticle(
        player.x + player.width/2 + (Math.random() - 0.5) * player.width,
        player.y + player.height,
        '#f4d35e',
        (Math.random() - 0.5) * 4,
        Math.random() * -2
      );
    }
  }

  // Physics simulation
  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  // Boundary constraints
  player.x = Math.max(0, Math.min(WIDTH - player.width, player.x));

  // Ground collision
  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.onGround = true;
  }
  
  // Platform collision (elevated treasure platform)
  if (player.x + player.width > 320 && player.x < 380 && 
      player.y + player.height > groundY - 60 && player.y + player.height < groundY - 40 && 
      player.vy > 0) {
    player.y = groundY - 60 - player.height;
    player.vy = 0;
    player.onGround = true;
  }

  // Treasure collection logic
  treasures.forEach(treasure => {
    if (treasure.collected) return;
    
    const dx = treasure.x - (player.x + player.width/2);
    const dy = treasure.y - (player.y + player.height/2);
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    if (distance < 20) {
      treasure.collected = true;
      score += treasure.value;
      playSound('collect');
      
      // Collection particle effects
      for (let i = 0; i < 10; i++) {
        createParticle(
          treasure.x + (Math.random() - 0.5) * 20,
          treasure.y + (Math.random() - 0.5) * 20,
          '#ffd700',
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6
        );
      }
    }
  });
  
  // Win condition check
  const collected = treasures.filter(t => t.collected).length;
  const total = treasures.length;
  if (collected === total && !gameWon) {
    gameWon = true;
    playSound('win');
    stopBackgroundMusic(); // Stop music when game is won
  }
  
  updateParticles();
}

// Enhanced UI with score and treasure counter
function drawUI() {
  // Main score panel
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(10, 10, 200, 80);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 200, 80);
  
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 18px Courier New';
  ctx.fillText('SCORE: ' + score.toString().padStart(6, '0'), 20, 35);
  
  const collected = treasures.filter(t => t.collected).length;
  const total = treasures.length;
  ctx.font = '14px Courier New';
  ctx.fillText(`Treasures: ${collected}/${total}`, 20, 55);
  
  // Audio status indicators
  ctx.font = '10px Courier New';
  ctx.fillStyle = musicEnabled ? '#0a84ff' : '#666';
  ctx.fillText('♪ Music', 20, 75);
  ctx.fillStyle = sfxEnabled ? '#0a84ff' : '#666';
  ctx.fillText('♫ SFX', 80, 75);
  
  // Win screen
  if (gameWon) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('TREASURE FOUND!', WIDTH/2, HEIGHT/2 - 20);
    
    ctx.font = '24px Courier New';
    ctx.fillText('Final Score: ' + score, WIDTH/2, HEIGHT/2 + 20);
    
    ctx.font = '16px Courier New';
    ctx.fillText('Refresh to play again', WIDTH/2, HEIGHT/2 + 50);
    ctx.restore();
  }
}

// Main game loop
function gameLoop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  
  drawBackground();
  drawTreasures();
  drawPlayer();
  drawParticles();
  drawUI();
  
  update();
  requestAnimationFrame(gameLoop);
}

// Initialize audio controls and start the game
document.getElementById('musicBtn').classList.add('active');
document.getElementById('sfxBtn').classList.add('active');

// Start the game
gameLoop();