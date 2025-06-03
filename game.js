// Enhanced Treasure Island Dizzy Game
// Enhanced graphics, sound effects, and background music

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.score = 0;
        this.gameWon = false;
        this.animationFrame = 0;
        
        // Audio system
        this.audioContext = null;
        this.musicGain = null;
        this.musicOscillator = null;
        this.musicStarted = false;
        
        // Player properties
        this.player = {
            x: 100,
            y: 220,
            width: 30,
            height: 40,
            vx: 0,
            vy: 0,
            speed: 3,
            jumpPower: 12,
            onGround: false,
            facing: 1, // 1 = right, -1 = left
            blinkTimer: 0,
            bounceOffset: 0,
            stepTimer: 0
        };
        
        // Physics
        this.gravity = 0.5;
        this.friction = 0.8;
        this.groundY = 260;
        
        // Treasures with different types and positions
        this.treasures = [
            { x: 200, y: this.groundY - 20, type: 'coin', value: 100, collected: false },
            { x: 400, y: this.groundY - 20, type: 'gem', value: 200, collected: false },
            { x: 500, y: this.groundY - 80, type: 'crown', value: 300, collected: false }, // On platform
        ];
        
        // Particle system
        this.particles = [];
        
        // Environmental elements
        this.clouds = [
            { x: 100, y: 50, size: 30, speed: 0.2 },
            { x: 300, y: 80, size: 40, speed: 0.15 },
            { x: 500, y: 40, size: 35, speed: 0.25 }
        ];
        
        this.palmTrees = [
            { x: 80, swayOffset: 0 },
            { x: 200, swayOffset: Math.PI },
            { x: 350, swayOffset: Math.PI/2 },
            { x: 480, swayOffset: Math.PI * 1.5 }
        ];
        
        // Input handling
        this.keys = { left: false, right: false, up: false };
        this.setupEventListeners();
        
        // Initialize audio
        this.initAudio();
        
        // Start game loop
        this.gameLoop();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.audioContext.createGain();
            this.musicGain.connect(this.audioContext.destination);
            this.musicGain.gain.value = 0.3;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    startMusic() {
        if (!this.audioContext || this.musicStarted) return;
        
        try {
            // Create a simple melody loop
            this.musicStarted = true;
            this.playMelodyLoop();
        } catch (e) {
            console.warn('Could not start music:', e);
        }
    }
    
    playMelodyLoop() {
        if (!this.audioContext) return;
        
        // Simple melody notes (frequencies in Hz)
        const melody = [262, 294, 330, 349, 392, 440, 494, 523]; // C major scale
        const pattern = [0, 2, 4, 2, 0, 4, 2, 0]; // Simple pattern
        
        let noteIndex = 0;
        
        const playNote = () => {
            if (!this.musicStarted) return;
            
            const freq = melody[pattern[noteIndex % pattern.length]];
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.musicGain);
            
            osc.frequency.value = freq;
            osc.type = 'triangle';
            
            gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.8);
            
            noteIndex++;
            setTimeout(playNote, 600); // Next note in 600ms
        };
        
        playNote();
    }
    
    playSound(frequency, type = 'sine', duration = 0.1, volume = 0.3) {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            // Silent fallback
        }
    }
    
    setupEventListeners() {
        // Click to start music (required by browsers)
        this.canvas.addEventListener('click', () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.startMusic();
        });
        
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft') {
                this.keys.left = true;
                this.player.facing = -1;
            }
            if (e.code === 'ArrowRight') {
                this.keys.right = true;
                this.player.facing = 1;
            }
            if (e.code === 'ArrowUp') this.keys.up = true;
            
            // Start music on any key press
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.startMusic();
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft') this.keys.left = false;
            if (e.code === 'ArrowRight') this.keys.right = false;
            if (e.code === 'ArrowUp') this.keys.up = false;
        });
    }
    
    update() {
        this.animationFrame++;
        
        if (this.gameWon) return;
        
        // Handle input
        this.player.vx *= this.friction;
        
        if (this.keys.left) {
            this.player.vx = -this.player.speed;
            this.player.stepTimer++;
        } else if (this.keys.right) {
            this.player.vx = this.player.speed;
            this.player.stepTimer++;
        }
        
        // Jump
        if (this.keys.up && this.player.onGround) {
            this.player.vy = -this.player.jumpPower;
            this.player.onGround = false;
            this.player.bounceOffset = 5;
            this.playSound(400, 'sine', 0.2, 0.4); // Jump sound
            
            // Jump particles
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    x: this.player.x + this.player.width / 2,
                    y: this.player.y + this.player.height,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * -2,
                    life: 30,
                    type: 'dust'
                });
            }
        }
        
        // Play step sound
        if (this.player.onGround && Math.abs(this.player.vx) > 0.1 && this.player.stepTimer % 20 === 0) {
            this.playSound(200, 'sawtooth', 0.05, 0.2);
        }
        
        // Apply gravity
        this.player.vy += this.gravity;
        
        // Update position
        this.player.x += this.player.vx;
        this.player.y += this.player.vy;
        
        // Bounce offset decay
        this.player.bounceOffset *= 0.9;
        
        // Boundary checks
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > this.width) {
            this.player.x = this.width - this.player.width;
        }
        
        // Ground collision
        if (this.player.y + this.player.height >= this.groundY) {
            this.player.y = this.groundY - this.player.height;
            this.player.vy = 0;
            this.player.onGround = true;
        }
        
        // Platform collision (for elevated treasure)
        const platformX = 480;
        const platformY = this.groundY - 60;
        const platformW = 60;
        const platformH = 20;
        
        if (this.player.x + this.player.width > platformX && 
            this.player.x < platformX + platformW && 
            this.player.y + this.player.height > platformY && 
            this.player.y + this.player.height < platformY + platformH + 10) {
            if (this.player.vy > 0) {
                this.player.y = platformY - this.player.height;
                this.player.vy = 0;
                this.player.onGround = true;
            }
        }
        
        // Treasure collection
        this.treasures.forEach(treasure => {
            if (treasure.collected) return;
            
            const dx = (this.player.x + this.player.width / 2) - treasure.x;
            const dy = (this.player.y + this.player.height / 2) - treasure.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 25) {
                treasure.collected = true;
                this.score += treasure.value;
                
                // Collection sound
                this.playSound(800, 'square', 0.3, 0.5);
                
                // Collection particles
                for (let i = 0; i < 10; i++) {
                    this.particles.push({
                        x: treasure.x,
                        y: treasure.y,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        life: 40,
                        type: 'sparkle'
                    });
                }
                
                // Check win condition
                if (this.treasures.every(t => t.collected)) {
                    this.gameWon = true;
                    this.playSound(1000, 'triangle', 1.0, 0.6); // Win sound
                }
            }
        });
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // Gravity on particles
            particle.life--;
            return particle.life > 0;
        });
        
        // Update environment
        this.clouds.forEach(cloud => {
            cloud.x += cloud.speed;
            if (cloud.x > this.width + cloud.size) {
                cloud.x = -cloud.size;
            }
        });
        
        // Update blink timer
        this.player.blinkTimer++;
        if (this.player.blinkTimer > 180) this.player.blinkTimer = 0;
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#e0f6ff');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
            this.ctx.arc(cloud.x - cloud.size * 0.5, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Sea with waves
        this.ctx.fillStyle = '#1e90ff';
        this.ctx.fillRect(0, this.groundY + 20, this.width, this.height - this.groundY - 20);
        
        // Animated waves
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        for (let x = 0; x < this.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.groundY + 25);
            this.ctx.quadraticCurveTo(
                x + 10, 
                this.groundY + 25 + Math.sin((x + this.animationFrame) * 0.1) * 3,
                x + 20, 
                this.groundY + 25
            );
            this.ctx.stroke();
        }
        
        // Island sand with gradient
        const sandGradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.groundY + 20);
        sandGradient.addColorStop(0, '#f4d35e');
        sandGradient.addColorStop(1, '#deb841');
        this.ctx.fillStyle = sandGradient;
        this.ctx.fillRect(0, this.groundY, this.width, 20);
        
        // Rocks
        this.ctx.fillStyle = '#555';
        for (let i = 0; i < this.width; i += 30) {
            const rockHeight = 8 + Math.sin(i * 0.1) * 4;
            this.ctx.beginPath();
            this.ctx.ellipse(i + 15, this.groundY + 20 + rockHeight / 2, 12, rockHeight / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Palm trees with animation
        this.palmTrees.forEach(tree => {
            const sway = Math.sin((this.animationFrame * 0.02) + tree.swayOffset) * 3;
            
            // Trunk
            this.ctx.fillStyle = '#8b5a2b';
            this.ctx.fillRect(tree.x + sway * 0.3, this.groundY - 80, 10, 80);
            
            // Leaves with sway
            this.ctx.fillStyle = '#228b22';
            for (let i = 0; i < 6; i++) {
                this.ctx.save();
                this.ctx.translate(tree.x + 5, this.groundY - 85);
                this.ctx.rotate((i * Math.PI / 3) + sway * 0.1);
                this.ctx.fillRect(-15, -5, 30, 10);
                this.ctx.restore();
            }
        });
        
        // Treasure chest
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(50, this.groundY - 25, 30, 20);
        this.ctx.fillStyle = '#daa520';
        this.ctx.fillRect(52, this.groundY - 23, 26, 3);
        this.ctx.fillRect(52, this.groundY - 15, 26, 3);
        this.ctx.fillRect(63, this.groundY - 20, 4, 8);
        
        // Platform for elevated treasure
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(480, this.groundY - 60, 60, 20);
        this.ctx.strokeStyle = '#654321';
        this.ctx.strokeRect(480, this.groundY - 60, 60, 20);
    }
    
    drawTreasures() {
        this.treasures.forEach(treasure => {
            if (treasure.collected) return;
            
            const glow = Math.sin(this.animationFrame * 0.1) * 0.3 + 0.7;
            const floatOffset = Math.sin(this.animationFrame * 0.05 + treasure.x * 0.01) * 3;
            
            this.ctx.save();
            this.ctx.globalAlpha = glow;
            
            if (treasure.type === 'coin') {
                // Gold coin
                this.ctx.fillStyle = 'gold';
                this.ctx.beginPath();
                this.ctx.arc(treasure.x, treasure.y + floatOffset, 12, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#b8860b';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Dollar sign
                this.ctx.fillStyle = '#8b7500';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('$', treasure.x, treasure.y + floatOffset + 5);
                
            } else if (treasure.type === 'gem') {
                // Sparkling gem
                this.ctx.fillStyle = '#ff69b4';
                this.ctx.save();
                this.ctx.translate(treasure.x, treasure.y + floatOffset);
                this.ctx.rotate(this.animationFrame * 0.05);
                this.ctx.fillRect(-8, -8, 16, 16);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(-4, -4, 8, 8);
                this.ctx.restore();
                
            } else if (treasure.type === 'crown') {
                // Royal crown
                this.ctx.fillStyle = 'gold';
                this.ctx.fillRect(treasure.x - 10, treasure.y + floatOffset, 20, 10);
                
                // Crown points
                for (let i = 0; i < 5; i++) {
                    const x = treasure.x - 8 + i * 4;
                    const height = i === 2 ? -8 : -5;
                    this.ctx.fillRect(x, treasure.y + floatOffset + height, 2, Math.abs(height));
                }
                
                // Jewels
                this.ctx.fillStyle = '#ff0000';
                this.ctx.beginPath();
                this.ctx.arc(treasure.x, treasure.y + floatOffset + 5, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
    }
    
    drawPlayer() {
        const px = this.player.x;
        const py = this.player.y - this.player.bounceOffset;
        const facing = this.player.facing;
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(px + this.player.width / 2, this.groundY, this.player.width / 2, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Body (egg shape)
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.ellipse(px + this.player.width / 2, py + this.player.height / 2, 
                        this.player.width / 2, this.player.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Eyes
        const blinking = this.player.blinkTimer > 170;
        this.ctx.fillStyle = '#000';
        
        if (!blinking) {
            // Normal eyes
            this.ctx.beginPath();
            this.ctx.ellipse(px + this.player.width / 2 - 6 * facing, py + this.player.height / 3, 3, 5, 0, 0, Math.PI * 2);
            this.ctx.ellipse(px + this.player.width / 2 + 2 * facing, py + this.player.height / 3, 3, 5, 0, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Blinking (lines)
            this.ctx.beginPath();
            this.ctx.moveTo(px + this.player.width / 2 - 9 * facing, py + this.player.height / 3);
            this.ctx.lineTo(px + this.player.width / 2 - 3 * facing, py + this.player.height / 3);
            this.ctx.moveTo(px + this.player.width / 2 - 1 * facing, py + this.player.height / 3);
            this.ctx.lineTo(px + this.player.width / 2 + 5 * facing, py + this.player.height / 3);
            this.ctx.stroke();
        }
        
        // Smile
        this.ctx.beginPath();
        this.ctx.arc(px + this.player.width / 2, py + this.player.height / 2 + 8, 8, 0, Math.PI);
        this.ctx.stroke();
        
        // Arms with animation
        const armSwing = Math.sin(this.animationFrame * 0.2) * (Math.abs(this.player.vx) > 0.1 ? 10 : 0);
        this.ctx.beginPath();
        this.ctx.moveTo(px + 5, py + this.player.height / 2);
        this.ctx.lineTo(px - 8, py + this.player.height / 2 + 8 + armSwing);
        this.ctx.moveTo(px + this.player.width - 5, py + this.player.height / 2);
        this.ctx.lineTo(px + this.player.width + 8, py + this.player.height / 2 + 8 - armSwing);
        this.ctx.stroke();
        
        // Legs with animation
        const legSwing = Math.sin(this.animationFrame * 0.3) * (Math.abs(this.player.vx) > 0.1 ? 8 : 0);
        this.ctx.beginPath();
        this.ctx.moveTo(px + 8, py + this.player.height - 2);
        this.ctx.lineTo(px + 8, py + this.player.height + 12 + legSwing);
        this.ctx.moveTo(px + this.player.width - 8, py + this.player.height - 2);
        this.ctx.lineTo(px + this.player.width - 8, py + this.player.height + 12 - legSwing);
        this.ctx.stroke();
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life / 40;
            
            if (particle.type === 'dust') {
                this.ctx.fillStyle = '#d2b48c';
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (particle.type === 'sparkle') {
                this.ctx.fillStyle = '#ffd700';
                this.ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
                this.ctx.fillRect(particle.x - 3, particle.y, 6, 1);
                this.ctx.fillRect(particle.x, particle.y - 3, 1, 6);
            }
            
            this.ctx.restore();
        });
    }
    
    drawUI() {
        // Score
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        
        // Treasure counter
        const collected = this.treasures.filter(t => t.collected).length;
        this.ctx.fillText(`Treasures: ${collected}/${this.treasures.length}`, 10, 55);
        
        // Instructions
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#333';
        this.ctx.fillText('Arrow keys to move, Click/Press key to start music', 10, this.height - 20);
        
        // Win screen
        if (this.gameWon) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = 'gold';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🏆 YOU WON! 🏆', this.width / 2, this.height / 2 - 30);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 20);
            
            this.ctx.font = '16px Arial';
            this.ctx.fillText('All treasures collected!', this.width / 2, this.height / 2 + 50);
            
            this.ctx.textAlign = 'start';
        }
    }
    
    gameLoop() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.update();
        this.drawBackground();
        this.drawTreasures();
        this.drawPlayer();
        this.drawParticles();
        this.drawUI();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});