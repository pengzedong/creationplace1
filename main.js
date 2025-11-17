/**
 * ============================================
 * COLOR PATH - Main Game Logic
 * ============================================
 *
 * A strategic color-switching puzzle game where players must navigate
 * through a grid-based map without stepping on tiles that match their
 * current color. Players can change their color at special tiles to
 * progress through the level.
 *
 * Architecture:
 * - Game: Main controller that orchestrates all game systems
 * - LevelManager: Handles level loading and management
 * - Player: Manages player state, position, and color
 * - Renderer: Draws the game to the canvas
 * - InputHandler: Processes keyboard input
 * - TimerSystem: Tracks completion time
 * - LeaderboardSystem: Manages high scores with localStorage
 */

// ============================================
// CONSTANTS AND CONFIGURATION
// ============================================

const TILE_SIZE = 50; // Size of each grid cell in pixels

// Tile Types
const TILE_TYPES = {
    EMPTY: 'empty',           // Pit - causes death
    GROUND: 'ground',         // Normal walkable ground
    OBSTACLE: 'obstacle',     // Impassable wall
    COLOR_CHANGE: 'colorChange', // Changes player's color
    START: 'start',           // Player spawn point
    GOAL: 'goal',             // Level completion point
    MATH_GATE: 'mathGate',    // Math puzzle gate
    KEY: 'key',               // Collectible key
    DOOR: 'door',             // Locked door (requires key)
    TELEPORT: 'teleport',     // Teleporter
    FRAGILE: 'fragile'        // One-time-use tile
};

// Colors
const COLORS = {
    RED: 'red',
    BLUE: 'blue',
    YELLOW: 'yellow',
    NEUTRAL: 'neutral' // Safe for all player colors
};

// Visual color mappings for rendering
const COLOR_VALUES = {
    red: '#e74c3c',
    blue: '#3498db',
    yellow: '#f1c40f',
    neutral: '#95a5a6',
    obstacle: '#2c3e50',
    empty: '#1a1a1a',
    start: '#27ae60',
    goal: '#2ecc71',
    mathGate: '#9b59b6',
    key: '#f39c12',
    door: '#34495e',
    teleport: '#1abc9c',
    fragile: '#e67e22'
};

// ============================================
// LEVEL DATA STRUCTURE
// ============================================

/**
 * LEVELS Array - Define all game levels here
 *
 * Each level is an object with:
 * - name: Display name of the level
 * - width: Number of tiles horizontally
 * - height: Number of tiles vertically
 * - startPos: {x, y} - Player starting position
 * - goalPos: {x, y} - Goal position to reach
 * - grid: 2D array of tile objects
 *
 * Each tile object has:
 * - type: One of TILE_TYPES
 * - color: One of COLORS (only applies to GROUND and COLOR_CHANGE types)
 *
 * HOW TO ADD MORE LEVELS:
 * 1. Copy the existing level object below
 * 2. Modify the grid layout, colors, and positions
 * 3. Add it to the LEVELS array
 * 4. The game will automatically make it available
 *
 * Example for adding a second level:
 *
 * const LEVEL_2 = {
 *     name: "Level 2: Advanced Challenge",
 *     width: 12,
 *     height: 10,
 *     startPos: { x: 0, y: 5 },
 *     goalPos: { x: 11, y: 5 },
 *     grid: [
 *         // ... define your grid here
 *     ]
 * };
 *
 * Then add to array: const LEVELS = [LEVEL_1, LEVEL_2];
 */

const LEVEL_1 = {
    name: "Level 1: Color Switching Basics",
    width: 16,
    height: 10,
    startPos: { x: 1, y: 5 },
    goalPos: { x: 14, y: 5 },
    targetMoves: 20,

    /**
     * Grid Layout Legend:
     * E = Empty (pit)
     * O = Obstacle (wall)
     * S = Start
     * G = Goal
     * N = Neutral ground
     * R = Red ground
     * B = Blue ground
     * Y = Yellow ground
     * CR = Red color changer
     * CB = Blue color changer
     * CY = Yellow color changer
     *
     * NEW RULE: Player can ONLY step on their own color or neutral tiles!
     * This level teaches the basic mechanic: Start as RED, walk on RED tiles,
     * use color changers to switch colors and access different colored zones.
     */
    grid: [
        // Row 0
        ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
        // Row 1
        ['O', 'E', 'E', 'N', 'N', 'E', 'E', 'N', 'N', 'E', 'E', 'N', 'N', 'E', 'E', 'O'],
        // Row 2
        ['O', 'E', 'N', 'B', 'B', 'N', 'N', 'Y', 'Y', 'N', 'N', 'R', 'R', 'N', 'E', 'O'],
        // Row 3
        ['O', 'E', 'N', 'B', 'CB', 'E', 'E', 'Y', 'CY', 'E', 'E', 'CR', 'R', 'N', 'E', 'O'],
        // Row 4
        ['O', 'E', 'N', 'B', 'B', 'N', 'N', 'Y', 'Y', 'N', 'N', 'R', 'R', 'N', 'E', 'O'],
        // Row 5 (Main path) - Player starts as RED
        ['O', 'S', 'R', 'R', 'CB', 'B', 'B', 'CY', 'Y', 'Y', 'CR', 'R', 'R', 'N', 'G', 'O'],
        // Row 6
        ['O', 'E', 'N', 'B', 'B', 'N', 'N', 'Y', 'Y', 'N', 'N', 'R', 'R', 'N', 'E', 'O'],
        // Row 7
        ['O', 'E', 'N', 'B', 'B', 'E', 'E', 'Y', 'Y', 'E', 'E', 'R', 'R', 'N', 'E', 'O'],
        // Row 8
        ['O', 'E', 'E', 'N', 'N', 'E', 'E', 'N', 'N', 'E', 'E', 'N', 'N', 'E', 'E', 'O'],
        // Row 9
        ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O']
    ]
};

