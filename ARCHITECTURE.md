# Color Path Game - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Class Diagram](#class-diagram)
3. [Sequence Diagrams](#sequence-diagrams)
4. [Flow Analysis](#flow-analysis)
5. [Requirements Validation](#requirements-validation)

---

## System Overview

**Color Path** is a browser-based puzzle game built with vanilla JavaScript, HTML5 Canvas, and CSS3. The architecture follows object-oriented principles with clear separation of concerns.

### Core Components
- **Game Controller**: Orchestrates all game systems
- **Level Manager**: Handles level data and progression
- **Player**: Manages player state and inventory
- **Renderer**: Handles all visual rendering
- **Input Handler**: Processes user input
- **Timer System**: Tracks completion time
- **Leaderboard System**: Manages high scores

---

## Class Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                            Game                                  │
├─────────────────────────────────────────────────────────────────┤
│ - levelManager: LevelManager                                     │
│ - player: Player                                                 │
│ - renderer: Renderer                                             │
│ - inputHandler: InputHandler                                     │
│ - timer: TimerSystem                                             │
│ - leaderboard: LeaderboardSystem                                 │
│ - isPlaying: boolean                                             │
│ - playerName: string                                             │
│ - animationId: number                                            │
├─────────────────────────────────────────────────────────────────┤
│ + setupUI(): void                                                │
│ + startGame(levelIndex): void                                    │
│ + gameLoop(): void                                               │
│ + movePlayer(dx, dy): void                                       │
│ + handleTileInteraction(tile): void                              │
│ + undoMove(): void                                               │
│ + showHint(): void                                               │
│ + levelCompleted(): void                                         │
│ + playerDied(message): void                                      │
│ + restartLevel(): void                                           │
│ + updateUI(): void                                               │
└─────────────────────────────────────────────────────────────────┘
                    │
                    │ manages
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        LevelManager                              │
├─────────────────────────────────────────────────────────────────┤
│ - currentLevelIndex: number                                      │
│ - currentLevel: Object                                           │
│ - grid: Array<Array<Tile>>                                       │
├─────────────────────────────────────────────────────────────────┤
│ + loadLevel(levelIndex): boolean                                 │
│ + getTile(x, y): Tile                                            │
│ + isWalkable(x, y): boolean                                      │
│ + getStartPosition(): {x, y}                                     │
│ + getGoalPosition(): {x, y}                                      │
│ + getTargetMoves(): number                                       │
│ + calculateStars(moveCount): number                              │
│ + hasNextLevel(): boolean                                        │
│ + goToNextLevel(): boolean                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           Player                                 │
├─────────────────────────────────────────────────────────────────┤
│ - x: number                                                      │
│ - y: number                                                      │
│ - color: string                                                  │
│ - keys: number                                                   │
│ - moveCount: number                                              │
│ - moveHistory: Array<State>                                      │
│ - startX: number                                                 │
│ - startY: number                                                 │
│ - initialColor: string                                           │
├─────────────────────────────────────────────────────────────────┤
│ + moveTo(x, y): void                                             │
│ + undo(): boolean                                                │
│ + setColor(color): void                                          │
│ + addKey(): void                                                 │
│ + useKey(): boolean                                              │
│ + getKeys(): number                                              │
│ + getMoves(): number                                             │
│ + reset(): void                                                  │
│ + getPosition(): {x, y}                                          │
│ + getColor(): string                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          Renderer                                │
├─────────────────────────────────────────────────────────────────┤
│ - canvas: HTMLCanvasElement                                      │
│ - ctx: CanvasRenderingContext2D                                  │
├─────────────────────────────────────────────────────────────────┤
│ + initCanvas(width, height): void                                │
│ + clear(): void                                                  │
│ + draw(levelManager, player): void                               │
│ + drawGrid(levelManager): void                                   │
│ + drawTile(x, y, tile): void                                     │
│ + drawPlayer(player): void                                       │
│ + adjustBrightness(color, amount): string                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       InputHandler                               │
├─────────────────────────────────────────────────────────────────┤
│ - game: Game                                                     │
│ - keys: Object                                                   │
├─────────────────────────────────────────────────────────────────┤
│ + setupListeners(): void                                         │
│ + handleKeyPress(key): void                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       TimerSystem                                │
├─────────────────────────────────────────────────────────────────┤
│ - startTime: number                                              │
│ - elapsedTime: number                                            │
│ - running: boolean                                               │
├─────────────────────────────────────────────────────────────────┤
│ + start(): void                                                  │
│ + stop(): number                                                 │
│ + reset(): void                                                  │
│ + getElapsedTime(): number                                       │
│ + formatTime(seconds): string                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    LeaderboardSystem                             │
├─────────────────────────────────────────────────────────────────┤
│ - storageKey: string                                             │
│ - maxEntries: number                                             │
├─────────────────────────────────────────────────────────────────┤
│ + loadScores(): Array<Score>                                     │
│ + saveScores(scores): void                                       │
│ + addScore(name, time): number                                   │
│ + getTopScores(): Array<Score>                                   │
│ + clearScores(): void                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Tile (Data)                              │
├─────────────────────────────────────────────────────────────────┤
│ + type: TileType                                                 │
│ + color: Color                                                   │
│ + locked?: boolean                                               │
│ + collected?: boolean                                            │
│ + used?: boolean                                                 │
│ + question?: string                                              │
│ + answer?: number                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sequence Diagrams

### 1. Game Start Sequence

```
User          WelcomeScreen    Game         LevelManager    Player    Renderer
 │                 │            │                │            │          │
 │ Click Start     │            │                │            │          │
 ├────────────────>│            │                │            │          │
 │                 │ startGame()│                │            │          │
 │                 ├───────────>│                │            │          │
 │                 │            │ loadLevel(0)   │            │          │
 │                 │            ├───────────────>│            │          │
 │                 │            │<───────────────┤            │          │
 │                 │            │                │            │          │
 │                 │            │ new Player(startPos)        │          │
 │                 │            ├────────────────────────────>│          │
 │                 │            │                │            │          │
 │                 │            │ initCanvas(width, height)   │          │
 │                 │            ├────────────────────────────────────────>│
 │                 │            │                │            │          │
 │                 │ showGameScreen()            │            │          │
 │                 │<───────────┤                │            │          │
 │                 │            │                │            │          │
 │                 │            │ timer.start()  │            │          │
 │                 │            │ gameLoop()     │            │          │
 │                 │            │ (60 FPS)       │            │          │
```

### 2. Player Movement Sequence

```
User      InputHandler    Game         LevelManager    Player    Renderer
 │             │           │                │            │          │
 │ Press Key   │           │                │            │          │
 ├────────────>│           │                │            │          │
 │             │ handleKeyPress()           │            │          │
 │             ├──────────>│                │            │          │
 │             │           │ movePlayer(dx,dy)           │          │
 │             │           ├────────────────────────────>│          │
 │             │           │                │ moveTo()   │          │
 │             │           │                │<───────────┤          │
 │             │           │                │            │          │
 │             │           │ getTile(newX, newY)         │          │
 │             │           ├───────────────>│            │          │
 │             │           │<───────────────┤            │          │
 │             │           │                │            │          │
 │             │           │ handleTileInteraction(tile) │          │
 │             │           ├─────────────────────────────┼─────────>│
 │             │           │                │            │          │
 │             │           │ updateUI()     │            │          │
 │             │           │ draw()         │            │          │
```

### 3. Math Gate Interaction Sequence

```
Player    Game         LevelManager    Tile        Browser
 │         │                │            │            │
 │ Step on │                │            │            │
 │ Math Gate                │            │            │
 ├────────>│                │            │            │
 │         │ getTile(x,y)   │            │            │
 │         ├───────────────>│            │            │
 │         │<───────────────┤            │            │
 │         │                │            │            │
 │         │ handleTileInteraction(tile) │            │
 │         ├────────────────────────────>│            │
 │         │                │  locked?   │            │
 │         │                │<───────────┤            │
 │         │                │            │            │
 │         │ showMathPuzzle(tile)        │            │
 │         ├────────────────────────────────────────>│
 │         │                │            │ prompt()   │
 │<────────┼────────────────────────────────────────┤│
 │ Answer  │                │            │            │
 ├─────────────────────────────────────────────────>│
 │         │                │            │            │
 │         │ validate answer│            │            │
 │         │<───────────────────────────────────────┤│
 │         │                │            │            │
 │         │ unlock gate / playerDied() │            │
```

### 4. Level Completion Sequence

```
Player    Game         Timer    LevelManager    Leaderboard    UI
 │         │            │            │               │          │
 │ Reach   │            │            │               │          │
 │ Goal    │            │            │               │          │
 ├────────>│            │            │               │          │
 │         │ levelCompleted()        │               │          │
 │         ├────────────┤            │               │          │
 │         │ stop()     │            │               │          │
 │         │<───────────┤            │               │          │
 │         │            │            │               │          │
 │         │ getMoves() │            │               │          │
 │         │            │            │               │          │
 │         │ calculateStars(moves)   │               │          │
 │         ├───────────────────────>│               │          │
 │         │<───────────────────────┤               │          │
 │         │                         │               │          │
 │         │ addScore(name, time)    │               │          │
 │         ├────────────────────────────────────────>│          │
 │         │<────────────────────────────────────────┤          │
 │         │                         │               │          │
 │         │ showSuccessScreen(time, rank, stars)   │          │
 │         ├────────────────────────────────────────────────────>│
```

### 5. Undo Feature Sequence

```
User      InputHandler    Game      Player       UI
 │             │           │          │           │
 │ Press 'U'   │           │          │           │
 ├────────────>│           │          │           │
 │             │ undoMove()│          │           │
 │             ├──────────>│          │           │
 │             │           │ undo()   │           │
 │             │           ├─────────>│           │
 │             │           │ restore  │           │
 │             │           │ state    │           │
 │             │           │<─────────┤           │
 │             │           │          │           │
 │             │           │ updateMovesUI()      │
 │             │           ├──────────────────────>│
 │             │           │ updateKeysUI()       │
 │             │           ├──────────────────────>│
 │             │           │ updateColorUI()      │
 │             │           ├──────────────────────>│
 │             │           │          │           │
 │             │           │ showFloatingText()   │
 │             │           ├──────────────────────>│
```

---

## Flow Analysis

### Game State Flow

```
[Welcome Screen]
      │
      │ Start Game
      ▼
[Game Active]
      │
      ├──> [Playing] ───┐
      │         │        │
      │         │ Move   │
      │         ├────────┘
      │         │
      │         │ Die
      │         ├──────> [Failure Screen]
      │         │              │
      │         │              │ Retry
      │         │              └──────────┐
      │         │                         │
      │         │ Complete                │
      │         ├──────> [Success Screen] │
      │         │              │           │
      │         │              │ Next      │
      │         │              │ Level     │
      │         │              └───────────┤
      │         │                          │
      │         │ Restart                  │
      │         │<─────────────────────────┘
      │         │
      │         │ Main Menu
      └─────────┴──────> [Welcome Screen]
```

### Tile Interaction Logic Flow

```
Player Moves
    │
    ▼
Get Tile at New Position
    │
    ├──> EMPTY? ──────────> Player Dies (Pit)
    │
    ├──> OBSTACLE? ───────> Block Movement
    │
    ├──> GROUND?
    │      │
    │      ├──> Color Match? ──> Continue
    │      └──> No Match? ─────> Player Dies
    │
    ├──> FRAGILE?
    │      │
    │      ├──> Already Used? ─> Player Dies
    │      └──> First Use? ────> Mark Used, Continue
    │
    ├──> COLOR_CHANGE? ──────> Change Player Color
    │
    ├──> KEY?
    │      │
    │      ├──> Collected? ────> Continue
    │      └──> Not Collected? > Add Key, Mark Collected
    │
    ├──> DOOR?
    │      │
    │      ├──> Locked?
    │      │      │
    │      │      ├──> Has Key? ──> Unlock, Continue
    │      │      └──> No Key? ───> Player Dies
    │      │
    │      └──> Unlocked? ─────> Continue
    │
    ├──> MATH_GATE?
    │      │
    │      ├──> Locked? ───────> Show Math Puzzle
    │      │                         │
    │      │                         ├──> Correct? ─> Unlock, Continue
    │      │                         └──> Wrong? ───> Player Dies
    │      │
    │      └──> Unlocked? ─────> Continue
    │
    └──> GOAL? ────────────────> Level Complete!
```

### Star Rating Calculation

```
Level Complete
    │
    ▼
Get Move Count
    │
    ▼
Get Target Moves
    │
    ▼
Calculate Ratio
    │
    ├──> Moves ≤ Target ────────────> ⭐⭐⭐ (3 Stars)
    │
    ├──> Moves ≤ Target × 1.3 ─────> ⭐⭐☆ (2 Stars)
    │
    └──> Moves > Target × 1.3 ─────> ⭐☆☆ (1 Star)
```

---

## Requirements Validation

### Functional Requirements ✅

| Requirement | Implementation | Status |
|------------|----------------|--------|
| **FR1**: User can start game with optional name | Welcome screen with name input | ✅ |
| **FR2**: Multiple levels with progression | 5 levels with next level button | ✅ |
| **FR3**: Color-based movement rules | Ground tile color validation | ✅ |
| **FR4**: Math puzzle challenges | Math gate with prompt validation | ✅ |
| **FR5**: Key and door mechanics | Key collection and door unlocking | ✅ |
| **FR6**: Fragile tile mechanics | One-time use tile tracking | ✅ |
| **FR7**: Move counter | Real-time move tracking and display | ✅ |
| **FR8**: Star rating system | 1-3 stars based on efficiency | ✅ |
| **FR9**: Undo functionality | Move history with state restoration | ✅ |
| **FR10**: Hint system | Directional hints to goal | ✅ |
| **FR11**: Timer | Completion time tracking | ✅ |
| **FR12**: Leaderboard | Top 10 scores with localStorage | ✅ |
| **FR13**: Level restart | Reset level state completely | ✅ |
| **FR14**: Keyboard controls | WASD/Arrows + shortcuts | ✅ |

### Non-Functional Requirements ✅

| Requirement | Implementation | Status |
|------------|----------------|--------|
| **NFR1**: Responsive UI | Flexbox layout, mobile-friendly | ✅ |
| **NFR2**: Smooth animations | CSS3 + Canvas animations | ✅ |
| **NFR3**: Visual feedback | Glowing effects, floating text | ✅ |
| **NFR4**: Performance | 60 FPS game loop | ✅ |
| **NFR5**: Browser compatibility | Vanilla JS, no dependencies | ✅ |
| **NFR6**: Data persistence | localStorage for scores | ✅ |
| **NFR7**: Error handling | Graceful fallbacks | ✅ |
| **NFR8**: Code maintainability | OOP, clear separation | ✅ |

### Game Mechanics Validation ✅

#### Level Progression
- ✅ Level 1: Basic color switching
- ✅ Level 2: Math gates introduction
- ✅ Level 3: Key collection mechanic
- ✅ Level 4: Fragile tiles challenge
- ✅ Level 5: Master level (all mechanics)

#### Tile Types Coverage
- ✅ EMPTY (pits)
- ✅ GROUND (colored)
- ✅ OBSTACLE (walls)
- ✅ COLOR_CHANGE (color switchers)
- ✅ START (spawn point)
- ✅ GOAL (finish)
- ✅ MATH_GATE (puzzles)
- ✅ KEY (collectible)
- ✅ DOOR (locked barriers)
- ✅ FRAGILE (one-time use)

#### Player Actions
- ✅ Movement (4 directions)
- ✅ Color changing
- ✅ Key collection
- ✅ Door unlocking
- ✅ Math puzzle solving
- ✅ Undo moves
- ✅ Request hints
- ✅ Restart level

---

## Data Flow

### Input → Processing → Output

```
┌──────────────┐
│ User Input   │
│ (Keyboard)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│InputHandler  │
│ validates    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Game      │
│ processes    │
│ game logic   │
└──────┬───────┘
       │
       ├─────────────────┬─────────────────┬──────────────┐
       ▼                 ▼                 ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────┐
│LevelManager  │  │   Player     │  │  Timer   │  │Renderer │
│ checks tiles │  │ updates state│  │  tracks  │  │ draws   │
└──────┬───────┘  └──────┬───────┘  └────┬─────┘  └────┬────┘
       │                 │                │             │
       └─────────────────┴────────────────┴─────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Visual Output│
                  │   (Canvas)   │
                  └──────────────┘
```

---

## Performance Considerations

### Optimization Strategies

1. **Rendering**
   - Canvas double buffering
   - Only redraw when state changes
   - Gradient caching for tiles

2. **State Management**
   - Minimal state updates
   - Efficient undo history (max depth)
   - localStorage throttling

3. **Animation**
   - RequestAnimationFrame for smooth 60 FPS
   - CSS animations for UI transitions
   - Glow effects optimized with shadowBlur

4. **Memory**
   - Level data loaded on demand
   - Old animation frames cancelled
   - Leaderboard limited to top 10

---

## Security Considerations

1. **Input Validation**
   - Player name sanitized (max 20 chars)
   - Math answers validated as integers
   - Movement bounds checking

2. **Data Safety**
   - localStorage wrapped in try-catch
   - Score tampering mitigated by timestamp
   - No sensitive data stored

3. **XSS Prevention**
   - Text content used instead of innerHTML
   - No eval() or dynamic code execution

---

## Future Extensibility

### Easy to Add Features

1. **New Tile Types**
   - Add to TILE_TYPES constant
   - Extend parseTile() function
   - Add rendering in drawTile()
   - Add interaction in handleTileInteraction()

2. **New Levels**
   - Define level object
   - Add to LEVELS array
   - Automatically supported

3. **New Mechanics**
   - Teleporters (TELEPORT type defined)
   - Moving obstacles (add in gameLoop)
   - Power-ups (new tile type)
   - Time limits (Timer system ready)

4. **Enhancements**
   - Sound effects (Web Audio API)
   - Multiplayer (WebSocket)
   - Level editor (CRUD operations)
   - Social sharing (Web Share API)

---

## Conclusion

The Color Path game demonstrates a well-architected, maintainable codebase with:

✅ Clear separation of concerns
✅ Object-oriented design
✅ Comprehensive feature set
✅ Smooth user experience
✅ Extensible architecture
✅ Good performance
✅ Proper error handling

All requirements have been validated and all flows work correctly.
