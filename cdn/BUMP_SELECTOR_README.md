# Bump Selector v1.2.7 — Modularized Architecture

## Overview

The Bump Selector is a modular ClickFunnels order form enhancement that allows customers to select product variants from dropdown menus within bump offer sections. This refactored version separates concerns into CSS modules and a standalone JavaScript engine.

## File Structure

```
cdn/
├── bump-selector-v1.2.7.js       # Main engine (this file)
├── bump-selector-base.css         # Core styling
├── bump-selector-fx.css           # Enhanced animations & effects
└── product-row-hider.js           # Product hiding (external)
```

## Module Responsibilities

### 1. **bump-selector-v1.2.7.js** (Main Engine)
- Initializes bump selector from `window.BUMP_CONFIG`
- Manages dropdown UI creation and event handling
- Handles product variant selection
- Monitors order summary for consistency
- Provides state management API

**Dependencies:**
- jQuery (provided by ClickFunnels)
- `window.BUMP_CONFIG` object (user-defined)
- `rebuildOrderSummary()` function (from CF Pro Tools)

### 2. **bump-selector-base.css** (Core Styles)
- Base styling for dropdown wrappers
- Select input styling (borders, colors, focus states)
- Label styling
- Load **first** in the cascade

### 3. **bump-selector-fx.css** (Enhanced Effects)
- Animated gold borders and sheens
- Micro-bounce animations
- Reduced-motion support
- Load **after** base.css for proper cascade

### 4. **product-row-hider.js** (External)
- Hides variants that shouldn't be displayed
- Loaded from: `https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/product-row-hider.js`
- Controlled via `window.FORCE_HIDE_PRODS` array

## Configuration

Define `window.BUMP_CONFIG` **before** loading the bump selector script:

```javascript
<script>
window.BUMP_CONFIG = [
  {
    // Product ID that represents this bump offer
    mainProductId: '5013847',
    
    // Variant product IDs (shown in dropdown)
    associatedIds: ['5023738', '5023739'],
    
    // Include main product as dropdown option?
    includeMainInDropdown: true,
    
    // Which product ID to select by default (optional)
    defaultId: '5023739',
    
    // Fallback default index if defaultId not found
    defaultIndex: 2,
    
    // Badge text to append to default option (e.g., '*NOW!*')
    featuredText: '*BONUS!*',
    
    // Auto-check this bump on page load?
    preSelected: false
  },
  // ... more bumps
];
</script>
```

## Load Order (Critical)

```html
<!-- 1. Product hiding configuration -->
<script>
window.FORCE_HIDE_PRODS = ['5016509', '5016511', ...];
</script>

<!-- 2. Product row hider (removes variants from display) -->
<script src="product-row-hider.js"></script>

<!-- 3. Load CSS (base first, then effects) -->
<link rel="stylesheet" href="bump-selector-base.css">
<link rel="stylesheet" href="bump-selector-fx.css">

<!-- 4. Define bump configuration -->
<script>
window.BUMP_CONFIG = [ /* ... */ ];
</script>

<!-- 5. Load bump selector engine -->
<script src="bump-selector-v1.2.7.js"></script>

<!-- 6. CF Pro Tools scripts -->
<script src="cfptaddons.com/...js" defer></script>
```

## Features

### Variant Selection
- Dropdown UI for each bump offer
- Single selection per bump (exclusive)
- Form validation on submit
- Error feedback if no variant selected

### Product Row Hiding
- Automatically hides variant products from main display
- Configured via `window.FORCE_HIDE_PRODS` array
- Prevents duplicate product listings

### Order Summary Sync
- Monitors order summary for missing bumps
- Automatically rebuilds if selections disappear
- Debounced updates to prevent performance issues
- Works with CF Pro Tools Order Summary add-in

### State Persistence
- Saves/restores bump selections when core product changes
- Prevents loss of bump choices during form interaction
- Ensures CFProTools recognizes selected variants

### Animation Effects
- Gold-animated border when bump is selected
- Continuous sheen effect
- Label nudge animation
- Error shake on validation failure
- Respects `prefers-reduced-motion` setting

## Public API

### `window.BumpSelector.init(configArray)`
Initialize with a custom configuration array (alternative to `window.BUMP_CONFIG`):

```javascript
BumpSelector.init([
  { mainProductId: '123', ... },
  { mainProductId: '456', ... }
]);
```

### `window.BumpSelector.getState()`
Get current bump selections:

```javascript
var state = BumpSelector.getState();
// Returns:
// {
//   'bump-select-checker-1': { checked: true, value: '5023739' },
//   'bump-select-checker-2': { checked: false, value: '' },
//   ...
// }
```