// Level 2: Math Gates Introduction
const LEVEL_2 = {
    name: "Level 2: Number Gates",
    width: 14,
    height: 10,
    startPos: { x: 1, y: 5 },
    goalPos: { x: 12, y: 5 },
    mathGates: [
        { x: 4, y: 5, question: "3 + 2", answer: 5 },
        { x: 9, y: 5, question: "4 × 2", answer: 8 }
    ],
    targetMoves: 25,
    grid: [
        ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
        ['O', 'E', 'E', 'N', 'N', 'E', 'E', 'N', 'N', 'E', 'E', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'N', 'N', 'Y', 'Y', 'N', 'N', 'R', 'N', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'E', 'E', 'Y', 'Y', 'E', 'E', 'R', 'N', 'O'],
        ['O', 'E', 'N', 'R', 'CB', 'N', 'N', 'CY', 'Y', 'N', 'N', 'CR', 'N', 'O'],
        ['O', 'S', 'R', 'R', 'MG', 'B', 'B', 'B', 'MG', 'Y', 'R', 'R', 'G', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'N', 'N', 'B', 'B', 'N', 'N', 'R', 'N', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'E', 'E', 'B', 'B', 'E', 'E', 'R', 'N', 'O'],
        ['O', 'E', 'E', 'N', 'N', 'E', 'E', 'N', 'N', 'E', 'E', 'N', 'E', 'O'],
        ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O']
    ]
};

// Level 3: Keys and Doors
const LEVEL_3 = {
    name: "Level 3: Key Collection",
    width: 16,
    height: 12,
    startPos: { x: 1, y: 6 },
    goalPos: { x: 14, y: 6 },
    targetMoves: 35,
    grid: [
        ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
        ['O', 'E', 'E', 'E', 'N', 'N', 'E', 'E', 'E', 'E', 'N', 'N', 'E', 'E', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'R', 'N', 'E', 'E', 'N', 'Y', 'Y', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'K', 'R', 'N', 'E', 'E', 'N', 'Y', 'K', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'CB', 'N', 'E', 'E', 'N', 'CY', 'Y', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'N', 'N', 'B', 'N', 'E', 'E', 'N', 'Y', 'N', 'N', 'N', 'E', 'O'],
        ['O', 'S', 'R', 'R', 'D', 'B', 'B', 'B', 'D', 'Y', 'Y', 'D', 'R', 'R', 'G', 'O'],
        ['O', 'E', 'N', 'N', 'N', 'B', 'N', 'E', 'E', 'N', 'Y', 'N', 'N', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'R', 'N', 'E', 'E', 'N', 'Y', 'Y', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'CR', 'R', 'N', 'E', 'E', 'N', 'Y', 'CR', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'E', 'N', 'N', 'N', 'E', 'E', 'E', 'E', 'N', 'N', 'N', 'E', 'E', 'O'],
        ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O']
    ]
};

// Level 4: Fragile Tiles Challenge
const LEVEL_4 = {
    name: "Level 4: Fragile Path",
    width: 18,
    height: 12,
    startPos: { x: 1, y: 6 },
    goalPos: { x: 16, y: 6 },
    targetMoves: 40,
    grid: [
        ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
        ['O', 'E', 'E', 'N', 'N', 'N', 'E', 'E', 'E', 'E', 'E', 'E', 'N', 'N', 'N', 'E', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'F', 'N', 'E', 'N', 'N', 'E', 'N', 'Y', 'Y', 'F', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'CB', 'F', 'N', 'E', 'N', 'B', 'N', 'E', 'N', 'CY', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'F', 'B', 'B', 'N', 'E', 'N', 'B', 'N', 'E', 'N', 'Y', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'F', 'B', 'B', 'N', 'E', 'N', 'B', 'N', 'E', 'N', 'Y', 'F', 'N', 'E', 'O'],
        ['O', 'S', 'R', 'F', 'F', 'F', 'B', 'B', 'B', 'B', 'B', 'B', 'Y', 'F', 'F', 'R', 'G', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'F', 'N', 'E', 'N', 'B', 'N', 'E', 'N', 'Y', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'R', 'N', 'E', 'N', 'CR', 'N', 'E', 'N', 'Y', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'R', 'N', 'E', 'N', 'N', 'N', 'E', 'N', 'Y', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'E', 'N', 'N', 'N', 'E', 'E', 'E', 'E', 'E', 'E', 'N', 'N', 'N', 'E', 'E', 'O'],
        ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O']
    ]
};

// Level 5: Master Challenge
const LEVEL_5 = {
    name: "Level 5: Master Puzzle",
    width: 20,
    height: 14,
    startPos: { x: 1, y: 7 },
    goalPos: { x: 18, y: 7 },
    mathGates: [
        { x: 6, y: 7, question: "10 - 3", answer: 7 },
        { x: 13, y: 7, question: "6 × 3", answer: 18 }
    ],
    targetMoves: 50,
    grid: [
        ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
        ['O', 'E', 'E', 'E', 'N', 'N', 'N', 'E', 'E', 'E', 'E', 'E', 'E', 'N', 'N', 'N', 'E', 'E', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'F', 'R', 'N', 'E', 'N', 'N', 'E', 'N', 'Y', 'F', 'Y', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'K', 'F', 'CB', 'N', 'E', 'N', 'B', 'N', 'E', 'N', 'CY', 'F', 'K', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'F', 'R', 'R', 'B', 'N', 'E', 'N', 'B', 'N', 'E', 'N', 'Y', 'Y', 'F', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'F', 'D', 'B', 'B', 'N', 'E', 'N', 'B', 'N', 'E', 'N', 'Y', 'D', 'F', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'N', 'B', 'B', 'N', 'E', 'N', 'CR', 'N', 'E', 'N', 'Y', 'N', 'Y', 'N', 'E', 'O'],
        ['O', 'S', 'R', 'F', 'F', 'F', 'MG', 'B', 'B', 'B', 'B', 'B', 'B', 'MG', 'F', 'F', 'F', 'R', 'G', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'R', 'R', 'N', 'E', 'N', 'B', 'N', 'E', 'N', 'Y', 'Y', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'F', 'R', 'N', 'E', 'N', 'B', 'N', 'E', 'N', 'Y', 'F', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'F', 'CB', 'F', 'R', 'N', 'E', 'N', 'B', 'N', 'E', 'N', 'Y', 'F', 'CR', 'N', 'E', 'O'],
        ['O', 'E', 'N', 'R', 'R', 'R', 'R', 'N', 'E', 'N', 'N', 'N', 'E', 'N', 'Y', 'Y', 'Y', 'N', 'E', 'O'],
        ['O', 'E', 'E', 'N', 'N', 'N', 'N', 'E', 'E', 'E', 'E', 'E', 'E', 'N', 'N', 'N', 'N', 'E', 'E', 'O'],
        ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O']
    ]
};

