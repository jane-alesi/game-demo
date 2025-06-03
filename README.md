# 🏝️ Treasure Island Dizzy - HTML5 Canvas Game Demo

A modern recreation of the classic Treasure Island Dizzy game, built with HTML5 Canvas and featuring enhanced graphics, procedural audio, and smooth animations.

## 🎮 Play the Game

**Live Demo**: [https://jane-alesi.github.io/game-demo/](https://jane-alesi.github.io/game-demo/)

## ✨ Features

### 🎨 Enhanced Graphics
- **Animated Player Character**: Egg-shaped hero with blinking eyes, walking animation, and directional facing
- **Dynamic Environment**: Parallax clouds, swaying palm trees, animated waves
- **Visual Effects**: Particle systems for jump dust and treasure collection sparkles
- **Detailed Art**: Gradient backgrounds, textured treasures, and atmospheric lighting

### 🎵 Audio System
- **Background Music**: Procedural adventure-themed melody using Web Audio API
- **Sound Effects**: Jump, collection, footstep, and victory fanfare sounds
- **Audio Controls**: Toggle music and sound effects independently
- **Browser Compatible**: Fallback support for different audio contexts

### 🎯 Gameplay Features
- **Multiple Treasure Types**: Coins (100pts), Gems (200pts), Crowns (300pts)
- **Platform Mechanics**: Jump on elevated platforms to reach special treasures
- **Physics Engine**: Realistic gravity, collision detection, and movement physics
- **Win Condition**: Collect all treasures to complete the level
- **Score System**: Real-time score tracking with treasure counter

### 🎭 Visual Effects
- **Particle System**: Dynamic particles for jumps and treasure collection
- **Smooth Animations**: 60fps animations with interpolated movement
- **Glow Effects**: Floating treasures with animated glow and bobbing motion
- **Environmental Details**: Rocks, treasure chests, and detailed palm trees

## 🕹️ Controls

- **←/→ Arrow Keys**: Move left/right
- **↑ Arrow Key**: Jump
- **Audio Buttons**: Toggle music and sound effects

## 🚀 Getting Started

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jane-alesi/game-demo.git
   cd game-demo
   ```

2. **Serve locally** (required for audio to work):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**: Navigate to `http://localhost:8000`

### Direct Play
Simply open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).

## 📁 Project Structure

```
game-demo/
├── index.html          # Main HTML file with game container
├── js/
│   └── game.js         # Complete game logic and engine
└── README.md           # This documentation
```

## 🛠️ Technical Details

### Technologies Used
- **HTML5 Canvas**: 2D graphics rendering
- **Web Audio API**: Procedural sound generation
- **Vanilla JavaScript**: No external dependencies
- **CSS3**: Responsive styling and layout

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- 📱 Mobile browsers (with touch controls)

### Performance Features
- Efficient particle system with automatic cleanup
- Optimized collision detection
- 60fps animations with requestAnimationFrame
- Memory-conscious audio management

## 🎮 Game Mechanics

### Player Movement
- **Walking**: Smooth acceleration and deceleration
- **Jumping**: Realistic gravity-based physics
- **Collision**: Ground and platform collision detection
- **Boundaries**: Screen edge constraints

### Treasure System
- **Collection Radius**: Proximity-based treasure pickup
- **Visual Feedback**: Particle effects and score updates
- **Audio Feedback**: Distinct collection sound for each treasure
- **Progress Tracking**: Real-time treasure counter

### Audio Features
- **Dynamic Music**: Looping adventure theme with note progression
- **Procedural SFX**: Generated using Web Audio oscillators
- **User Control**: Independent volume control for music and effects
- **Performance**: Efficient oscillator management and cleanup

## 🔧 Customization

### Adding New Treasures
```javascript
treasures.push({
  x: 500,                    // X position
  y: groundY - 25,          // Y position  
  type: 'newTreasure',      // Type identifier
  collected: false,         // Initial state
  value: 150               // Point value
});
```

### Modifying Music
```javascript
const musicSequence = [
  {note: 262, duration: 0.5}, // C4 for 0.5 beats
  {note: 294, duration: 1.0}, // D4 for 1.0 beats
  // Add more notes...
];
```

### Creating New Sound Effects
```javascript
sounds.newSound = createTone(frequency, duration, 'sine');
```

## 🐛 Known Issues

- Audio requires user interaction to start (browser security feature)
- Mobile touch controls not yet implemented
- No save system (scores reset on refresh)

## 🎯 Future Enhancements

- [ ] Mobile touch controls
- [ ] Multiple levels
- [ ] High score persistence
- [ ] More treasure types
- [ ] Enemy characters
- [ ] Power-ups and abilities

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
- Follow existing code style
- Test across multiple browsers
- Add comments for complex logic
- Ensure 60fps performance

## 🎉 Acknowledgments

- Inspired by the classic **Treasure Island Dizzy** by the Oliver Twins
- Built with modern web technologies for educational purposes
- Part of the Alesi AGI game development demo series

---

**Enjoy collecting treasures! 🏴‍☠️💰**