# 🎨 Color Path - Puzzle Game

A strategic color-switching puzzle game built with vanilla HTML, CSS, and JavaScript. Navigate through grid-based levels without stepping on tiles that match your current color!

![Game Preview](https://img.shields.io/badge/Status-Complete-success)
![Vanilla JS](https://img.shields.io/badge/Tech-Vanilla%20JS-yellow)
![HTML5](https://img.shields.io/badge/HTML-5-orange)
![CSS3](https://img.shields.io/badge/CSS-3-blue)

## 🎮 Game Overview

**Color Path** is a 2D top-down puzzle game where strategy is key. You control a colored character navigating through a dangerous grid filled with colored tiles, pits, and obstacles. The catch? **Step on a tile matching your color and you die!**

### Core Mechanics

- **Lethal Color Rule**: Never step on ground that matches your current color
- **Color Switching**: Use special color change tiles (marked with ⚡) to switch colors
- **Strategic Planning**: Plan your path carefully to avoid death and reach the goal
- **Time Challenge**: Complete levels as fast as possible to top the leaderboard

## 🚀 Quick Start

### Running the Game Locally

1. **Download the files** or clone this repository
2. **Place all files** in the same directory:
   - `index.html`
   - `style.css`
   - `main.js`
3. **Open `index.html`** in any modern web browser
4. **Start playing!** No build process, no dependencies, just pure browser gaming

```bash
# Simple way to run
cd /path/to/game/directory
open index.html  # macOS
# or
start index.html  # Windows
# or
xdg-open index.html  # Linux
```

### Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## 🎯 How to Play

### Game Rules

1. **Objective**: Navigate from the start (🏠) to the goal (🏁)
2. **Death Conditions**:
   - Stepping on a tile that matches your current color
   - Falling into pits (black tiles)
3. **Color Changers**: Step on ⚡ tiles to change your color
4. **Strategy**: Plan your path and color changes carefully

### Controls

| Key | Action |
|-----|--------|
| **Arrow Keys** or **WASD** | Move up/down/left/right |
| **R** | Restart current level |

### Tile Legend

| Visual | Type | Description |
|--------|------|-------------|
| 🏠 Green | Start | Your spawn point |
| 🏁 Green | Goal | Reach this to win |
| ⚡ Colored | Color Changer | Changes your color |
| Red/Blue/Yellow | Colored Ground | Death if matches your color |
| Gray | Neutral Ground | Safe for all colors |
| Dark Gray | Obstacle | Impassable wall |
| Black | Pit | Fall to your death |

### Scoring

- **Only metric**: Completion time (lower is better)
- **Leaderboard**: Top 10 fastest times saved locally
- **Personal Bests**: Beat your own records!

## 📁 Project Structure

```
color-path-game/
│
├── index.html          # Main HTML structure
│   ├── Welcome screen with game instructions
│   ├── Game screen with canvas and UI
│   └── Success screen with results
│
├── style.css           # All styling and animations
│   ├── Responsive design
│   ├── Screen transitions
│   └── Leaderboard styling
│
└── main.js             # Complete game logic (fully commented)
    ├── Game Controller
    ├── Level Manager
    ├── Player System
    ├── Renderer (Canvas)
    ├── Input Handler
    ├── Timer System
    └── Leaderboard System (localStorage)
```

## 🛠️ Technical Architecture

### Modular Design

The game is built with a clean, modular architecture:

```javascript
Game (Main Controller)
├── LevelManager - Handles level loading and tile queries
├── Player - Manages player state and position
├── Renderer - Canvas drawing operations
├── InputHandler - Keyboard input processing
├── TimerSystem - Game timing and display
└── LeaderboardSystem - localStorage high scores
```

### Key Technologies

- **HTML5 Canvas** - For smooth 2D rendering
- **LocalStorage API** - Persistent leaderboard data
- **RequestAnimationFrame** - Efficient game loop
- **CSS Grid & Flexbox** - Responsive layouts
- **Vanilla JavaScript** - No frameworks, no dependencies

## 🎨 Customization Guide

### Adjusting Tile Size

Change the `TILE_SIZE` constant in `main.js`:

```javascript
const TILE_SIZE = 50; // Pixels per tile (default: 50)
```

### Adding New Colors

1. Add to `COLORS` object:
```javascript
const COLORS = {
    RED: 'red',
    BLUE: 'blue',
    YELLOW: 'yellow',
    GREEN: 'green', // New color
    NEUTRAL: 'neutral'
};
```

2. Add visual representation:
```javascript
const COLOR_VALUES = {
    red: '#e74c3c',
    blue: '#3498db',
    yellow: '#f1c40f',
    green: '#2ecc71', // New color
    neutral: '#95a5a6'
};
```

3. Add tile shorthand to `parseTile()` function:
```javascript
if (tileStr === 'G') {
    return { type: TILE_TYPES.GROUND, color: COLORS.GREEN };
}
```

## 📝 Creating New Levels

### Step-by-Step Level Creation

#### 1. Define Your Level Object

```javascript
const LEVEL_2 = {
    name: "Level 2: The Maze",
    width: 12,              // Grid width
    height: 10,             // Grid height
    startPos: { x: 1, y: 5 },  // Starting position
    goalPos: { x: 10, y: 5 },  // Goal position

    grid: [
        // Define your grid here...
    ]
};
```

#### 2. Design Your Grid

Use these shorthand codes:

| Code | Meaning | Code | Meaning |
|------|---------|------|---------|
| `'S'` | Start | `'G'` | Goal |
| `'O'` | Obstacle | `'E'` | Empty (pit) |
| `'N'` | Neutral ground | `'R'` | Red ground |
| `'B'` | Blue ground | `'Y'` | Yellow ground |
| `'CR'` | Red color changer | `'CB'` | Blue color changer |
| `'CY'` | Yellow color changer | | |

Example grid (5x5):

```javascript
grid: [
    ['O', 'O', 'O', 'O', 'O'],
    ['O', 'S', 'N', 'CB', 'O'],
    ['O', 'R', 'R', 'B', 'O'],
    ['O', 'N', 'CR', 'G', 'O'],
    ['O', 'O', 'O', 'O', 'O']
]
```

#### 3. Add to LEVELS Array

```javascript
const LEVELS = [LEVEL_1, LEVEL_2];  // Add your new level
```

That's it! The game will automatically recognize the new level.

### Level Design Tips

✅ **Good Level Design**:
- Force multiple color changes
- Create interesting decision points
- Balance difficulty gradually
- Ensure there's a solution path
- Test thoroughly!

❌ **Avoid**:
- Impossible puzzles
- Trivial straight paths
- Too many dead ends
- Unclear visual design

## 🔄 Implementing Level Progression

Currently, the game loops on Level 1. To add level progression:

### 1. Modify Success Screen (index.html)

Add a "Next Level" button:

```html
<div class="success-actions">
    <button id="nextLevelButton" class="btn-primary">Next Level</button>
    <button id="playAgainButton" class="btn-secondary">Replay Level</button>
</div>
```

### 2. Update Game Logic (main.js)

In the `levelCompleted()` method:

```javascript
levelCompleted() {
    this.isPlaying = false;
    const completionTime = this.timer.stop();

    // Add score to leaderboard
    const rank = this.leaderboard.addScore(this.playerName, completionTime);

    // Check if there's a next level
    const hasNext = this.levelManager.hasNextLevel();

    // Show success screen with appropriate buttons
    this.showSuccessScreen(completionTime, rank, hasNext);
}
```

### 3. Add Next Level Handler

In `setupUI()` method:

```javascript
document.getElementById('nextLevelButton').addEventListener('click', () => {
    if (this.levelManager.goToNextLevel()) {
        this.restartGame();
    } else {
        alert('You completed all levels! 🎉');
    }
});
```

The `LevelManager` class already has all the methods you need:
- `hasNextLevel()` - Check if more levels exist
- `goToNextLevel()` - Advance to next level

## 🎮 Advanced Features to Add

### Ideas for Enhancement

1. **Multiple Lives System**
   - Add `lives` property to Player class
   - Decrement on death instead of instant restart
   - Show lives in UI

2. **Power-ups**
   - Invincibility tile (ignore color rule temporarily)
   - Speed boost
   - Teleporters

3. **Moving Obstacles**
   - Add `update()` method to obstacles
   - Call in `gameLoop()`
   - Implement patrol patterns

4. **Level Editor**
   - Visual grid editor
   - Export level JSON
   - Import custom levels

5. **Sound Effects**
   - Use Web Audio API
   - Add death sound, success sound, color change sound
   - Background music

6. **Achievements**
   - Complete all levels
   - Speed run achievements
   - No-death runs

## 💾 Data Storage

### Leaderboard Data Format

Stored in `localStorage` with key `colorPathHighScores`:

```json
[
    {
        "name": "Alice",
        "time": 12.34,
        "date": "2025-01-15T10:30:00.000Z"
    },
    {
        "name": "Bob",
        "time": 15.67,
        "date": "2025-01-15T11:00:00.000Z"
    }
]
```

### Clearing Saved Data

Open browser console and run:

```javascript
localStorage.removeItem('colorPathHighScores');
```

Or call programmatically:

```javascript
game.leaderboard.clearScores();
```

## 🐛 Troubleshooting

The game now includes **extensive console logging** and error handling to help identify issues quickly!

### Quick Debugging Steps

1. **Open Browser Developer Tools** (F12 or Ctrl+Shift+I)
2. **Go to the Console tab**
3. **Look for colored messages** - the game logs every major action
4. **Check for red error messages**

For detailed debugging instructions, see **[DEBUGGING.md](./DEBUGGING.md)**

### Common Issues

**Problem**: Game doesn't load
- **Solution**: Open browser console (F12) and look for error messages. Check that all three files (`index.html`, `style.css`, `main.js`) are in the same directory.
- **Debug**: Look for "Color Path: Script loaded" message in console

**Problem**: Leaderboard not saving
- **Solution**: Check if localStorage is enabled in your browser. Try incognito/private mode.

**Problem**: Canvas is blank
- **Solution**: Open console and check for "Canvas element found" message. Ensure JavaScript is enabled.

**Problem**: Controls not working
- **Solution**: Make sure you clicked "Start Game" first. Click on the game screen to focus it. Check console for "Game loop started" message.

**Problem**: Welcome screen doesn't appear
- **Solution**: Check if `style.css` is loading (Network tab in DevTools). Clear browser cache and reload (Ctrl+F5).

### Console Logging

The game now logs all major events:
- ✅ Script loading
- ✅ Game initialization
- ✅ DOM element checks
- ✅ Button clicks
- ✅ Game start process
- ✅ Player movements (when active)
- ✅ Level loading
- ✅ Errors with detailed messages

Example console output when working correctly:
```
Color Path: Script loaded
Game: Initializing...
Game: LevelManager created
Renderer initialized successfully
Game: Initialization complete!
```

### Test File

Run `test.html` in your browser to perform diagnostic tests on the game engine without needing the full UI.

## 📄 License

This project is released as open source for educational purposes. Feel free to use, modify, and distribute as you wish.

## 🤝 Contributing

This is a standalone educational project, but feel free to:
- Fork and create your own versions
- Add new levels and share them
- Implement new features
- Create tutorials or guides

## 👨‍💻 Developer Notes

### Code Style
- ES6+ JavaScript features
- Clear variable naming
- Comprehensive comments
- Modular class-based architecture

### Performance
- Single canvas rendering
- Efficient game loop with `requestAnimationFrame`
- No memory leaks (proper cleanup on restart)
- Optimized for 60 FPS

### Browser APIs Used
- Canvas API (2D rendering)
- LocalStorage API (data persistence)
- RequestAnimationFrame (game loop)
- Keyboard Events (input handling)
- Performance API (timing)

## 🎓 Learning Resources

This project demonstrates:
- **Game Development Basics**: Game loop, input handling, collision detection
- **Canvas API**: 2D graphics rendering
- **State Management**: Clean game state organization
- **Data Persistence**: Using localStorage
- **Modular JavaScript**: Class-based architecture
- **Responsive Design**: CSS Flexbox and Grid

Perfect for:
- Learning vanilla JavaScript game development
- Understanding game architecture patterns
- Practicing DOM manipulation
- Exploring canvas rendering

## 📞 Support

For issues or questions:
1. Check the code comments in `main.js`
2. Review this README
3. Inspect browser console for errors
4. Verify file structure is correct

---

**Have fun playing and creating levels!** 🎮🎨

Remember: The best way to learn is by experimenting. Try modifying the code, creating new levels, and adding your own features!