// Main levels array - add new levels here
const LEVELS = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parses a grid string representation into a tile object
 */
function parseTile(tileStr) {
    // Obstacles
    if (tileStr === 'O') {
        return { type: TILE_TYPES.OBSTACLE, color: null };
    }

    // Empty pits
    if (tileStr === 'E') {
        return { type: TILE_TYPES.EMPTY, color: null };
    }

    // Start
    if (tileStr === 'S') {
        return { type: TILE_TYPES.START, color: COLORS.NEUTRAL };
    }

    // Goal
    if (tileStr === 'G') {
        return { type: TILE_TYPES.GOAL, color: COLORS.NEUTRAL };
    }

    // Neutral ground
    if (tileStr === 'N') {
        return { type: TILE_TYPES.GROUND, color: COLORS.NEUTRAL };
    }

    // Colored ground
    if (tileStr === 'R') {
        return { type: TILE_TYPES.GROUND, color: COLORS.RED };
    }
    if (tileStr === 'B') {
        return { type: TILE_TYPES.GROUND, color: COLORS.BLUE };
    }
    if (tileStr === 'Y') {
        return { type: TILE_TYPES.GROUND, color: COLORS.YELLOW };
    }

    // Color changers
    if (tileStr === 'CR') {
        return { type: TILE_TYPES.COLOR_CHANGE, color: COLORS.RED };
    }
    if (tileStr === 'CB') {
        return { type: TILE_TYPES.COLOR_CHANGE, color: COLORS.BLUE };
    }
    if (tileStr === 'CY') {
        return { type: TILE_TYPES.COLOR_CHANGE, color: COLORS.YELLOW };
    }

    // Math gates
    if (tileStr === 'MG') {
        return { type: TILE_TYPES.MATH_GATE, color: COLORS.NEUTRAL, locked: true };
    }

    // Keys
    if (tileStr === 'K') {
        return { type: TILE_TYPES.KEY, color: COLORS.NEUTRAL, collected: false };
    }

    // Doors
    if (tileStr === 'D') {
        return { type: TILE_TYPES.DOOR, color: COLORS.NEUTRAL, locked: true };
    }

    // Fragile tiles
    if (tileStr === 'F') {
        return { type: TILE_TYPES.FRAGILE, color: COLORS.NEUTRAL, used: false };
    }

    // Default to neutral ground
    return { type: TILE_TYPES.GROUND, color: COLORS.NEUTRAL };
}

// ============================================
// PLAYER CLASS
// ============================================

/**
 * Player - Manages player state and position
 */
class Player {
    constructor(startX, startY, initialColor = COLORS.RED) {
        this.startX = startX;
        this.startY = startY;
        this.x = startX;
        this.y = startY;
        this.color = initialColor;
        this.initialColor = initialColor;
        this.keys = 0;
        this.moveCount = 0;
        this.moveHistory = []; // For undo feature
    }

    /**
     * Moves the player to a new position
     */
    moveTo(x, y) {
        // Save state for undo
        this.moveHistory.push({
            x: this.x,
            y: this.y,
            color: this.color,
            keys: this.keys
        });

        this.x = x;
        this.y = y;
        this.moveCount++;
    }

    /**
     * Undo the last move
     */
    undo() {
        if (this.moveHistory.length > 0) {
            const lastState = this.moveHistory.pop();
            this.x = lastState.x;
            this.y = lastState.y;
            this.color = lastState.color;
            this.keys = lastState.keys;
            this.moveCount = Math.max(0, this.moveCount - 1);
            return true;
        }
        return false;
    }

    /**
     * Changes the player's color
     */
    setColor(color) {
        this.color = color;
    }

    /**
     * Adds a key to inventory
     */
    addKey() {
        this.keys++;
    }

    /**
     * Uses a key
     */
    useKey() {
        if (this.keys > 0) {
            this.keys--;
            return true;
        }
        return false;
    }

    /**
     * Gets number of keys
     */
    getKeys() {
        return this.keys;
    }

    /**
     * Gets move count
     */
    getMoves() {
        return this.moveCount;
    }

    /**
     * Resets player to starting position and color
     */
    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.color = this.initialColor;
        this.keys = 0;
        this.moveCount = 0;
        this.moveHistory = [];
    }

    /**
     * Gets the current position
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * Gets the current color
     */
    getColor() {
        return this.color;
    }
}

// ============================================
// LEVEL MANAGER CLASS
// ============================================

/**
 * LevelManager - Handles level loading and tile queries
 *
 * This class is responsible for:
 * - Loading level configurations
 * - Providing tile information
 * - Managing level transitions (for future multi-level support)
 */
class LevelManager {
    constructor() {
        this.currentLevelIndex = 0;
        this.currentLevel = null;
        this.grid = null;
    }

