# Bump Selector v1.2.7 — Quick Start Guide

## For New Funnels

Want to use the bump selector in another funnel? It's now super easy!

### Step 1: Copy This Footer Code

Replace your funnel's footer code with this template:

```html
<!-- Product hiding (if needed) -->
<script>
window.FORCE_HIDE_PRODS = [
    // List product IDs to hide from main display
    // Example: '5016509','5016511','5016513','5016514'
];
</script>
<script src="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/product-row-hider.js"></script>

<!-- Bump selector styles -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-base.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-fx.css">

<!-- Configure your bumps -->
<script>
window.BUMP_CONFIG = [
  {
    mainProductId: 'YOUR_PRODUCT_ID_1',
    associatedIds: ['VARIANT_1', 'VARIANT_2', 'VARIANT_3'],
    includeMainInDropdown: true,
    defaultIndex: 0,
    featuredText: '*BONUS!*',
    preSelected: false
  },
  // Add more bumps as needed
];
</script>

<!-- Bump selector engine -->
<script src="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-v1.2.7.js"></script>

<!-- Your CF Pro Tools and other scripts -->
<script src="https://cdn.cfptaddons.com/...js" defer></script>
```

### Step 2: Find Your Product IDs

In ClickFunnels, find the product IDs for:
- **mainProductId**: The bump offer product
- **associatedIds**: The variant options

Example from Trump Gold Bundle:
```
Main Bump (8-Piece Trump Gift Set):
  - mainProductId: '5013848'
  - associatedIds: ['5016509','5016511','5016513','5016514']
```

### Step 3: Configure BUMP_CONFIG

Update the `window.BUMP_CONFIG` array with your product IDs:

```javascript
window.BUMP_CONFIG = [
  {
    mainProductId: '5013847',        // Your bump offer ID
    associatedIds: [                 // Your variant IDs
      '5016509',
      '5016511',
      '5016513',
      '5016514'
    ],
    includeMainInDropdown: true,     // Include main in dropdown
    defaultIndex: 1,                  // Select variant 2 by default
    featuredText: '*NOW!*',           // Badge text (optional)
    preSelected: false                // Auto-check on load? (optional)
  }
];
```

### Step 4: Done!

The bump selector will automatically:
- Create dropdowns for your variants
- Handle selection & validation
- Update the order summary
- Manage state across page interactions

---

## Configuration Options

| Option | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| `mainProductId` | string | Yes* | - | Bump offer product ID (*required unless empty associatedIds) |
| `associatedIds` | array | No | `[]` | Variant product IDs to show in dropdown |
| `includeMainInDropdown` | boolean | No | `true` | Show main product as option in dropdown |
| `defaultId` | string | No | - | Which variant to select by default (exact ID match) |
| `defaultIndex` | number | No | `0` | If defaultId not found, use this index (0 = first) |
| `featuredText` | string | No | `''` | Badge text like `*BONUS!*` to append to default option |
| `preSelected` | boolean | No | `false` | Auto-check this bump on page load |

### Example Configurations

**Simple Checkbox (No Dropdown):**
```javascript
{
  mainProductId: '5013847',
  associatedIds: [],                 // Empty = no dropdown
  preSelected: true                  // Check by default
}
```

**Dropdown with All Variants:**
```javascript
{
  mainProductId: '5013848',
  associatedIds: ['5016509','5016511','5016513','5016514'],
  includeMainInDropdown: true,       // Main product also in dropdown
  defaultIndex: 2,                   // Select 3rd option by default
  featuredText: '*BEST SELLER*'
}
```

**Dropdown Without Main Product:**
```javascript
{
  mainProductId: '5013848',
  associatedIds: ['5016509','5016511','5016513','5016514'],
  includeMainInDropdown: false,      // Only variants in dropdown
  defaultId: '5016511',              // Select this specific variant
  featuredText: '*HOT!*'
}
```

---

## CSS Customization

### Change Colors

Override in your own stylesheet after loading bump selector CSS:

```css
/* Change border color from gold to blue */
[class^="bump-selector-wrap"] select {
  border-color: #1e90ff;        /* blue */
  background-color: #e6f2ff;    /* light blue background */
  color: #003d7a;               /* dark blue text */
}

/* Change label color */
.quantity-selector-label {
  color: #003d7a;
}
```

### Disable Animations

```css
/* Remove all animations */
@media (prefers-reduced-motion: reduce) {
  [class^="bump-selector-wrap"],
  [class^="bump-selector-wrap"]::after,
  [class^="bump-selector-wrap"] select,
  .quantity-selector-label {
    animation: none !important;
  }
}

/* Or just disable for non-reduced-motion users */
[class^="bump-selector-wrap"],
[class^="bump-selector-wrap"]::after,
[class^="bump-selector-wrap"] select {
  animation: none !important;
}
```

### Custom Classes

Add custom classes to your wrapper for scoped styling:

```css
/* Only style bumps in a specific order form */
.my-funnel-name [class^="bump-selector-wrap"] select {
  font-size: 16px;
  padding: 12px;
}

/* Make label bold and larger */
.my-funnel-name .quantity-selector-label {
  font-size: 16px;
  font-weight: bold;
}
```

---

## Common Scenarios

