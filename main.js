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
    GOAL: 'goal'              // Level completion point
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
    goal: '#2ecc71'
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
    width: 15,
    height: 10,
    startPos: { x: 1, y: 5 },
    goalPos: { x: 13, y: 5 },

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
     */
    grid: [
        // Row 0
        ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
        // Row 1
        ['O', 'E', 'E', 'E', 'N', 'N', 'E', 'E', 'N', 'N', 'N', 'E', 'E', 'E', 'O'],
        // Row 2
        ['O', 'E', 'N', 'N', 'B', 'B', 'N', 'N', 'Y', 'Y', 'Y', 'N', 'N', 'E', 'O'],
        // Row 3
        ['O', 'E', 'N', 'CB', 'B', 'B', 'N', 'CY', 'Y', 'Y', 'Y', 'N', 'N', 'E', 'O'],
        // Row 4
        ['O', 'E', 'N', 'N', 'B', 'B', 'N', 'N', 'Y', 'Y', 'Y', 'N', 'N', 'E', 'O'],
        // Row 5 (Main path)
        ['O', 'S', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'N', 'CR', 'R', 'G', 'O'],
        // Row 6
        ['O', 'E', 'N', 'N', 'B', 'B', 'N', 'N', 'Y', 'Y', 'Y', 'N', 'N', 'E', 'O'],
        // Row 7
        ['O', 'E', 'N', 'N', 'B', 'B', 'N', 'N', 'Y', 'Y', 'Y', 'N', 'N', 'E', 'O'],
        // Row 8
        ['O', 'E', 'E', 'E', 'N', 'N', 'E', 'E', 'N', 'N', 'N', 'E', 'E', 'E', 'O'],
        // Row 9
        ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O']
    ]
};

// Main levels array - add new levels here
const LEVELS = [LEVEL_1];

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
    }

    /**
     * Moves the player to a new position
     */
    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Changes the player's color
     */
    setColor(color) {
        this.color = color;
    }

    /**
     * Resets player to starting position and color
     */
    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.color = this.initialColor;
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

        return true;
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
     * Draws a single tile
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
            case TILE_TYPES.COLOR_CHANGE:
            case TILE_TYPES.GROUND:
                fillColor = COLOR_VALUES[tile.color];
                break;
            default:
                fillColor = COLOR_VALUES.neutral;
        }

        // Draw tile background
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);

        // Draw tile border
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);

        // Draw special symbols
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const centerX = pixelX + TILE_SIZE / 2;
        const centerY = pixelY + TILE_SIZE / 2;

        if (tile.type === TILE_TYPES.COLOR_CHANGE) {
            // Draw lightning bolt symbol for color changers
            this.ctx.fillText('⚡', centerX, centerY);
        } else if (tile.type === TILE_TYPES.GOAL) {
            // Draw flag symbol for goal
            this.ctx.fillText('🏁', centerX, centerY);
        } else if (tile.type === TILE_TYPES.START) {
            // Draw house symbol for start
            this.ctx.fillText('🏠', centerX, centerY);
        }
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
    startGame() {
        // Get player name
        const nameInput = document.getElementById('playerName');
        this.playerName = nameInput.value.trim() || 'Anonymous';

        // Load first level
        if (!this.levelManager.loadLevel(0)) {
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
        document.getElementById('currentLevel').textContent = '1';

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

        switch (tile.type) {
            case TILE_TYPES.EMPTY:
                // Fell into pit - death
                this.playerDied('You fell into a pit!');
                break;

            case TILE_TYPES.GROUND:
                // Check if ground color matches player color
                if (tile.color === playerColor && tile.color !== COLORS.NEUTRAL) {
                    this.playerDied('You stepped on your own color!');
                }
                break;

            case TILE_TYPES.COLOR_CHANGE:
                // Change player color
                this.player.setColor(tile.color);
                this.updatePlayerColorUI();
                break;

            case TILE_TYPES.GOAL:
                // Level completed!
                this.levelCompleted();
                break;
        }
    }

    /**
     * Handles player death
     */
    playerDied(message) {
        this.isPlaying = false;
        this.showStatusMessage(message, false);

        // Reset after delay
        setTimeout(() => {
            this.restartLevel();
        }, 1000);
    }

    /**
     * Handles level completion
     */
    levelCompleted() {
        this.isPlaying = false;
        const completionTime = this.timer.stop();

        // Add score to leaderboard
        const rank = this.leaderboard.addScore(this.playerName, completionTime);

        // Show success screen
        this.showSuccessScreen(completionTime, rank);
    }

    /**
     * Restarts the current level
     */
    restartLevel() {
        // Reset player
        this.player.reset();

        // Reset timer
        this.timer.reset();
        this.timer.start();

        // Update UI
        this.updatePlayerColorUI();
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
     * Shows the welcome screen
     */
    showWelcomeScreen() {
        document.getElementById('welcomeScreen').classList.remove('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('successScreen').classList.add('hidden');

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
    }

    /**
     * Shows the success screen
     */
    showSuccessScreen(completionTime, rank) {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('successScreen').classList.remove('hidden');

        // Update success screen content
        document.getElementById('successPlayerName').textContent = this.playerName;
        document.getElementById('completionTime').textContent =
            this.timer.formatTime(completionTime);

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