    /**
     * Loads a level from the LEVELS array
     * @param {number} levelIndex - Index of the level to load
     */
    loadLevel(levelIndex) {
        if (levelIndex < 0 || levelIndex >= LEVELS.length) {
            console.error('Invalid level index:', levelIndex);
            return false;
        }

        const levelConfig = LEVELS[levelIndex];
        this.currentLevelIndex = levelIndex;
        this.currentLevel = levelConfig;

        // Parse the grid from string representation to tile objects
        this.grid = [];
        for (let y = 0; y < levelConfig.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < levelConfig.width; x++) {
                const tileStr = levelConfig.grid[y][x];
                this.grid[y][x] = parseTile(tileStr);
            }
        }

        // Set up math gates if present
        if (levelConfig.mathGates) {
            levelConfig.mathGates.forEach(gate => {
                const tile = this.getTile(gate.x, gate.y);
                if (tile && tile.type === TILE_TYPES.MATH_GATE) {
                    tile.question = gate.question;
                    tile.answer = gate.answer;
                }
            });
        }

        return true;
    }

    /**
     * Gets the target moves for star rating
     */
    getTargetMoves() {
        return this.currentLevel.targetMoves || 999;
    }

    /**
     * Calculates star rating based on moves
     * 3 stars: <= target moves
     * 2 stars: <= target moves * 1.3
     * 1 star: > target moves * 1.3
     */
    calculateStars(moveCount) {
        const target = this.getTargetMoves();
        if (moveCount <= target) {
            return 3;
        } else if (moveCount <= target * 1.3) {
            return 2;
        } else {
            return 1;
        }
    }

    /**
     * Gets the tile at a specific position
     */
    getTile(x, y) {
        if (x < 0 || x >= this.currentLevel.width ||
            y < 0 || y >= this.currentLevel.height) {
            return null;
        }
        return this.grid[y][x];
    }

    /**
     * Checks if a position is walkable (not obstacle, not out of bounds)
     */
    isWalkable(x, y) {
        const tile = this.getTile(x, y);
        if (!tile) return false;
        return tile.type !== TILE_TYPES.OBSTACLE;
    }

    /**
     * Gets the starting position for the current level
     */
    getStartPosition() {
        return this.currentLevel.startPos;
    }

    /**
     * Gets the goal position for the current level
     */
    getGoalPosition() {
        return this.currentLevel.goalPos;
    }

    /**
     * Gets the dimensions of the current level
     */
    getDimensions() {
        return {
            width: this.currentLevel.width,
            height: this.currentLevel.height
        };
    }

    /**
     * Gets the current level name
     */
    getLevelName() {
        return this.currentLevel.name;
    }

    /**
     * Checks if there are more levels available
     * (For future multi-level support)
     */
    hasNextLevel() {
        return this.currentLevelIndex + 1 < LEVELS.length;
    }

    /**
     * Advances to the next level
     * (For future multi-level support)
     *
     * TO IMPLEMENT LEVEL PROGRESSION:
     * After completing a level, call: levelManager.goToNextLevel()
     * Then restart the game with the new level
     */
    goToNextLevel() {
        if (this.hasNextLevel()) {
            this.loadLevel(this.currentLevelIndex + 1);
            return true;
        }
        return false;
    }
}

// ============================================
// TIMER SYSTEM
// ============================================

/**
 * TimerSystem - Manages game timing
 */
class TimerSystem {
    constructor() {
        this.startTime = null;
        this.elapsedTime = 0;
        this.running = false;
    }

    /**
     * Starts the timer
     */
    start() {
        this.startTime = performance.now();
        this.running = true;
    }

    /**
     * Stops the timer and returns elapsed time
     */
    stop() {
        if (this.running) {
            this.elapsedTime = (performance.now() - this.startTime) / 1000;
            this.running = false;
        }
        return this.elapsedTime;
    }

    /**
     * Resets the timer
     */
    reset() {
        this.startTime = null;
        this.elapsedTime = 0;
        this.running = false;
    }

    /**
     * Gets the current elapsed time
     */
    getElapsedTime() {
        if (this.running) {
            return (performance.now() - this.startTime) / 1000;
        }
        return this.elapsedTime;
    }

    /**
     * Formats time for display
     */
    formatTime(seconds) {
        return seconds.toFixed(2) + 's';
    }
}

// ============================================
// LEADERBOARD SYSTEM
// ============================================

/**
 * LeaderboardSystem - Manages high scores with localStorage
 */
class LeaderboardSystem {
    constructor() {
        this.storageKey = 'colorPathHighScores';
        this.maxEntries = 10;
    }

    /**
     * Loads scores from localStorage
     */
    loadScores() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading scores:', error);
            return [];
        }
    }

    /**
     * Saves scores to localStorage
     */
    saveScores(scores) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(scores));
        } catch (error) {
            console.error('Error saving scores:', error);
        }
    }

    /**
     * Adds a new score to the leaderboard
     * @returns {number} The rank of the new score (1-10), or -1 if not in top 10
     */
    addScore(playerName, time) {
        const scores = this.loadScores();

        const newEntry = {
            name: playerName || 'Anonymous',
            time: time,
            date: new Date().toISOString()
        };

        scores.push(newEntry);

        // Sort by time (ascending - lower is better)
        scores.sort((a, b) => a.time - b.time);

        // Keep only top 10
        const trimmedScores = scores.slice(0, this.maxEntries);
        this.saveScores(trimmedScores);

        // Find rank of the new entry
        const rank = trimmedScores.findIndex(entry =>
            entry.name === newEntry.name &&
            entry.time === newEntry.time &&
            entry.date === newEntry.date
        );

        return rank >= 0 ? rank + 1 : -1;
    }

    /**
     * Gets the top scores
     */
    getTopScores() {
        return this.loadScores();
    }

    /**
     * Clears all scores (for testing)
     */
    clearScores() {
        localStorage.removeItem(this.storageKey);
    }
}

