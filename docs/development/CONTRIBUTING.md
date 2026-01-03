# 🛠️ Development Guide

## Project Structure

```
x-bot-automation/
├── extension/           # Chrome Extension files
│   ├── manifest.json   # Extension configuration
│   ├── content.js      # Main bot logic (runs on Twitter)
│   ├── popup.html      # Extension popup UI
│   ├── popup.js        # Popup interactions
│   ├── sounds.js       # Sound notifications
│   └── new_actions.js  # Additional bot actions (temp)
├── docs/               # Documentation
│   ├── guides/         # User guides
│   ├── features/       # Feature documentation
│   └── development/    # Developer docs
└── README.md           # Main project readme
```

## Development Workflow

### 1. Making Changes

Edit files in `extension/` folder:
- `content.js` - Core bot logic
- `popup.js` - UI event handlers
- `popup.html` - Interface structure

### 2. Testing Changes

**CRITICAL**: Always reload extension after code changes!

1. Go to `chrome://extensions/`
2. Find "X Bot Helper"
3. Click Reload button (↻)
4. Reload Twitter page (F5)
5. Test your changes

### 3. Debugging

- Open Console (F12) untuk melihat logs
- Check Network tab untuk API calls
- Use `console.log()` untuk debug

## Code Style

- Use descriptive variable names
- Add comments untuk complex logic
- Keep functions focused and small
- Use async/await untuk asynchronous code

## Adding New Bot Actions

1. Create function di `content.js`
2. Add message handler di listener
3. Add button di `popup.html`
4. Add event listener di `popup.js`
5. Test thoroughly!

## Testing Checklist

- [ ] Code loads without errors
- [ ] Bot detects items correctly
- [ ] Pause/Resume works
- [ ] Stop button works
- [ ] Dry run mode works
- [ ] Export logs works
- [ ] No infinite loops
- [ ] Proper error handling

## Common Issues

### Extension not loading
- Check manifest.json syntax
- Check for JavaScript errors
- Reload extension

### Bot not working
- Check if on Twitter/X page
- Open console for errors
- Verify selectors still match Twitter's DOM

### Infinite loops
- Add empty detection
- Add consecutive skip counter
- Add max actions limit

## Release Process

1. Test all features
2. Update version in manifest.json
3. Update documentation
4. Create walkthrough
5. Package extension

---

Happy Coding! 🚀
