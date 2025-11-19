# Color Path - Debugging Guide

If the game is not working, follow these steps to diagnose the issue:

## Step 1: Open Browser Developer Tools

1. **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
2. **Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
3. **Safari**: Enable Developer menu in Preferences > Advanced, then press `Cmd+Option+I`

## Step 2: Check the Console Tab

Look for console messages. The game now has extensive logging. You should see:

### Expected Console Output (Success):
```
Color Path: Script loaded
Color Path: Document ready state: loading
Color Path: Waiting for DOMContentLoaded event...
Color Path: DOMContentLoaded fired, creating game instance...
Game: Initializing...
Game: LevelManager created
Game: TimerSystem created
Game: LeaderboardSystem created
Game: Canvas element found
Renderer initialized successfully
Game: Renderer and InputHandler created
Game: Setting up UI...
Game: UI setup complete
Game: Initialization complete!
Color Path: Game instance created successfully!
Color Path: Ready to play! Click "Start Game" to begin.
```

### When You Click "Start Game":
```
Start button clicked
Game: Starting game...
Game: Player name: [Your Name or Anonymous]
Game: Loading level 0...
Game: Level loaded successfully
Game: Start position: {x: 1, y: 5}
Game: Player created
Game: Canvas dimensions: 15 x 10
Game: Canvas initialized
Game: UI updated
Game: Game screen shown
Game: Timer started
Game: Game loop started
Game: Game started successfully!
```

## Step 3: Common Issues and Solutions

### Issue 1: "Canvas element #gameCanvas not found in DOM!"

**Problem**: The HTML file is not loading properly or the canvas element is missing.

**Solution**:
- Make sure you're opening `index.html`, not `test.html`
- Verify all three files (`index.html`, `style.css`, `main.js`) are in the same folder
- Try clearing browser cache and reload (Ctrl+F5 or Cmd+Shift+R)

### Issue 2: Files Not Loading (404 Errors)

**Problem**: CSS or JS files can't be found.

**Solution**:
- Check the browser's Network tab for 404 errors
- Ensure `index.html`, `style.css`, and `main.js` are in the same directory
- File names are case-sensitive on some systems
- Make sure there are no typos in filenames

### Issue 3: Blank White Screen

**Problem**: CSS file not loading.

**Solution**:
- Open Network tab in DevTools
- Refresh the page
- Check if `style.css` loaded successfully (should show 200 status)
- If 404 error, verify file exists in same folder as `index.html`

### Issue 4: Welcome Screen Shows But Nothing Happens

**Problem**: JavaScript not loading or error in code.

**Solution**:
- Check Console tab for red error messages
- Verify `main.js` is in the same folder
- Look for any syntax errors in console
- Make sure you saved all files after editing

### Issue 5: "Cannot read property 'getContext' of null"

**Problem**: Canvas element not found before JavaScript runs.

**Solution**:
- This should be fixed with the error handling added
- If still occurs, check if script tag is at the bottom of `<body>` tag
- Verify the script src="main.js" is correct

### Issue 6: Controls Don't Work

**Problem**: Input handler not capturing keyboard events.

**Solution**:
- Click somewhere on the game screen first to focus it
- Make sure you've clicked "Start Game" first
- Try pressing R to restart
- Check console for "Start button clicked" message

## Step 4: File Structure Verification

Your folder should look like this:

```
your-game-folder/
├── index.html      (Main HTML file - OPEN THIS)
├── style.css       (Styling)
├── main.js         (Game logic)
├── README.md       (Documentation)
├── test.html       (Debug test file - optional)
└── DEBUGGING.md    (This file)
```

## Step 5: Browser Compatibility

Test in a different browser:
- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

Avoid Internet Explorer (not supported).

## Step 6: Quick Test

Open `test.html` in your browser to run diagnostic tests. It will check:
- If JavaScript is loading
- If all classes are defined
- If level data is present
- If core systems can be instantiated

## Step 7: Manual Verification

### Check JavaScript is Loading:
Open Console and type:
```javascript
typeof game
```
Should return: `"object"` (not `"undefined"`)

### Check if Game Started:
After clicking Start Game, type in console:
```javascript
game.isPlaying
```
Should return: `true`

### Check Player Position:
While playing, type:
```javascript
game.player.getPosition()
```
Should return: `{x: [number], y: [number]}`

## Step 8: Force Reload

Sometimes browsers cache old versions of files:

1. **Hard Refresh**:
   - Windows/Linux: `Ctrl + F5` or `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Clear Cache**:
   - Chrome: Settings > Privacy > Clear browsing data > Cached images and files
   - Firefox: Options > Privacy > Clear Data > Cached Web Content

## Step 9: localhost vs File Protocol

If you're opening the file directly (file:// protocol), some features might be restricted:

**Solution**: Use a simple local server

### Option 1: Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

### Option 2: Node.js
```bash
npx http-server
```

### Option 3: VS Code
Install "Live Server" extension, then right-click `index.html` > "Open with Live Server"

## Step 10: Still Not Working?

If you've tried everything above:

1. **Copy the exact error message** from the console
2. **Take a screenshot** of the console output
3. **Note which browser** you're using and its version
4. **Check the Network tab** for any failed requests (red entries)

### Get Console Output:
1. Open DevTools Console
2. Right-click in the console
3. Select "Save as..." to save the log

### Common Error Messages:

| Error Message | Likely Cause |
|---------------|--------------|
| "Uncaught ReferenceError: game is not defined" | JavaScript file not loaded |
| "Cannot read property '...' of null" | DOM element not found |
| "Failed to load resource" | File not in correct location |
| "Unexpected token" | Syntax error in code |

## Testing the Fix

After making changes:

1. **Close all browser tabs** with the game
2. **Clear browser cache**
3. **Open index.html** in a new tab
4. **Open Developer Tools Console** immediately
5. **Watch for console messages** as page loads
6. **Click Start Game** and watch console

The extensive logging added should pinpoint exactly where any issue occurs.

## Success Indicators

You know it's working when:

1. ✅ Welcome screen appears with purple gradient background
2. ✅ You can enter a name in the text field
3. ✅ Clicking "Start Game" transitions to the game screen
4. ✅ You see a colorful grid with a character
5. ✅ Arrow keys or WASD move the character
6. ✅ Timer counts up in the top right
7. ✅ Leaderboard shows on the right side

## Need More Help?

The game now has extensive console logging. Every major action logs to the console. Review the console output carefully - it will tell you exactly what's happening and where any errors occur.