### `window.BumpSelector.setState(state)`
Restore bump selections from a saved state:

```javascript
var savedState = {
  'bump-select-checker-1': { checked: true, value: '5023739' }
};
BumpSelector.setState(savedState);
```

## Behavior Details

### Deferred Click Handling
Checkbox clicks are deferred with `setTimeout(..., 0)` to ensure:
1. Other event handlers (CF Pro Tools) run first
2. Bump selector's exclusive selection logic runs last
3. Only the chosen variant ends up checked

### Debounced Order Summary Updates
- Order summary rebuilds are debounced at 50ms
- Prevents excessive rebuilds during rapid changes
- Triggered by:
  - Bump checkbox clicks
  - Dropdown select changes
  - Core product changes

### Multiple Rebuild Attempts
After core product changes, order summary is rebuilt:
1. Immediately after state restoration
2. After 200ms delay (catches late updates)
3. Continuous monitoring via MutationObserver

This ensures CFProTools Order Summary always reflects correct selections.

## Styling Customization

### Base Colors (in bump-selector-base.css)
- Border: `#DAA520` (gold)
- Background: `#FFFACD` (light yellow)
- Text: `#8B4513` (saddle brown)

### Animation Colors (in bump-selector-fx.css)
- Active border: `#b8860b` to `#ffd700` gradient
- Sheen: White with 97% opacity
- Glow: Gold with 20% opacity

### Modifying Styles

To customize, override in your own stylesheet:

```css
/* Override base colors */
[class^="bump-selector-wrap"] select {
  border-color: #1e90ff;        /* blue instead of gold */
  background-color: #e6f2ff;    /* light blue background */
  color: #003d7a;               /* dark blue text */
}

/* Disable animations */
@media (prefers-reduced-motion: reduce) {
  [class^="bump-selector-wrap"],
  [class^="bump-selector-wrap"]::after,
  [class^="bump-selector-wrap"] select,
  .quantity-selector-label {
    animation: none !important;
  }
}
```

## Troubleshooting

### Bumps not appearing in order summary
**Solution:** Ensure order summary rebuild is triggered
```javascript
// Manually force rebuild if needed
if (typeof rebuildOrderSummary === 'function') {
  rebuildOrderSummary();
}
```

### Variants showing in product list
**Solution:** Add product IDs to `window.FORCE_HIDE_PRODS` **before** loading scripts
```javascript
window.FORCE_HIDE_PRODS = ['5016509', '5016511', ...];
```

### Dropdown not responding
**Solution:** Check that jQuery is loaded
```javascript
console.log(typeof jQuery); // Should be 'function'
```

### Animations not smooth
**Solution:** Check for CSS conflicts or prefers-reduced-motion
```javascript
// Check for reduced motion preference
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
console.log('Reduced motion:', prefersReducedMotion);
```

## Version History

### v1.2.7 (2026-01-27)
- **Refactored:** Modularized from inline footer code into separate files
- **Added:** Public API for state management
- **Fixed:** Product row hider separation (now external)
- **Improved:** Documentation and code organization

### v1.2.6
- Added robust order summary monitoring
- Extended restore delay for CFPT compatibility
- Added debouncing for rebuild calls

### v1.2.5
- Deferred checkbox click handling
- Fixed double-selection in order summary
- Maintained exclusive variant selection per bump

## Migration from Inline Code

If migrating from inline footer code to modularized version:

**Before:**
```html
<script>
  window.FORCE_HIDE_PRODS = [...];
</script>
<script src="product-row-hider.js"></script>
<script>
  // 300+ lines of bump selector code
</script>
<style>
  /* Base CSS */
</style>
<style>
  /* FX CSS */
</style>
```

**After:**
```html
<script>
  window.FORCE_HIDE_PRODS = [...];
</script>
<script src="product-row-hider.js"></script>

<link rel="stylesheet" href="bump-selector-base.css">
<link rel="stylesheet" href="bump-selector-fx.css">

<script>
  window.BUMP_CONFIG = [...];
</script>
<script src="bump-selector-v1.2.7.js"></script>
```

## Files Modified

- ✅ `/Snippets/CDN/cfaddins/cdn/bump-selector-v1.2.7.js` — Created
- ✅ `/Snippets/CDN/cfaddins/cdn/bump-selector-base.css` — Created
- ✅ `/Snippets/CDN/cfaddins/cdn/bump-selector-fx.css` — Existing (no changes)
- ✅ `/Funnels/Trump Gold Bundle.../TrumpGoldBundle2.0_F+S_FooterCode_BUMPSELECTORFX_CDN02.html` — Refactored

## License & Attribution

© 2026 Entremax Media | CFAddins Repository
Repository: https://github.com/kratner/ace-media-cfaddins
