# CLAUDE.md - AI Assistant Guide for Color Path Game

> **Purpose**: This document provides comprehensive guidance for AI assistants (like Claude) working with this codebase. It covers architecture, conventions, workflows, and best practices to ensure consistent, high-quality contributions.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Codebase Structure](#codebase-structure)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Development Workflows](#development-workflows)
5. [Key Conventions](#key-conventions)
6. [Common Tasks](#common-tasks)
7. [Testing Practices](#testing-practices)
8. [Git & Commit Guidelines](#git--commit-guidelines)
9. [Important Notes for AI Assistants](#important-notes-for-ai-assistants)

---

## Project Overview

**Color Path** is a strategic color-switching puzzle game built with **vanilla JavaScript, HTML5 Canvas, and CSS3**. No frameworks, no build process, no dependencies—just pure browser technology.

### Core Game Mechanics

- **Reverse Color Matching**: Players can ONLY step on tiles matching their current color or neutral tiles
- **Color Switching**: Special tiles (⚡) change the player's color
- **Multiple Levels**: 5 progressively challenging levels
- **Special Mechanics**: Math puzzles, keys & doors, fragile tiles (one-time use)
- **Scoring**: Time-based leaderboard + star rating based on move efficiency

### Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Graphics**: HTML5 Canvas 2D API
- **Storage**: localStorage for leaderboard persistence
- **Animation**: RequestAnimationFrame (60 FPS game loop)
- **No Dependencies**: Zero npm packages, zero build tools

---

## Codebase Structure

```
creationplace1/
├── index.html          # Main HTML structure (screens, UI, canvas)
├── style.css           # All styling, animations, responsive design
├── main.js             # Complete game logic (~1700 lines, fully commented)
├── test.html           # Automated test suite (25+ tests)
├── README.md           # User-facing documentation
├── ARCHITECTURE.md     # Detailed architecture analysis
├── CLAUDE.md           # This file - AI assistant guide
└── LICENSE             # Project license
```

### File Responsibilities

| File | Purpose | When to Modify |
|------|---------|----------------|
| `index.html` | Screen layouts, DOM structure | Adding UI elements, new screens |
| `style.css` | Visual design, animations | Styling changes, visual improvements |
| `main.js` | All game logic and systems | Game mechanics, features, bug fixes |
| `test.html` | Automated testing | Adding tests for new features |
| `README.md` | User documentation | User-facing feature changes |
| `ARCHITECTURE.md` | Technical documentation | Architectural changes |

---

## Architecture & Design Patterns

### Object-Oriented Design

The game follows a **modular, class-based architecture** with clear separation of concerns:

```
Game (Main Controller)
├── LevelManager        # Level loading, tile queries, progression
├── Player              # Player state, position, color, inventory
├── Renderer            # Canvas drawing operations
├── InputHandler        # Keyboard input processing
├── TimerSystem         # Game timing and display
└── LeaderboardSystem   # localStorage high scores
```

### Key Design Patterns

1. **Single Responsibility Principle**: Each class has one clear purpose
2. **Composition over Inheritance**: Game class composes other systems
3. **Data-Driven Design**: Levels defined as data objects, not code
4. **State Management**: Centralized game state with clear transitions
5. **Observer Pattern**: Event-driven input handling

### Critical Architecture Rules

**⚠️ NEVER:**
- Mix rendering logic into game logic classes
- Put game logic in the HTML/CSS
- Use global variables (except `game` instance)
- Modify tile objects directly without understanding state management
- Break the game loop structure

**✅ ALWAYS:**
- Keep classes focused on single responsibilities
- Use the existing class methods before adding new ones
- Maintain the data-driven level design approach
- Follow the established naming conventions
- Document new public methods with JSDoc-style comments

---

## Development Workflows

### Making Changes

#### 1. **Understanding First**
Before making changes:
- Read relevant code sections thoroughly
- Check `ARCHITECTURE.md` for system diagrams
- Review existing patterns in the code
- Test the current behavior manually

#### 2. **Planning**
For significant changes:
- Identify which classes/systems are affected
- Check for dependencies between systems
- Plan backwards compatibility (if applicable)
- Consider test coverage needs

#### 3. **Implementation**
Follow these steps:
- Make changes in isolated, testable chunks
- Update comments if behavior changes
- Maintain consistent code style
- Test incrementally as you go

#### 4. **Testing**
- Run `test.html` in browser for automated tests
- Manual testing: Open `index.html` and play through affected levels
- Test edge cases (e.g., undo after color change, fragile tiles)
- Verify leaderboard persistence (localStorage)

#### 5. **Documentation**
Update documentation when needed:
- User-facing changes → Update `README.md`
- Architecture changes → Update `ARCHITECTURE.md`
- New conventions → Update this file

---

## Key Conventions

### JavaScript Conventions

#### Naming

```javascript
// Constants: SCREAMING_SNAKE_CASE
const TILE_SIZE = 50;
const TILE_TYPES = { EMPTY: 'empty', GROUND: 'ground' };

// Classes: PascalCase
class LevelManager { }
class TimerSystem { }

// Variables/Functions: camelCase
let playerName = 'Alice';
function movePlayer(dx, dy) { }

// Private-ish members: No prefix (but document as private in comments)
constructor() {
    this.startTime = null; // Internal state
}
```

#### Code Style

```javascript
// ✅ GOOD: Clear, commented, follows existing patterns
/**
 * Moves the player to a new position
 * @param {number} dx - Horizontal movement (-1, 0, or 1)
 * @param {number} dy - Vertical movement (-1, 0, or 1)
 */
movePlayer(dx, dy) {
    const currentPos = this.player.getPosition();
    const newX = currentPos.x + dx;
    const newY = currentPos.y + dy;

    // Check if new position is walkable
    if (!this.levelManager.isWalkable(newX, newY)) {
        return; // Can't move to obstacles
    }

    // Move player and handle interaction
    this.player.moveTo(newX, newY);
    const tile = this.levelManager.getTile(newX, newY);
    this.handleTileInteraction(tile);
}

// ❌ BAD: No comments, unclear logic, inconsistent style
movePlayer(dx,dy){
    let np={x:this.player.x+dx,y:this.player.y+dy};
    if(this.levelManager.isWalkable(np.x,np.y)){
        this.player.moveTo(np.x,np.y);this.handleTileInteraction(this.levelManager.getTile(np.x,np.y));
    }
}
```

### Level Design Conventions

#### Grid Shorthand Codes

```javascript
// Terrain
'E'  = Empty (pit)
'O'  = Obstacle (wall)
'N'  = Neutral ground
'R'  = Red ground
'B'  = Blue ground
'Y'  = Yellow ground

// Special Tiles
'S'  = Start position
'G'  = Goal position
'CR' = Red color changer
'CB' = Blue color changer
'CY' = Yellow color changer

// Advanced Mechanics
'MG' = Math gate (requires question/answer in mathGates array)
'K'  = Key (collectible)
'D'  = Door (requires key)
'F'  = Fragile tile (breaks after one use)
```

#### Level Object Structure

```javascript
const LEVEL_X = {
    name: "Level X: Descriptive Name",  // Display name
    width: 16,                           // Grid width (tiles)
    height: 10,                          // Grid height (tiles)
    startPos: { x: 1, y: 5 },           // Player spawn
    goalPos: { x: 14, y: 5 },           // Goal position
    targetMoves: 20,                     // For star rating
    mathGates: [                         // Optional: only if using MG tiles
        { x: 4, y: 5, question: "3 + 2", answer: 5 }
    ],
    grid: [
        // 2D array of tile codes (height × width)
        ['O', 'O', 'O', ...],
        ['O', 'S', 'R', ...],
        // ...
    ]
};
```

### UI/DOM Conventions

#### Element IDs

Follow the existing naming pattern:
- Screens: `welcomeScreen`, `gameScreen`, `successScreen`, `failureScreen`
- Buttons: `startButton`, `restartButton`, `nextLevelButton`
- Info displays: `currentPlayerName`, `moveCount`, `timer`, `keyCount`
- Containers: `leaderboardList`, `gameCanvas`

#### Screen Transitions

Always use the helper methods:
```javascript
this.showWelcomeScreen();  // Not: manual classList manipulation
this.showGameScreen();
this.showSuccessScreen(time, rank, stars, moveCount);
this.showFailureScreen(message);
```

---

## Common Tasks

### Task 1: Add a New Tile Type

**Example**: Adding a "Speed Boost" tile

1. **Add to constants** (main.js ~line 28):
```javascript
const TILE_TYPES = {
    // ... existing types
    SPEED_BOOST: 'speedBoost'
};
```

2. **Add visual color** (main.js ~line 51):
```javascript
const COLOR_VALUES = {
    // ... existing colors
    speedBoost: '#1abc9c'
};
```

3. **Add parser logic** (main.js ~line 272):
```javascript
function parseTile(tileStr) {
    // ... existing cases
    if (tileStr === 'SB') {
        return { type: TILE_TYPES.SPEED_BOOST, color: COLORS.NEUTRAL };
    }
}
```

4. **Add rendering** (main.js ~line 818):
```javascript
drawTile(x, y, tile) {
    // ... existing drawing logic

    // In the switch statement for tile.type:
    case TILE_TYPES.SPEED_BOOST:
        fillColor = COLOR_VALUES.speedBoost;
        break;

    // Add symbol rendering (after line 889):
    if (tile.type === TILE_TYPES.SPEED_BOOST) {
        this.ctx.fillText('⚡', centerX, centerY);
    }
}
```

5. **Add interaction logic** (main.js ~line 1213):
```javascript
handleTileInteraction(tile) {
    // ... existing cases

    case TILE_TYPES.SPEED_BOOST:
        // Implement speed boost effect
        this.player.speedBoostActive = true;
        this.showFloatingText(pos.x, pos.y, 'Speed Boost!', '#1abc9c');
        break;
}
```

6. **Update documentation**:
- Add to grid legend in `README.md`
- Add to architecture diagrams in `ARCHITECTURE.md`

### Task 2: Add a New Level

1. **Define level object** (main.js, after existing levels ~line 260):
```javascript
const LEVEL_6 = {
    name: "Level 6: Your Level Name",
    width: 20,
    height: 14,
    startPos: { x: 1, y: 7 },
    goalPos: { x: 18, y: 7 },
    targetMoves: 45,
    grid: [
        // Design your grid here
    ]
};
```

2. **Add to LEVELS array** (main.js ~line 263):
```javascript
const LEVELS = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_6];
```

3. **Test thoroughly**:
- Ensure solution path exists
- Verify start/goal positions are correct
- Check target moves is reasonable
- Test all special tiles work correctly

### Task 3: Modify Game Mechanics

**Example**: Change color matching rule

**Current Rule** (main.js:1224-1228):
```javascript
case TILE_TYPES.GROUND:
    // Player can ONLY step on their own color or neutral ground
    if (tile.color !== playerColor && tile.color !== COLORS.NEUTRAL) {
        this.playerDied(`You can't walk on ${tile.color} ground!`);
    }
    break;
```

**To Change**: Update the condition, but **also update**:
1. Rule description in `index.html` welcome screen
2. Game mechanics section in `README.md`
3. Comments in code explaining the rule
4. Test cases in `test.html`

### Task 4: Add UI Elements

1. **Update HTML** (index.html):
```html
<div class="ui-bar">
    <!-- Add your new element -->
    <div class="info-item">
        <span class="label">Lives:</span>
        <span id="livesCount">3</span>
    </div>
</div>
```

2. **Add styling** (style.css):
```css
#livesCount {
    font-weight: bold;
    color: #e74c3c;
}
```

3. **Update in code** (main.js):
```javascript
updateLivesUI() {
    const element = document.getElementById('livesCount');
    if (element) {
        element.textContent = this.player.lives;
    }
}
```

4. **Call updater** at appropriate points:
- In `startGame()`
- After lives change
- In `restartLevel()`

### Task 5: Debug Issues

#### Common Debugging Points

**Player death issues** → Check `handleTileInteraction()` (line 1213)
**Movement not working** → Check `movePlayer()` (line 1192) and `InputHandler` (line 976)
**Rendering glitches** → Check `Renderer.draw()` (line 795) and `drawTile()` (line 818)
**Timer problems** → Check `TimerSystem` class (line 627)
**Leaderboard not saving** → Check `LeaderboardSystem` (line 687) and localStorage

#### Debugging Workflow

1. **Console logging**:
```javascript
// Add temporary logs
console.log('Player position:', this.player.getPosition());
console.log('Tile at position:', tile);
```

2. **Browser DevTools**:
- Use breakpoints in Sources tab
- Check localStorage in Application tab
- Monitor canvas rendering performance

3. **Test in isolation**:
```javascript
// Create test instance
const testPlayer = new Player(0, 0, COLORS.RED);
testPlayer.moveTo(1, 1);
console.log(testPlayer.getPosition()); // Should be {x: 1, y: 1}
```

---

## Testing Practices

### Automated Tests

The game includes a comprehensive test suite in `test.html`:

**Running Tests**:
1. Open `test.html` in a browser
2. Click "▶️ Run All Tests"
3. Review results (25+ tests covering all systems)

**Test Coverage**:
- ✅ Core Classes (Player, LevelManager, etc.)
- ✅ Tile Interactions
- ✅ Game Systems (Timer, Leaderboard, Input)
- ✅ UI Integration
- ✅ Level Progression

### Adding New Tests

When adding features, add corresponding tests:

```javascript
// In test.html, add to appropriate section
tests.push({
    name: "Player can collect speed boost",
    run: function() {
        const player = new Player(0, 0, COLORS.RED);
        const tile = { type: TILE_TYPES.SPEED_BOOST };

        // Simulate interaction
        game.handleTileInteraction(tile);

        // Assert expected behavior
        if (!player.speedBoostActive) {
            throw new Error("Speed boost should be active");
        }
    }
});
```

### Manual Testing Checklist

Before committing significant changes:

**Basic Functionality**
- [ ] Game starts without errors
- [ ] All 5 levels load correctly
- [ ] Player movement works (WASD + Arrows)
- [ ] Color changers work
- [ ] Goal triggers level complete

**Advanced Features**
- [ ] Math gates show puzzles and validate answers
- [ ] Keys can be collected
- [ ] Doors unlock with keys
- [ ] Fragile tiles break after first use
- [ ] Undo (U) works correctly
- [ ] Hint (H) shows direction
- [ ] Restart (R) resets level

**UI/UX**
- [ ] Timer counts correctly
- [ ] Move counter updates
- [ ] Star rating displays on completion
- [ ] Leaderboard persists across sessions
- [ ] All buttons work
- [ ] Screen transitions are smooth

**Edge Cases**
- [ ] Undo after collecting key (should restore key state)
- [ ] Undo after breaking fragile tile (tile should restore)
- [ ] Multiple keys work correctly
- [ ] Math gate wrong answer triggers death
- [ ] Completing all levels shows appropriate message

---

## Git & Commit Guidelines

### Branch Strategy

- **Main branch**: Stable, playable version
- **Feature branches**: `feature/your-feature-name`
- **Bug fixes**: `fix/bug-description`
- **Claude branches**: `claude/claude-md-[session-id]` (auto-generated)

### Commit Message Format

Follow the established pattern:

```
<type>: <concise description>

[Optional detailed explanation]
[Why this change was made]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `test`: Test additions/changes
- `style`: Formatting, CSS changes
- `perf`: Performance improvements

**Examples**:

```
feat: Add speed boost tile mechanic

- Implemented new SPEED_BOOST tile type
- Added visual indicator and particle effect
- Updated level 3 to include speed boost tiles
```

```
fix: Fragile tiles not resetting on level restart

- Fixed bug where fragile tiles remained broken after restart
- Ensured loadLevel() properly resets all tile states
- Added test case to prevent regression
```

### Before Committing

**Run Quality Checks**:
1. ✅ Code works (manual testing)
2. ✅ Automated tests pass (test.html)
3. ✅ No console errors
4. ✅ Comments updated
5. ✅ Documentation updated if needed

**Clean Commits**:
- Remove debug `console.log()` statements
- Remove commented-out code (unless documenting)
- Ensure formatting is consistent
- No unnecessary whitespace changes

---

## Important Notes for AI Assistants

### Understanding Context

**Before making changes, always**:
1. Read the relevant sections of code you'll be modifying
2. Check if similar functionality exists elsewhere (to maintain consistency)
3. Understand the data flow: User Input → InputHandler → Game → Systems → Renderer
4. Consider side effects on other systems

### Common Pitfalls to Avoid

❌ **Don't**: Assume the game uses a framework
- This is vanilla JavaScript, no React/Vue/Angular patterns

❌ **Don't**: Add external dependencies
- Keep it dependency-free (no npm packages)

❌ **Don't**: Modify state directly
- Use provided methods: `player.moveTo()`, not `player.x = newX`

❌ **Don't**: Break the game loop
- Understand `requestAnimationFrame` before modifying `gameLoop()`

❌ **Don't**: Mix concerns
- Don't put rendering logic in Player class
- Don't put game logic in Renderer class

❌ **Don't**: Ignore localStorage errors
- Always wrap localStorage calls in try-catch (see LeaderboardSystem)

❌ **Don't**: Forget canvas state
- Always save/restore canvas context when transforming

### Best Practices for AI Assistants

✅ **Do**: Follow existing patterns religiously
- If adding a new tile type, copy the exact pattern used for existing tiles

✅ **Do**: Maintain comprehensive comments
- This codebase is well-commented; keep it that way

✅ **Do**: Test edge cases
- Undo after every type of action
- Level boundaries
- Empty leaderboard
- localStorage disabled

✅ **Do**: Update all documentation
- Code comments
- README.md for user-facing changes
- ARCHITECTURE.md for structural changes
- This file (CLAUDE.md) for conventions

✅ **Do**: Preserve the educational value
- Code should be readable and educational
- Avoid clever tricks; prefer clarity
- Maintain the clean architecture

### Performance Considerations

**Canvas Rendering**:
- Minimize drawing operations per frame
- Don't create gradients in loops
- Use integer pixel coordinates when possible

**Memory Management**:
- Clear animation frames when stopping game
- Limit undo history (currently unlimited - could be improved)
- Don't leak event listeners

**localStorage**:
- Limit leaderboard to 10 entries (already implemented)
- Catch and handle quota exceeded errors

### Code Review Checklist

When reviewing your own changes:

**Functionality**:
- [ ] Feature works as intended
- [ ] No regression in existing features
- [ ] Edge cases handled

**Code Quality**:
- [ ] Follows established naming conventions
- [ ] Properly commented
- [ ] No code duplication
- [ ] Error handling in place

**Integration**:
- [ ] Fits architectural patterns
- [ ] No tight coupling introduced
- [ ] State management clean
- [ ] UI updates appropriately

**Testing**:
- [ ] Automated tests pass
- [ ] Manual testing completed
- [ ] New tests added for new features

**Documentation**:
- [ ] Code comments updated
- [ ] README.md updated (if user-facing)
- [ ] ARCHITECTURE.md updated (if structural)

---

## Quick Reference

### Key File Locations

| What | Where | Line |
|------|-------|------|
| Constants (tile types, colors) | main.js | 22-65 |
| Level definitions | main.js | 108-263 |
| Player class | main.js | 351-461 |
| LevelManager class | main.js | 475-618 |
| Game class (main controller) | main.js | 1052-1648 |
| Input handling | main.js | 976-1043 |
| Tile interaction logic | main.js | 1213-1285 |
| Rendering | main.js | 771-967 |
| UI update methods | main.js | 1397-1492 |
| Screen transitions | main.js | 1541-1647 |

### Common Code Snippets

**Add floating text message**:
```javascript
this.showFloatingText(x, y, 'Your message!', '#color');
```

**Check tile type**:
```javascript
const tile = this.levelManager.getTile(x, y);
if (tile && tile.type === TILE_TYPES.GROUND) { }
```

**Update UI element**:
```javascript
const element = document.getElementById('elementId');
if (element) {
    element.textContent = 'New value';
}
```

**Get player info**:
```javascript
const pos = this.player.getPosition();    // {x, y}
const color = this.player.getColor();      // 'red', 'blue', etc.
const moves = this.player.getMoves();      // number
const keys = this.player.getKeys();        // number
```

### Useful Resources

- **MDN Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **RequestAnimationFrame**: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
- **localStorage**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

## Version History

- **2025-11-19**: Initial CLAUDE.md creation - Comprehensive guide for AI assistants

---

**Remember**: This codebase prioritizes **clarity, simplicity, and education** over cleverness. When in doubt, choose the more readable, maintainable approach. Keep the vanilla JavaScript spirit alive—no frameworks, no build process, just clean code that anyone can understand and learn from.

Happy coding! 🎨🎮
