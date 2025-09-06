# Flappy Bird Clone
- Ashwanth Samuel (MBA 2026; asamuel@mba2026.hbs.edu)
- Bolt URL: https://polished-flappy-bird-6evb.bolt.host
- GitHub Repo URL: https://github.com/ashwanth-eth/cs1060-ashwanth.eth-hw1
- Netlify Deployment URL: https://endearing-biscotti-a67fc7.netlify.app/
- Project Background: I completed most of this task during the first session of COMPSCI 1060. The first prompt got me 80% of the way there and I added some refinements to adjust the settings of the game. I think vibe-coding a Flappy Bird type game was so easy for Bolt because it is a familiar game and many people have likely tried to build a similar game in the past. All-in-all, it probably took me ~30 minutes to complete this project from start to deployment. Netlify made it super easy to connect my GitHub repo and then deploy the code I had already written. I imagine this will not always be the case for more complex projects, but for this basic application it worked well. 



A polished HTML5 Canvas implementation of Flappy Bird with modern web technologies.

## Features

- **Smooth 60 FPS gameplay** with delta-time physics
- **Progressive difficulty** - pipe gaps get smaller as score increases
- **Object pooling** for optimal performance (no garbage collection hitches)
- **Responsive design** - works on desktop and mobile devices
- **Procedural audio** - all sound effects generated in-browser
- **Particle effects** - flap bursts, scoring effects, and collision explosions
- **Camera shake** on collisions for enhanced game feel
- **Local storage** for persistent high scores and settings
- **Debug mode** with collision visualization and slow motion

## Controls

### Desktop
- **Space / ↑ / W / Click**: Flap
- **P**: Pause/Resume
- **D**: Toggle debug mode (shows hitboxes, enables slow motion)

### Mobile
- **Tap anywhere**: Flap

### Control Buttons
- **Pause/Resume**: Toggle game pause
- **Mute/Unmute**: Toggle audio (setting is saved)
- **Debug**: Toggle collision visualization and slow motion
- **FPS**: Show/hide frame rate counter

## How to Run

### Development Server
```bash
npm install
npm run dev
```

### Simple Local Server
Open `index.html` in any modern browser, or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

## Game Mechanics

### Physics
- **Gravity**: 1800 px/s²
- **Flap impulse**: -420 px/s (upward)
- **Terminal velocity**: 900 px/s (downward)
- **Bird rotation**: tied to vertical velocity for realistic flight feel

### Difficulty Progression
- **Base pipe gap**: 160px
- **Minimum gap**: 120px
- **Gap reduction**: 1px per point scored (capped at 40 points)
- **Pipe spawn rate**: Every 1.25 seconds
- **Pipe speed**: 120 px/s

### Collision System
- **Bird collision**: Circle (12px radius)
- **Pipe collision**: AABB (Axis-Aligned Bounding Box)
- **Ground collision**: Y-position boundary check

## Tuning Guide

All game constants are located in their respective class files for easy tweaking:

### Bird Physics (`src/bird.js`)
```javascript
this.gravity = 1800;        // Downward acceleration
this.flapPower = -420;      // Upward impulse strength
this.terminalVelocity = 900; // Maximum fall speed
this.rotationSpeed = 3;     // How quickly bird rotates to match velocity
```

### Pipe System (`src/game.js`)
```javascript
this.pipeSpawnInterval = 1.25; // Seconds between pipe spawns
// In spawnPipe():
const baseGap = 160;           // Starting gap size
const minGap = 120;            // Minimum gap (difficulty cap)
const speed = 120;             // Pipe movement speed
```

### Visual Effects (`src/game.js`)
```javascript
this.shakeMagnitude = 15;      // Camera shake intensity on collision
this.shakeDecay = 0.9;         // How quickly shake fades
// Scrolling speeds:
this.groundOffset += 180 * deltaTime; // Ground scroll speed
this.bgOffset += 30 * deltaTime;      // Cloud parallax speed
```

### Audio (`src/audio.js`)
Procedural sound generation parameters can be adjusted in the `generateSounds()` method:
- **Flap**: Quick chirp (300-400 Hz, 0.1s)
- **Score**: Pleasant chime (500-1000 Hz, 0.3s)  
- **Hit**: Harsh noise burst (filtered white noise, 0.4s)

## Technical Details

### Performance Optimizations
- **Object pooling** for pipes and particles prevents garbage collection
- **Fixed timestep** with accumulator ensures consistent physics
- **Efficient collision detection** using spatial optimization
- **Canvas scaling** handles device pixel ratios properly

### Mobile Optimizations
- **Touch event handling** with proper preventDefault
- **Responsive canvas sizing** maintains aspect ratio
- **Optimized rendering** for mobile GPUs
- **Battery-friendly** frame rate management

### Browser Compatibility
- Modern browsers with ES2020+ support
- Canvas 2D context with proper fallbacks
- Web Audio API for sound (graceful degradation)
- Local Storage for persistence

## Project Structure

```
├── index.html          # Main HTML with embedded styles
├── src/
│   ├── main.js         # Entry point and game initialization
│   ├── game.js         # Main game loop and state management
│   ├── bird.js         # Bird physics and rendering
│   ├── pipe.js         # Pipe objects and pooling system
│   ├── particle.js     # Particle system for visual effects
│   ├── audio.js        # Procedural audio generation
│   ├── input.js        # Cross-platform input handling
│   ├── ui.js           # UI rendering and animations
│   └── collision.js    # Collision detection utilities
└── README.md
```

## License

MIT License - Feel free to use and modify for your own projects!