// ============================================
// RENDERER
// ============================================

/**
 * Renderer - Handles all canvas drawing operations
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    /**
     * Initializes the canvas size based on level dimensions
     */
    initCanvas(width, height) {
        this.canvas.width = width * TILE_SIZE;
        this.canvas.height = height * TILE_SIZE;
    }

    /**
     * Clears the entire canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draws the entire game state
     */
    draw(levelManager, player) {
        this.clear();
        this.drawGrid(levelManager);
        this.drawPlayer(player);
    }

    /**
     * Draws all tiles in the grid
     */
    drawGrid(levelManager) {
        const { width, height } = levelManager.getDimensions();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const tile = levelManager.getTile(x, y);
                this.drawTile(x, y, tile);
            }
        }
    }

    /**
     * Draws a single tile with enhanced visuals
     */
    drawTile(x, y, tile) {
        const pixelX = x * TILE_SIZE;
        const pixelY = y * TILE_SIZE;

        // Determine fill color
        let fillColor;

        switch (tile.type) {
            case TILE_TYPES.EMPTY:
                fillColor = COLOR_VALUES.empty;
                break;
            case TILE_TYPES.OBSTACLE:
                fillColor = COLOR_VALUES.obstacle;
                break;
            case TILE_TYPES.START:
                fillColor = COLOR_VALUES.start;
                break;
            case TILE_TYPES.GOAL:
                fillColor = COLOR_VALUES.goal;
                break;
            case TILE_TYPES.MATH_GATE:
                fillColor = tile.locked ? COLOR_VALUES.mathGate : COLOR_VALUES.neutral;
                break;
            case TILE_TYPES.KEY:
                fillColor = tile.collected ? COLOR_VALUES.neutral : COLOR_VALUES.key;
                break;
            case TILE_TYPES.DOOR:
                fillColor = tile.locked ? COLOR_VALUES.door : COLOR_VALUES.neutral;
                break;
            case TILE_TYPES.FRAGILE:
                fillColor = tile.used ? COLOR_VALUES.empty : COLOR_VALUES.fragile;
                break;
            case TILE_TYPES.COLOR_CHANGE:
            case TILE_TYPES.GROUND:
                fillColor = COLOR_VALUES[tile.color];
                break;
            default:
                fillColor = COLOR_VALUES.neutral;
        }

        // Draw tile background with gradient
        const gradient = this.ctx.createLinearGradient(pixelX, pixelY, pixelX + TILE_SIZE, pixelY + TILE_SIZE);
        gradient.addColorStop(0, fillColor);
        gradient.addColorStop(1, this.adjustBrightness(fillColor, -20));
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);

        // Add glow effect for interactive tiles
        if (tile.type === TILE_TYPES.COLOR_CHANGE || tile.type === TILE_TYPES.GOAL ||
            tile.type === TILE_TYPES.MATH_GATE || tile.type === TILE_TYPES.KEY) {
            const time = Date.now() / 1000;
            const glow = Math.sin(time * 2) * 0.3 + 0.7;
            this.ctx.shadowBlur = 10 * glow;
            this.ctx.shadowColor = fillColor;
        }

        // Draw tile border
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
        this.ctx.shadowBlur = 0;

        // Draw special symbols
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const centerX = pixelX + TILE_SIZE / 2;
        const centerY = pixelY + TILE_SIZE / 2;

        if (tile.type === TILE_TYPES.COLOR_CHANGE) {
            this.ctx.fillText('⚡', centerX, centerY);
        } else if (tile.type === TILE_TYPES.GOAL) {
            const time = Date.now() / 1000;
            const scale = 1 + Math.sin(time * 3) * 0.1;
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.scale(scale, scale);
            this.ctx.fillText('🏁', 0, 0);
            this.ctx.restore();
        } else if (tile.type === TILE_TYPES.START) {
            this.ctx.fillText('🏠', centerX, centerY);
        } else if (tile.type === TILE_TYPES.MATH_GATE && tile.locked) {
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('🔢', centerX, centerY - 8);
            this.ctx.font = 'bold 12px Arial';
            if (tile.question) {
                this.ctx.fillText(tile.question, centerX, centerY + 8);
            }
        } else if (tile.type === TILE_TYPES.KEY && !tile.collected) {
            this.ctx.fillText('🔑', centerX, centerY);
        } else if (tile.type === TILE_TYPES.DOOR && tile.locked) {
            this.ctx.fillText('🚪', centerX, centerY);
        } else if (tile.type === TILE_TYPES.FRAGILE && !tile.used) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText('⚠️', centerX, centerY);
        }
    }

    /**
     * Adjusts color brightness
     */
    adjustBrightness(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    /**
     * Draws the player character
     */
    drawPlayer(player) {
        const pos = player.getPosition();
        const color = player.getColor();

        const centerX = pos.x * TILE_SIZE + TILE_SIZE / 2;
        const centerY = pos.y * TILE_SIZE + TILE_SIZE / 2;
        const radius = TILE_SIZE / 3;

        // Draw player body (circle)
        this.ctx.fillStyle = COLOR_VALUES[color];
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw player outline
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Draw eyes
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius / 3, centerY - radius / 4, radius / 5, 0, Math.PI * 2);
        this.ctx.arc(centerX + radius / 3, centerY - radius / 4, radius / 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw pupils
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius / 3, centerY - radius / 4, radius / 8, 0, Math.PI * 2);
        this.ctx.arc(centerX + radius / 3, centerY - radius / 4, radius / 8, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

// ============================================
// INPUT HANDLER
// ============================================

/**
 * InputHandler - Processes keyboard input
 */
class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.setupListeners();
    }

    /**
     * Sets up keyboard event listeners
     */
    setupListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.handleKeyPress(e.key.toLowerCase());
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    /**
     * Handles individual key presses
     */
    handleKeyPress(key) {
        if (!this.game.isPlaying) return;

        let dx = 0;
        let dy = 0;

        // Movement keys
        switch (key) {
            case 'arrowup':
            case 'w':
                dy = -1;
                break;
            case 'arrowdown':
            case 's':
                dy = 1;
                break;
            case 'arrowleft':
            case 'a':
                dx = -1;
                break;
            case 'arrowright':
            case 'd':
                dx = 1;
                break;
            case 'r':
                // Restart level
                this.game.restartLevel();
                return;
            case 'u':
                // Undo last move
                this.game.undoMove();
                return;
            case 'h':
                // Show hint
                this.game.showHint();
                return;
        }

        // Process movement
        if (dx !== 0 || dy !== 0) {
            this.game.movePlayer(dx, dy);
        }
    }
}

