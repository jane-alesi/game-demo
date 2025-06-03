/**
 * Enhanced Treasure Island Dizzy Game
 * Features: Advanced graphics, particles, animations, sound effects, and background music
 */

class TreasureIslandDizzy {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.WIDTH = this.canvas.width;
    this.HEIGHT = this.canvas.height;
    
    // Game state
    this.score = 0;
    this.gameTime = 0;
    this.particles = [];
    this.gameWon = false;
    
    // Player properties
    this.player = {
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
      direction: 1, // 1 for right, -1 for left
      stepTimer: 0
    };
    
    // Physics
    this.gravity = 0.6;
    this.groundY = 340;
    
    // Collectibles
    this.treasures = [
      { x: 200, y: this.groundY - 25, type: 'coin', collected: false, value: 100 },
      { x: 400, y: this.groundY - 25, type: 'gem', collected: false, value: 200 },
      { x: 600, y: this.groundY - 25, type: 'crown', collected: false, value: 300 },
      { x: 350, y: this.groundY - 80, type: 'coin', collected: false, value: 100 }, // elevated
    ];
    
    // Input
    this.keys = {};
    
    this.init();
  }
  
  init() {
    this.setupInput();
    this.gameLoop();
    
    // Resume audio context on first interaction
    document.addEventListener('click', () => {
      if (window.audioSystem) {
        window.audioSystem.resumeContext();
      }
    }, { once: true });
  }
  
  setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      
      // Resume audio context on first keypress
      if (window.audioSystem) {
        window.audioSystem.resumeContext();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  // Particle system for effects
  createParticle(x, y, color, vx = 0, vy = 0, life = 1.0, size = null) {
    this.particles.push({
      x, y, color, vx, vy,
      life,
      decay: 0.02,
      size: size || (Math.random() * 3 + 1)
    });
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity on particles
      p.life -= p.decay;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  drawParticles() {
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  // Enhanced background with parallax clouds
  drawBackground() {
    // Animated clouds
    const cloudOffset = (this.gameTime * 0.3) % 1000;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Cloud 1
    this.drawCloud(100 - cloudOffset * 0.5, 60);
    this.drawCloud(300 - cloudOffset * 0.3, 80);
    this.drawCloud(500 - cloudOffset * 0.4, 50);
    this.drawCloud(700 - cloudOffset * 0.2, 70);
    
    // Sea with waves
    this.ctx.save();
    this.ctx.fillStyle = '#1e90ff';
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.groundY + 40);
    for (let x = 0; x <= this.WIDTH; x += 10) {
      const waveHeight = Math.sin((x + this.gameTime * 2) * 0.02) * 3;
      this.ctx.lineTo(x, this.groundY + 40 + waveHeight);
    }
    this.ctx.lineTo(this.WIDTH, this.HEIGHT);
    this.ctx.lineTo(0, this.HEIGHT);
    this.ctx.fill();
    this.ctx.restore();

    // Island sand with texture
    const gradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.groundY + 40);
    gradient.addColorStop(0, '#f4d35e');
    gradient.addColorStop(1, '#e6c547');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, this.groundY, this.WIDTH, 40);

    // Detailed rocks
    this.ctx.fillStyle = '#444';
    for (let i = 0; i < this.WIDTH; i += 40) {
      this.drawRock(i + 20, this.groundY + 35, 15 + Math.sin(i) * 5);
    }

    // Enhanced palm trees
    const palmPositions = [150, 280, 450, 650];
    palmPositions.forEach((x, index) => {
      this.drawPalmTree(x, this.groundY, index);
    });

    // Treasure chest
    this.drawTreasureChest(80, this.groundY - 35);
    
    // Platform for elevated treasure
    this.ctx.fillStyle = '#8b4513';
    this.ctx.fillRect(320, this.groundY - 60, 60, 20);
    this.ctx.strokeStyle = '#654321';
    this.ctx.strokeRect(320, this.groundY - 60, 60, 20);
  }

  drawCloud(x, y) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, 20, 0, Math.PI * 2);
    this.ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    this.ctx.arc(x + 35, y - 15, 18, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawRock(x, y, size) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.scale(1, 0.6);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawPalmTree(x, groundY, index) {
    // Trunk with curves
    this.ctx.strokeStyle = '#8b5a2b';
    this.ctx.lineWidth = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(x, groundY);
    
    const sway = Math.sin(this.gameTime * 0.01 + index) * 5;
    this.ctx.quadraticCurveTo(x + sway, groundY - 40, x + sway * 1.5, groundY - 80);
    this.ctx.stroke();
    
    // Palm fronds
    this.ctx.fillStyle = '#228b22';
    this.ctx.strokeStyle = '#1a6b1a';
    this.ctx.lineWidth = 2;
    
    const frondPositions = [
      {angle: -Math.PI/3, length: 40},
      {angle: -Math.PI/6, length: 35},
      {angle: 0, length: 45},
      {angle: Math.PI/6, length: 38},
      {angle: Math.PI/3, length: 42}
    ];
    
    frondPositions.forEach(frond => {
      const endX = x + sway * 1.5 + Math.cos(frond.angle) * frond.length;
      const endY = groundY - 80 + Math.sin(frond.angle) * frond.length;
      
      this.ctx.beginPath();
      this.ctx.ellipse(
        x + sway * 1.5 + Math.cos(frond.angle) * frond.length * 0.7,
        groundY - 80 + Math.sin(frond.angle) * frond.length * 0.7,
        frond.length * 0.4, 8, frond.angle, 0, Math.PI * 2
      );
      this.ctx.fill();
      this.ctx.stroke();
    });
  }

  drawTreasureChest(x, y) {
    // Base
    const gradient = this.ctx.createLinearGradient(x, y, x, y + 25);
    gradient.addColorStop(0, '#cd853f');
    gradient.addColorStop(1, '#a0522d');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y + 5, 35, 20);
    
    // Lid
    this.ctx.fillStyle = '#b8860b';
    this.ctx.fillRect(x, y, 35, 10);
    
    // Lock
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillRect(x + 15, y + 8, 5, 8);
    
    // Metal bands
    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, 35, 25);
    this.ctx.strokeRect(x + 5, y + 5, 25, 15);
  }

  // Enhanced player drawing with animation
  drawPlayer() {
    const px = this.player.x;
    const py = this.player.y;
    
    this.ctx.save();
    this.ctx.translate(px + this.player.width/2, py + this.player.height/2);
    if (this.player.direction === -1) this.ctx.scale(-1, 1);
    
    // Shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, this.player.height/2 + 10, this.player.width/2, 5, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Body with gradient
    const bodyGradient = this.ctx.createRadialGradient(0, 0, 5, 0, 0, this.player.width/2);
    bodyGradient.addColorStop(0, '#ffffff');
    bodyGradient.addColorStop(1, '#f0f0f0');
    this.ctx.fillStyle = bodyGradient;
    
    // Bouncing effect
    const bounce = this.player.onGround ? 0 : Math.sin(this.gameTime * 0.2) * 2;
    this.ctx.beginPath();
    this.ctx.ellipse(0, bounce, this.player.width/2 - 2, this.player.height/2 - 2, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    
    // Eyes with blink animation
    const blink = (this.gameTime % 180 < 10) ? 0.3 : 1;
    this.ctx.fillStyle = '#000';
    this.ctx.beginPath();
    this.ctx.ellipse(-6, -8 + bounce, 3, 4 * blink, 0, 0, Math.PI * 2);
    this.ctx.ellipse(6, -8 + bounce, 3, 4 * blink, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Pupils
    if (blink > 0.5) {
      this.ctx.fillStyle = '#fff';
      this.ctx.beginPath();
      this.ctx.ellipse(-6, -9 + bounce, 1, 1, 0, 0, Math.PI * 2);
      this.ctx.ellipse(6, -9 + bounce, 1, 1, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Mouth
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    if (Math.abs(this.player.vx) > 0) {
      // Happy mouth when moving
      this.ctx.arc(0, 2 + bounce, 6, 0, Math.PI);
    } else {
      // Neutral mouth
      this.ctx.arc(0, 2 + bounce, 4, 0, Math.PI);
    }
    this.ctx.stroke();
    
    // Arms with animation
    const armSwing = Math.sin(this.gameTime * 0.3) * 0.3;
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    // Left arm
    this.ctx.moveTo(-this.player.width/2 + 5, 0);
    this.ctx.lineTo(-this.player.width/2 - 8, 8 + armSwing);
    // Right arm  
    this.ctx.moveTo(this.player.width/2 - 5, 0);
    this.ctx.lineTo(this.player.width/2 + 8, 8 - armSwing);
    this.ctx.stroke();
    
    // Legs with walking animation
    const legSwing = Math.abs(this.player.vx) > 0 ? Math.sin(this.gameTime * 0.4) * 8 : 0;
    this.ctx.beginPath();
    this.ctx.moveTo(-6, this.player.height/2 - 5);
    this.ctx.lineTo(-6 + legSwing, this.player.height/2 + 8);
    this.ctx.moveTo(6, this.player.height/2 - 5);
    this.ctx.lineTo(6 - legSwing, this.player.height/2 + 8);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  // Enhanced treasure drawing
  drawTreasures() {
    this.treasures.forEach((treasure, index) => {
      if (treasure.collected) return;
      
      const float = Math.sin(this.gameTime * 0.05 + index) * 3;
      const glow = Math.sin(this.gameTime * 0.1 + index) * 0.3 + 0.7;
      
      this.ctx.save();
      this.ctx.globalAlpha = glow;
      
      switch(treasure.type) {
        case 'coin':
          this.drawCoin(treasure.x, treasure.y + float);
          break;
        case 'gem':
          this.drawGem(treasure.x, treasure.y + float);
          break;
        case 'crown':
          this.drawCrown(treasure.x, treasure.y + float);
          break;
      }
      this.ctx.restore();
    });
  }

  drawCoin(x, y) {
    const gradient = this.ctx.createRadialGradient(x, y, 5, x, y, 12);
    gradient.addColorStop(0, '#ffd700');
    gradient.addColorStop(1, '#b8860b');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 12, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#8b7355';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Dollar sign
    this.ctx.fillStyle = '#8b7355';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('$', x, y + 5);
  }

  drawGem(x, y) {
    this.ctx.fillStyle = '#ff69b4';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 12);
    this.ctx.lineTo(x - 8, y - 4);
    this.ctx.lineTo(x - 5, y + 8);
    this.ctx.lineTo(x + 5, y + 8);
    this.ctx.lineTo(x + 8, y - 4);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.fillStyle = '#ff1493';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 12);
    this.ctx.lineTo(x - 3, y - 4);
    this.ctx.lineTo(x, y + 2);
    this.ctx.lineTo(x + 3, y - 4);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawCrown(x, y) {
    this.ctx.fillStyle = '#ffd700';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 12, y + 5);
    this.ctx.lineTo(x - 8, y - 8);
    this.ctx.lineTo(x - 4, y - 2);
    this.ctx.lineTo(x, y - 12);
    this.ctx.lineTo(x + 4, y - 2);
    this.ctx.lineTo(x + 8, y - 8);
    this.ctx.lineTo(x + 12, y + 5);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Jewels
    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(x, y - 8, 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#00ff00';
    this.ctx.beginPath();
    this.ctx.arc(x - 6, y - 4, 1.5, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#0000ff';
    this.ctx.beginPath();
    this.ctx.arc(x + 6, y - 4, 1.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // Game logic
  update() {
    this.gameTime++;
    
    // Player input
    const wasMoving = Math.abs(this.player.vx) > 0;
    
    if (this.keys['ArrowLeft']) {
      this.player.vx = -this.player.speed;
      this.player.direction = -1;
    } else if (this.keys['ArrowRight']) {
      this.player.vx = this.player.speed;
      this.player.direction = 1;
    } else {
      this.player.vx *= 0.8; // friction
    }
    
    // Step sound
    if (Math.abs(this.player.vx) > 0 && this.player.onGround) {
      this.player.stepTimer++;
      if (this.player.stepTimer > 20) {
        if (window.audioSystem) {
          window.audioSystem.playSound('step');
        }
        this.player.stepTimer = 0;
      }
    }

    if (this.keys['ArrowUp'] && this.player.onGround) {
      this.player.vy = -this.player.jumpPower;
      this.player.onGround = false;
      
      if (window.audioSystem) {
        window.audioSystem.playSound('jump');
      }
      
      // Jump particles
      for (let i = 0; i < 5; i++) {
        this.createParticle(
          this.player.x + this.player.width/2 + (Math.random() - 0.5) * this.player.width,
          this.player.y + this.player.height,
          '#f4d35e',
          (Math.random() - 0.5) * 4,
          Math.random() * -2
        );
      }
    }

    // Physics
    this.player.vy += this.gravity;
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Boundaries
    this.player.x = Math.max(0, Math.min(this.WIDTH - this.player.width, this.player.x));

    // Ground collision
    if (this.player.y + this.player.height >= this.groundY) {
      this.player.y = this.groundY - this.player.height;
      this.player.vy = 0;
      this.player.onGround = true;
    }
    
    // Platform collision (for elevated treasure)
    if (this.player.x + this.player.width > 320 && this.player.x < 380 && 
        this.player.y + this.player.height > this.groundY - 60 && this.player.y + this.player.height < this.groundY - 40 && 
        this.player.vy > 0) {
      this.player.y = this.groundY - 60 - this.player.height;
      this.player.vy = 0;
      this.player.onGround = true;
    }

    // Treasure collection
    this.treasures.forEach(treasure => {
      if (treasure.collected) return;
      
      const dx = treasure.x - (this.player.x + this.player.width/2);
      const dy = treasure.y - (this.player.y + this.player.height/2);
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      if (distance < 20) {
        treasure.collected = true;
        this.score += treasure.value;
        
        if (window.audioSystem) {
          window.audioSystem.playSound('collect');
        }
        
        // Collection particles
        for (let i = 0; i < 10; i++) {
          this.createParticle(
            treasure.x + (Math.random() - 0.5) * 20,
            treasure.y + (Math.random() - 0.5) * 20,
            '#ffd700',
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6
          );
        }
        
        // Check win condition
        const collected = this.treasures.filter(t => t.collected).length;
        if (collected === this.treasures.length && !this.gameWon) {
          this.gameWon = true;
          if (window.audioSystem) {
            window.audioSystem.playSound('win');
          }
          document.querySelector('.game-container').classList.add('win-glow');
        }
      }
    });
    
    this.updateParticles();
  }

  // Enhanced UI
  drawUI() {
    // Score panel
    this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
    this.ctx.fillRect(10, 10, 200, 60);
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(10, 10, 200, 60);
    
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 18px Courier New';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('SCORE: ' + this.score.toString().padStart(6, '0'), 20, 35);
    
    const collected = this.treasures.filter(t => t.collected).length;
    const total = this.treasures.length;
    this.ctx.font = '14px Courier New';
    this.ctx.fillText(`Treasures: ${collected}/${total}`, 20, 55);
    
    // Win condition
    if (this.gameWon) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
      this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
      
      this.ctx.fillStyle = '#ffd700';
      this.ctx.font = 'bold 48px Courier New';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('TREASURE FOUND!', this.WIDTH/2, this.HEIGHT/2 - 20);
      
      this.ctx.font = '24px Courier New';
      this.ctx.fillText('Final Score: ' + this.score, this.WIDTH/2, this.HEIGHT/2 + 20);
      
      this.ctx.font = '16px Courier New';
      this.ctx.fillText('Press R to restart', this.WIDTH/2, this.HEIGHT/2 + 50);
      this.ctx.restore();
      
      // Restart functionality
      if (this.keys['KeyR']) {
        this.restart();
      }
    }
  }
  
  restart() {
    this.score = 0;
    this.gameTime = 0;
    this.particles = [];
    this.gameWon = false;
    
    // Reset player
    this.player.x = 100;
    this.player.y = 280;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.onGround = false;
    this.player.direction = 1;
    this.player.stepTimer = 0;
    
    // Reset treasures
    this.treasures.forEach(treasure => {
      treasure.collected = false;
    });
    
    // Remove win glow
    document.querySelector('.game-container').classList.remove('win-glow');
  }

  // Main game loop
  gameLoop() {
    this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    
    this.drawBackground();
    this.drawTreasures();
    this.drawPlayer();
    this.drawParticles();
    this.drawUI();
    
    this.update();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
  new TreasureIslandDizzy();
});