### "Simple Bump" (No Variants)

Just a checkbox, no dropdown options:

```javascript
{
  mainProductId: '5013847',
  associatedIds: [],              // Empty array = no dropdown
  featuredText: '',               // No badge needed
  preSelected: false
}
```

### "Multi-Variant Bump" (With Options)

Dropdown with several options:

```javascript
{
  mainProductId: '5013848',
  associatedIds: [
    '5016509',  // Option 1
    '5016511',  // Option 2
    '5016513',  // Option 3
    '5016514'   // Option 4
  ],
  includeMainInDropdown: true,
  defaultIndex: 0,                // Select option 1 by default
  featuredText: '*SAVE NOW!*'
}
```

### "Variant-Only Bump" (Exclude Main)

Dropdown WITHOUT the main product as an option:

```javascript
{
  mainProductId: '5023729',
  associatedIds: ['5023738', '5023739', '5023740'],
  includeMainInDropdown: false,   // Main NOT in dropdown
  defaultIndex: 1,                // Select variant 2
  featuredText: '*BEST VALUE*'
}
```

### "Pre-Selected Bump" (Auto-Check)

Bump automatically checked when page loads:

```javascript
{
  mainProductId: '5013847',
  associatedIds: [],
  preSelected: true               // This bump starts checked
}
```

---

## JavaScript API

### Get Current Bump Selections

```javascript
var state = BumpSelector.getState();
console.log(state);
// Output:
// {
//   'bump-select-checker-1': { checked: true, value: '5016509' },
//   'bump-select-checker-2': { checked: false, value: '' }
// }
```

### Save & Restore Bump State

```javascript
// Save current state
var savedState = BumpSelector.getState();

// ... later, restore it
BumpSelector.setState(savedState);
```

### Reinitialize with Different Config

```javascript
// Change configuration after page load
var newConfig = [
  { mainProductId: '999', associatedIds: [...] },
  { mainProductId: '888', associatedIds: [...] }
];

BumpSelector.init(newConfig);
```

---

## Troubleshooting

### Bumps Not Showing

**Check 1:** Is `window.BUMP_CONFIG` defined?
```javascript
console.log(window.BUMP_CONFIG);  // Should show array
```

**Check 2:** Are the product IDs correct?
- Get IDs from ClickFunnels order form
- Use exact string values (with quotes)

**Check 3:** Is jQuery loaded?
```javascript
console.log(typeof jQuery);  // Should be 'function'
```

### Dropdowns Appear But Don't Work

**Check 1:** Are CSS files loading?
```javascript
// In browser dev tools, check Network tab
// Should see 200 responses for:
// - bump-selector-base.css
// - bump-selector-fx.css
```

**Check 2:** Are there JavaScript errors?
- Open browser Console (F12)
- Look for red error messages
- Report any errors in GitHub

### Variants Still Visible in Product List

**Problem:** Variant products showing in main product selection area

**Solution:** Use `window.FORCE_HIDE_PRODS`

```javascript
<script>
window.FORCE_HIDE_PRODS = [
  '5016509', '5016511', '5016513', '5016514',  // From bump 1
  '5016515', '5016516', '5016517', '5016518',  // From bump 2
  '5016519', '5016520', '5016521', '5016522'   // From bump 3
];
</script>
<script src="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/product-row-hider.js"></script>
```

### Order Summary Not Updating

**Check 1:** Is `rebuildOrderSummary()` available?
```javascript
console.log(typeof rebuildOrderSummary);  // Should be 'function'
```

**Check 2:** Are CF Pro Tools scripts loading?
- Check Network tab for cfptaddons.com scripts
- Ensure Order Summary add-in is installed

**Check 3:** Manual rebuild
```javascript
if (typeof rebuildOrderSummary === 'function') {
  rebuildOrderSummary();
}
```

---

## File Locations

| File | Location | CDN URL |
|------|----------|---------|
| **Engine** | `Snippets/CDN/cfaddins/cdn/bump-selector-v1.2.7.js` | https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-v1.2.7.js |
| **Base CSS** | `Snippets/CDN/cfaddins/cdn/bump-selector-base.css` | https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-base.css |
| **FX CSS** | `Snippets/CDN/cfaddins/cdn/bump-selector-fx.css` | https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-fx.css |
| **Full Docs** | `Snippets/CDN/cfaddins/cdn/BUMP_SELECTOR_README.md` | See repo on GitHub |

---

## Need Help?

1. **Check the full documentation:** [BUMP_SELECTOR_README.md](BUMP_SELECTOR_README.md)
2. **See refactoring details:** [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)
3. **Review example funnel:** Trump Gold Bundle 2.0 footer code
4. **Test in console:**
   ```javascript
   console.log(window.BumpSelector);      // API available?
   console.log(window.BUMP_CONFIG);       // Config loaded?
   BumpSelector.getState();               // Current state?
   ```

---

## Version Information

- **Current Version:** v1.2.7 (Modularized)
- **Release Date:** January 27, 2026
- **Repository:** https://github.com/kratner/ace-media-cfaddins
- **Requires:** jQuery, ClickFunnels
- **Optional:** CF Pro Tools add-ins for enhanced functionality

---

**Happy selling! 🎉**