// ============================================
// GAME CLASS - Main Controller
// ============================================

/**
 * Game - Main game controller that orchestrates all systems
 */
class Game {
    constructor() {
        // Initialize systems
        this.levelManager = new LevelManager();
        this.timer = new TimerSystem();
        this.leaderboard = new LeaderboardSystem();

        // Get DOM elements
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new Renderer(this.canvas);
        this.inputHandler = new InputHandler(this);

        // Game state
        this.player = null;
        this.isPlaying = false;
        this.playerName = '';

        // Animation frame ID
        this.animationId = null;

        this.setupUI();
    }

    /**
     * Sets up UI event listeners
     */
    setupUI() {
        // Start button
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });

        // Allow Enter key to start game
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });

        // Game control buttons
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartLevel();
        });

        document.getElementById('undoButton').addEventListener('click', () => {
            this.undoMove();
        });

        document.getElementById('hintButton').addEventListener('click', () => {
            this.showHint();
        });

        document.getElementById('mainMenuButton').addEventListener('click', () => {
            this.showWelcomeScreen();
        });

        // Failure screen buttons
        document.getElementById('retryButton').addEventListener('click', () => {
            this.restartLevel();
        });

        document.getElementById('failureMainMenuButton').addEventListener('click', () => {
            this.showWelcomeScreen();
        });

        // Success screen buttons
        document.getElementById('playAgainButton').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('viewLeaderboardButton').addEventListener('click', () => {
            this.showWelcomeScreen();
        });
    }

    /**
     * Starts the game
     */
    startGame(levelIndex = 0) {
        // Get player name if not already set
        if (!this.playerName) {
            const nameInput = document.getElementById('playerName');
            this.playerName = nameInput.value.trim() || 'Anonymous';
        }

        // Load specified level
        if (!this.levelManager.loadLevel(levelIndex)) {
            console.error('Failed to load level');
            return;
        }

        // Initialize player
        const startPos = this.levelManager.getStartPosition();
        this.player = new Player(startPos.x, startPos.y, COLORS.RED);

        // Initialize canvas
        const { width, height } = this.levelManager.getDimensions();
        this.renderer.initCanvas(width, height);

        // Update UI
        document.getElementById('currentPlayerName').textContent = this.playerName;
        this.updatePlayerColorUI();
        document.getElementById('currentLevel').textContent = `${levelIndex + 1}/${LEVELS.length}`;
        this.updateMovesUI();
        this.updateKeysUI();

        // Show game screen
        this.showGameScreen();

        // Start playing
        this.isPlaying = true;
        this.timer.start();

        // Start game loop
        this.gameLoop();

        // Update leaderboard display
        this.updateLeaderboardDisplay();
    }

    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isPlaying) return;

        // Update timer display
        const elapsed = this.timer.getElapsedTime();
        document.getElementById('timer').textContent = this.timer.formatTime(elapsed);

        // Render
        this.renderer.draw(this.levelManager, this.player);

        // Continue loop
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Moves the player in a direction
     */
    movePlayer(dx, dy) {
        const currentPos = this.player.getPosition();
        const newX = currentPos.x + dx;
        const newY = currentPos.y + dy;

        // Check if new position is walkable
        if (!this.levelManager.isWalkable(newX, newY)) {
            return; // Can't move to obstacles
        }

        // Move player
        this.player.moveTo(newX, newY);

        // Check what tile the player landed on
        const tile = this.levelManager.getTile(newX, newY);
        this.handleTileInteraction(tile);
    }

    /**
     * Handles interactions with tiles
     */
    handleTileInteraction(tile) {
        const playerColor = this.player.getColor();
        const pos = this.player.getPosition();

        switch (tile.type) {
            case TILE_TYPES.EMPTY:
                // Fell into pit - death
                this.playerDied('You fell into a pit!');
                break;

            case TILE_TYPES.GROUND:
                // Player can ONLY step on their own color or neutral ground
                // Stepping on any other color causes death
                if (tile.color !== playerColor && tile.color !== COLORS.NEUTRAL) {
                    this.playerDied(`You can't walk on ${tile.color} ground!`);
                }
                break;

            case TILE_TYPES.FRAGILE:
                // Fragile tiles can only be stepped on once
                if (tile.used) {
                    this.playerDied('The fragile tile crumbled beneath you!');
                } else {
                    tile.used = true; // Mark as used after stepping on it
                }
                break;

            case TILE_TYPES.COLOR_CHANGE:
                // Change player color
                this.player.setColor(tile.color);
                this.updatePlayerColorUI();
                this.showParticleEffect(pos.x, pos.y, tile.color);
                break;

            case TILE_TYPES.KEY:
                // Collect key
                if (!tile.collected) {
                    tile.collected = true;
                    this.player.addKey();
                    this.updateKeysUI();
                    this.showFloatingText(pos.x, pos.y, '+1 Key!', '#f39c12');
                }
                break;

            case TILE_TYPES.DOOR:
                // Try to open door with key
                if (tile.locked) {
                    if (this.player.useKey()) {
                        tile.locked = false;
                        this.updateKeysUI();
                        this.showFloatingText(pos.x, pos.y, 'Door Unlocked!', '#27ae60');
                    } else {
                        this.playerDied('You need a key to open this door!');
                    }
                }
                break;

            case TILE_TYPES.MATH_GATE:
                // Math puzzle gate
                if (tile.locked) {
                    this.showMathPuzzle(tile, pos.x, pos.y);
                }
                break;

            case TILE_TYPES.GOAL:
                // Level completed!
                this.levelCompleted();
                break;
        }

        // Update moves display
        this.updateMovesUI();
    }

    /**
     * Shows a math puzzle dialog
     */
    showMathPuzzle(tile, x, y) {
        this.isPlaying = false;
        const answer = prompt(`Math Challenge!\n\n${tile.question} = ?`);

        if (answer !== null) {
            if (parseInt(answer) === tile.answer) {
                tile.locked = false;
                this.showFloatingText(x, y, 'Correct! ✓', '#27ae60');
                this.isPlaying = true;
            } else {
                this.playerDied('Wrong answer! Try again.');
            }
        } else {
            this.isPlaying = true;
        }
    }

    /**
     * Shows particle effect at position
     */
    showParticleEffect(x, y, color) {
        // Visual feedback for color changes
        // This creates a simple visual cue
        const element = document.getElementById('statusMessage');
        element.style.display = 'none'; // Will be animated in CSS
    }

    /**
     * Shows floating text at position
     */
    showFloatingText(x, y, text, color) {
        const messageElement = document.getElementById('statusMessage');
        messageElement.textContent = text;
        messageElement.style.color = color;
        messageElement.classList.remove('hidden');
        messageElement.classList.add('floating-text');

        setTimeout(() => {
            messageElement.classList.add('hidden');
            messageElement.classList.remove('floating-text');
        }, 1500);
    }

    /**
     * Handles player death
     */
    playerDied(message) {
        this.isPlaying = false;

        // Stop the timer
        this.timer.stop();

        // Show failure screen instead of auto-restarting
        this.showFailureScreen(message);
    }

    /**
     * Handles level completion
     */
    levelCompleted() {
        this.isPlaying = false;
        const completionTime = this.timer.stop();
        const moveCount = this.player.getMoves();
        const stars = this.levelManager.calculateStars(moveCount);

        // Add score to leaderboard
        const rank = this.leaderboard.addScore(this.playerName, completionTime);

        // Show success screen with stars
        this.showSuccessScreen(completionTime, rank, stars, moveCount);
    }

    /**
     * Undo the last move
     */
    undoMove() {
        if (this.player.undo()) {
            this.updateMovesUI();
            this.updateKeysUI();
            this.updatePlayerColorUI();
            this.showFloatingText(this.player.x, this.player.y, 'Undone!', '#95a5a6');
        }
    }

    /**
     * Show a hint to the player
     */
    showHint() {
        const goalPos = this.levelManager.getGoalPosition();
        const playerPos = this.player.getPosition();

        const dx = goalPos.x - playerPos.x;
        const dy = goalPos.y - playerPos.y;

        let hint = 'Hint: ';
        if (Math.abs(dx) > Math.abs(dy)) {
            hint += dx > 0 ? 'Try moving RIGHT' : 'Try moving LEFT';
        } else {
            hint += dy > 0 ? 'Try moving DOWN' : 'Try moving UP';
        }

        this.showFloatingText(playerPos.x, playerPos.y, hint, '#3498db');
    }

    /**
     * Updates the moves counter UI
     */
    updateMovesUI() {
        const movesElement = document.getElementById('moveCount');
        if (movesElement) {
            const moves = this.player.getMoves();
            const target = this.levelManager.getTargetMoves();
            movesElement.textContent = `${moves}/${target}`;

            // Color code based on performance
            if (moves <= target) {
                movesElement.style.color = '#27ae60'; // Green
            } else if (moves <= target * 1.3) {
                movesElement.style.color = '#f39c12'; // Orange
            } else {
                movesElement.style.color = '#e74c3c'; // Red
            }
        }
    }

    /**
     * Updates the keys counter UI
     */
    updateKeysUI() {
        const keysElement = document.getElementById('keyCount');
        if (keysElement) {
            keysElement.textContent = this.player.getKeys();
        }
    }

    /**
     * Restarts the current level
     */
    restartLevel() {
        // Show game screen
        this.showGameScreen();

        // Reload the level to reset tiles (fragile, keys, doors, math gates)
        this.levelManager.loadLevel(this.levelManager.currentLevelIndex);

        // Reset player
        this.player.reset();

        // Reset timer
        this.timer.reset();
        this.timer.start();

        // Update UI
        this.updatePlayerColorUI();
        this.updateMovesUI();
        this.updateKeysUI();
        document.getElementById('timer').textContent = '0.00s';

        // Hide status message
        this.hideStatusMessage();

        // Resume playing
        this.isPlaying = true;

        if (!this.animationId) {
            this.gameLoop();
        }
    }

    /**
     * Restarts the entire game
     */
    restartGame() {
        // Cancel animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Reset state
        this.isPlaying = false;
        this.timer.reset();

        // Restart game
        this.startGame();
    }

    /**
     * Updates the player color indicator in UI
     */
    updatePlayerColorUI() {
        const colorElement = document.getElementById('currentPlayerColor');
        const color = this.player.getColor();

        // Capitalize first letter
        const displayColor = color.charAt(0).toUpperCase() + color.slice(1);
        colorElement.textContent = displayColor;

        // Set background color
        colorElement.style.backgroundColor = COLOR_VALUES[color];
        colorElement.style.color = '#fff';
    }

    /**
     * Updates the leaderboard display
     */
    updateLeaderboardDisplay() {
        const listElement = document.getElementById('leaderboardList');
        const scores = this.leaderboard.getTopScores();

        if (scores.length === 0) {
            listElement.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No scores yet!</p>';
            return;
        }

        listElement.innerHTML = '';
        scores.forEach((entry, index) => {
            const rank = index + 1;
            const entryDiv = document.createElement('div');
            entryDiv.className = `leaderboard-entry rank-${rank}`;

            entryDiv.innerHTML = `
                <span class="entry-rank">#${rank}</span>
                <span class="entry-name">${entry.name}</span>
                <span class="entry-time">${entry.time.toFixed(2)}s</span>
            `;

            listElement.appendChild(entryDiv);
        });
    }

    /**
     * Shows a status message (success or failure)
     */
    showStatusMessage(message, isSuccess) {
        const messageElement = document.getElementById('statusMessage');
        messageElement.textContent = message;
        messageElement.className = 'status-message' + (isSuccess ? ' success' : '');
    }

    /**
     * Hides the status message
     */
    hideStatusMessage() {
        const messageElement = document.getElementById('statusMessage');
        messageElement.className = 'status-message hidden';
    }

    /**
     * Shows the failure screen
     */
    showFailureScreen(message) {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('successScreen').classList.add('hidden');
        document.getElementById('failureScreen').classList.remove('hidden');

        // Update failure message
        document.getElementById('failureReason').textContent = message;

        // Cancel game loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Shows the welcome screen
     */
    showWelcomeScreen() {
        document.getElementById('welcomeScreen').classList.remove('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('successScreen').classList.add('hidden');
        document.getElementById('failureScreen').classList.add('hidden');

        // Cancel game loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isPlaying = false;
    }

    /**
     * Shows the game screen
     */
    showGameScreen() {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        document.getElementById('successScreen').classList.add('hidden');
        document.getElementById('failureScreen').classList.add('hidden');
    }

    /**
     * Shows the success screen
     */
    showSuccessScreen(completionTime, rank, stars, moveCount) {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('successScreen').classList.remove('hidden');
        document.getElementById('failureScreen').classList.add('hidden');

        // Update success screen content
        document.getElementById('successPlayerName').textContent = this.playerName;
        document.getElementById('completionTime').textContent =
            this.timer.formatTime(completionTime);

        // Show star rating
        const starElement = document.getElementById('starRating');
        if (starElement) {
            let starText = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
            starElement.textContent = starText;
        }

        // Show moves
        const movesElement = document.getElementById('completionMoves');
        if (movesElement) {
            const target = this.levelManager.getTargetMoves();
            movesElement.textContent = `${moveCount} moves (Target: ${target})`;
        }

        // Show rank message
        const recordMessage = document.getElementById('recordMessage');
        if (rank > 0) {
            if (rank === 1) {
                recordMessage.textContent = '🏆 NEW RECORD! You\'re #1!';
            } else {
                recordMessage.textContent = `🎯 You placed #${rank} on the leaderboard!`;
            }
        } else {
            recordMessage.textContent = 'Keep practicing to make the top 10!';
        }

        // Show or hide "Next Level" button
        const nextLevelBtn = document.getElementById('nextLevelButton');
        if (nextLevelBtn) {
            if (this.levelManager.hasNextLevel()) {
                nextLevelBtn.classList.remove('hidden');
                nextLevelBtn.onclick = () => {
                    const nextLevel = this.levelManager.currentLevelIndex + 1;
                    this.startGame(nextLevel);
                };
            } else {
                nextLevelBtn.classList.add('hidden');
                recordMessage.textContent += ' 🎊 You completed all levels!';
            }
        }

        // Update leaderboard
        this.updateLeaderboardDisplay();

        // Cancel game loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// ============================================
// INITIALIZE GAME
// ============================================

// Create game instance when DOM is ready
let game;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        game = new Game();
    });
} else {
    game = new Game();
}

