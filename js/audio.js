/**
 * Enhanced Audio System for Treasure Island Dizzy
 * Includes background music and sound effects
 */

class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.sounds = {};
    this.musicNodes = {};
    this.backgroundMusic = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    
    this.init();
  }

  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.setupGainNodes();
      this.createSounds();
      this.createBackgroundMusic();
      this.setupControls();
    } catch (e) {
      console.warn('Audio not supported:', e);
    }
  }

  setupGainNodes() {
    // Master gain node
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.value = 0.7;

    // Music gain node
    this.musicGain = this.audioContext.createGain();
    this.musicGain.connect(this.masterGain);
    this.musicGain.gain.value = 0.3;

    // SFX gain node
    this.sfxGain = this.audioContext.createGain();
    this.sfxGain.connect(this.masterGain);
    this.sfxGain.gain.value = 0.5;
  }

  setupControls() {
    const musicBtn = document.getElementById('musicToggle');
    const sfxBtn = document.getElementById('sfxToggle');

    if (musicBtn) {
      musicBtn.addEventListener('click', () => this.toggleMusic());
    }

    if (sfxBtn) {
      sfxBtn.addEventListener('click', () => this.toggleSFX());
    }
  }

  createSounds() {
    // Jump sound - ascending tone
    this.sounds.jump = () => this.createTone(300, 150, 'sine', [
      { time: 0, frequency: 300, gain: 0.4 },
      { time: 0.05, frequency: 500, gain: 0.3 },
      { time: 0.1, frequency: 400, gain: 0.1 },
      { time: 0.15, frequency: 200, gain: 0 }
    ]);

    // Collect sound - happy chime
    this.sounds.collect = () => this.createTone(600, 200, 'square', [
      { time: 0, frequency: 600, gain: 0.3 },
      { time: 0.05, frequency: 800, gain: 0.4 },
      { time: 0.1, frequency: 1000, gain: 0.3 },
      { time: 0.15, frequency: 1200, gain: 0.1 },
      { time: 0.2, frequency: 1000, gain: 0 }
    ]);

    // Step sound - soft thud
    this.sounds.step = () => this.createTone(150, 80, 'square', [
      { time: 0, frequency: 150, gain: 0.1 },
      { time: 0.02, frequency: 120, gain: 0.15 },
      { time: 0.05, frequency: 100, gain: 0.05 },
      { time: 0.08, frequency: 80, gain: 0 }
    ]);

    // Win sound - triumphant fanfare
    this.sounds.win = () => this.createChord([523, 659, 784], 1000, 'triangle', [
      { time: 0, gain: 0.4 },
      { time: 0.2, gain: 0.5 },
      { time: 0.8, gain: 0.3 },
      { time: 1.0, gain: 0 }
    ]);
  }

  createTone(frequency, duration, type = 'sine', envelope = []) {
    if (!this.sfxEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain);
    
    oscillator.type = type;
    const startTime = this.audioContext.currentTime;
    
    if (envelope.length > 0) {
      // Apply frequency and gain envelope
      envelope.forEach(point => {
        const time = startTime + point.time;
        oscillator.frequency.setValueAtTime(point.frequency || frequency, time);
        gainNode.gain.setValueAtTime(point.gain, time);
      });
    } else {
      // Simple tone
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration / 1000);
    }
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration / 1000);
  }

  createChord(frequencies, duration, type = 'sine', envelope = []) {
    if (!this.sfxEnabled || !this.audioContext) return;

    frequencies.forEach(freq => {
      this.createTone(freq, duration, type, envelope.map(point => ({
        ...point,
        frequency: freq,
        gain: point.gain * 0.3 // Reduce individual note volume in chord
      })));
    });
  }

  createBackgroundMusic() {
    if (!this.audioContext) return;

    // Create a simple procedural pirate-themed melody
    const melodyNotes = [
      { note: 'C4', duration: 0.5 }, { note: 'G3', duration: 0.25 }, { note: 'C4', duration: 0.25 },
      { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 0.5 },
      { note: 'C4', duration: 0.75 }, { note: 'G3', duration: 0.25 },
      { note: 'A3', duration: 0.5 }, { note: 'G3', duration: 0.5 },
      
      { note: 'C4', duration: 0.5 }, { note: 'G3', duration: 0.25 }, { note: 'C4', duration: 0.25 },
      { note: 'E4', duration: 0.5 }, { note: 'F4', duration: 0.5 },
      { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 0.5 },
      { note: 'C4', duration: 1.0 }
    ];

    const bassNotes = [
      { note: 'C2', duration: 1.0 }, { note: 'G2', duration: 1.0 },
      { note: 'A2', duration: 1.0 }, { note: 'F2', duration: 1.0 },
      { note: 'C2', duration: 1.0 }, { note: 'G2', duration: 1.0 },
      { note: 'F2', duration: 1.0 }, { note: 'C2', duration: 1.0 }
    ];

    this.melodyNotes = melodyNotes;
    this.bassNotes = bassNotes;
    this.musicTempo = 120; // BPM
  }

  // Note frequency mapping
  getNoteFrequency(note) {
    const noteFreqs = {
      'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78,
      'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00,
      'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
      
      'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
      'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
      'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
      
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
      'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
      'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88
    };
    return noteFreqs[note] || 440;
  }

  playBackgroundMusic() {
    if (!this.musicEnabled || !this.audioContext || this.backgroundMusic) return;

    const beatDuration = 60 / this.musicTempo;
    let currentTime = this.audioContext.currentTime;
    
    // Create a repeating music loop
    const playMelody = () => {
      this.melodyNotes.forEach(noteData => {
        const freq = this.getNoteFrequency(noteData.note);
        const duration = noteData.duration * beatDuration;
        
        this.playMusicNote(freq, duration, currentTime, 'triangle', 0.1);
        currentTime += duration;
      });
    };

    const playBass = () => {
      let bassTime = this.audioContext.currentTime;
      this.bassNotes.forEach(noteData => {
        const freq = this.getNoteFrequency(noteData.note);
        const duration = noteData.duration * beatDuration * 2; // Bass plays slower
        
        this.playMusicNote(freq, duration, bassTime, 'sawtooth', 0.08);
        bassTime += duration;
      });
    };

    // Start the music
    playMelody();
    playBass();

    // Set up loop
    const loopDuration = this.melodyNotes.reduce((sum, note) => sum + note.duration, 0) * beatDuration;
    this.backgroundMusic = setInterval(() => {
      if (this.musicEnabled && this.audioContext) {
        currentTime = this.audioContext.currentTime;
        playMelody();
        playBass();
      }
    }, loopDuration * 1000);
  }

  playMusicNote(frequency, duration, startTime, type = 'triangle', volume = 0.1) {
    if (!this.audioContext || !this.musicEnabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.musicGain);
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, startTime + duration * 0.8);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      clearInterval(this.backgroundMusic);
      this.backgroundMusic = null;
    }
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    const btn = document.getElementById('musicToggle');
    
    if (this.musicEnabled) {
      btn.textContent = '🎵 Music: ON';
      btn.classList.add('active');
      this.playBackgroundMusic();
    } else {
      btn.textContent = '🎵 Music: OFF';
      btn.classList.remove('active');
      this.stopBackgroundMusic();
    }
  }

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    const btn = document.getElementById('sfxToggle');
    
    if (this.sfxEnabled) {
      btn.textContent = '🔊 SFX: ON';
      btn.classList.add('active');
    } else {
      btn.textContent = '🔊 SFX: OFF';
      btn.classList.remove('active');
    }
  }

  playSound(soundName) {
    if (this.sounds[soundName] && this.sfxEnabled) {
      this.sounds[soundName]();
    }
  }

  // Resume audio context on user interaction (required by browsers)
  resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        if (this.musicEnabled) {
          this.playBackgroundMusic();
        }
      });
    }
  }
}

// Global audio system instance
window.audioSystem = new AudioSystem();