/**
 * ============================================
 * EXTENSION GUIDE
 * ============================================
 *
 * ADDING MORE LEVELS:
 * -------------------
 * 1. Define a new level object following the LEVEL_1 format above
 * 2. Add it to the LEVELS array
 * 3. The game will automatically support it
 *
 * Example:
 *
 * const LEVEL_2 = {
 *     name: "Level 2: Advanced Maze",
 *     width: 20,
 *     height: 15,
 *     startPos: { x: 1, y: 7 },
 *     goalPos: { x: 18, y: 7 },
 *     grid: [
 *         // ... your grid layout here
 *     ]
 * };
 *
 * const LEVELS = [LEVEL_1, LEVEL_2]; // Add LEVEL_2 to array
 *
 * IMPLEMENTING LEVEL PROGRESSION:
 * -------------------------------
 * To allow players to progress through levels automatically:
 *
 * 1. In the levelCompleted() method (line ~880), add:
 *    if (this.levelManager.hasNextLevel()) {
 *        // Show "Next Level" button on success screen
 *        // When clicked, call: this.levelManager.goToNextLevel()
 *        // Then restart the game
 *    } else {
 *        // Show "All levels complete!" message
 *    }
 *
 * 2. Update the success screen HTML to include a "Next Level" button
 *
 * 3. Optionally, track per-level scores in localStorage
 *
 * ADDING NEW MECHANICS:
 * --------------------
 * - New tile types: Add to TILE_TYPES constant and parseTile() function
 * - New colors: Add to COLORS and COLOR_VALUES constants
 * - Power-ups: Add handling in handleTileInteraction() method
 * - Moving obstacles: Add update logic in gameLoop()
 * - Lives system: Add lives counter to Player class
 *
 * The modular architecture makes extensions straightforward!
 */
