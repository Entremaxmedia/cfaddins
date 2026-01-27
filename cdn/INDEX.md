# Bump Selector v1.2.7 — Documentation Index

**Refactored:** January 27, 2026  
**Status:** ✅ Production Ready  
**Repository:** https://github.com/kratner/ace-media-cfaddins

---

## 📚 Documentation Files

### 🚀 [QUICK_START.md](QUICK_START.md) — **START HERE**
Perfect for getting up and running with bump selector in your funnel.
- Copy-paste footer code template
- Find your product IDs
- Configure BUMP_CONFIG
- Common scenarios & troubleshooting

**Best for:** New funnels, quick implementation

---

### 📖 [BUMP_SELECTOR_README.md](BUMP_SELECTOR_README.md) — Comprehensive Reference
Complete technical documentation covering all aspects.

**Sections:**
- Architecture & file structure
- Module responsibilities
- Configuration reference
- Load order (critical!)
- Features & behavior details
- Public API reference
- Styling customization
- Troubleshooting with solutions
- Version history

**Best for:** Understanding the system, advanced customization, troubleshooting

---

### 📝 [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) — Implementation Details
Overview of what changed and why.

**Sections:**
- Refactoring overview
- Before/after comparison
- Files created & modified
- Technical architecture
- Code metrics & improvements
- Testing recommendations
- Deployment checklist
- Future improvements

**Best for:** Understanding the refactor, code review, implementation details

---

## 📦 Source Files

### Core Engine
**File:** `bump-selector-v1.2.7.js` (~600 lines)

**Responsibilities:**
- Read configuration from `window.BUMP_CONFIG`
- Create dropdown UI for bumps with variants
- Handle checkbox toggles & select changes
- Manage product selection state
- Monitor order summary for consistency
- Provide public API

**Key Functions:**
- `initFromConfig()` - Initialize from configuration
- `activateBump(cfg)` - Check bump & select variant
- `deactivateBump(cfg)` - Uncheck bump
- `saveCurrentSelections()` - Save state
- `restoreSelections()` - Restore state

**Public API:**
```javascript
BumpSelector.init(configArray)        // Initialize with custom config
BumpSelector.getState()                // Get current bump selections
BumpSelector.setState(state)           // Restore saved state
```

---

### Base Styles
**File:** `bump-selector-base.css` (~60 lines)

**Covers:**
- `.bump-selector-wrap` - Wrapper container
- `select` - Dropdown input styling
- `.quantity-selector-label` - Label styling
- Focus & default states
- Basic colors & spacing

**Colors:**
- Border: `#DAA520` (gold)
- Background: `#FFFACD` (light yellow)
- Text: `#8B4513` (saddle brown)

---

### Enhanced Effects
**File:** `bump-selector-fx.css` (~200 lines)

**Features:**
- Animated gold borders
- Continuous sheen effect
- Micro-bounce animation
- Label nudge animation
- Error shake animation
- `:has()` selector support
- Fallback `.attention-pulse` class
- `prefers-reduced-motion` support

**Note:** Already exists in repo, included in this refactor unchanged

---

## 🎯 Quick Navigation

| Need | Go To |
|------|-------|
| Get started quickly | [QUICK_START.md](QUICK_START.md) |
| Understand the architecture | [BUMP_SELECTOR_README.md](BUMP_SELECTOR_README.md) |
| Learn what changed | [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) |
| Find a solution | BUMP_SELECTOR_README.md → Troubleshooting |
| Customize colors | QUICK_START.md → CSS Customization |
| Configure bumps | QUICK_START.md → Configuration Options |
| See the API | BUMP_SELECTOR_README.md → Public API |
| Migrate from old code | BUMP_SELECTOR_README.md → Migration |

---

## 🔧 Common Tasks

### Add Bump Selector to a New Funnel

1. Open [QUICK_START.md](QUICK_START.md)
2. Copy footer code template
3. Find your product IDs
4. Update `window.BUMP_CONFIG`
5. Save & test

**Time:** ~5 minutes

---

### Customize Bump Styles

1. Open [QUICK_START.md](QUICK_START.md) → CSS Customization
2. Add custom CSS to your funnel
3. Override base colors/sizes as needed

**Customizable:**
- Border colors
- Background colors
- Text colors & fonts
- Animation speeds
- Spacing & sizing

---

### Troubleshoot Issues

1. Open [BUMP_SELECTOR_README.md](BUMP_SELECTOR_README.md) → Troubleshooting
2. Find your issue
3. Follow the solution steps

**Common Issues:**
- Bumps not appearing
- Dropdowns not working
- Variants showing in product list
- Order summary not updating
- Animations not smooth

---

### Understand the Architecture

1. Read [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) → Overview
2. Check [BUMP_SELECTOR_README.md](BUMP_SELECTOR_README.md) → Module Responsibilities
3. Review source code with JSDoc comments

---

## 📋 Configuration Template

```javascript
<script>
window.BUMP_CONFIG = [
  {
    mainProductId: 'YOUR_PRODUCT_ID',
    associatedIds: ['VARIANT_1', 'VARIANT_2'],
    includeMainInDropdown: true,
    defaultIndex: 0,
    featuredText: '*BONUS!*',
    preSelected: false
  }
];
</script>
<script src="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-v1.2.7.js"></script>
```

---

## 🚦 Load Order (Critical!)

```html
<!-- 1. Hide variants -->
<script>window.FORCE_HIDE_PRODS = [...]; </script>
<script src="product-row-hider.js"></script>

<!-- 2. Load CSS -->
<link href="bump-selector-base.css">
<link href="bump-selector-fx.css">

<!-- 3. Define config -->
<script>window.BUMP_CONFIG = [...]; </script>

<!-- 4. Load engine -->
<script src="bump-selector-v1.2.7.js"></script>

<!-- 5. CF Pro Tools -->
<script src="cfptaddons.com/...js" defer></script>
```

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Total Files | 6 (2 JS, 2 CSS, 2 Markdown, 1 HTML) |
| JavaScript Engine | 600 lines |
| Base CSS | 60 lines |
| FX CSS | 200 lines (existing) |
| Documentation | 1,200+ lines |
| HTML Footer Reduction | 60% (831 → 331 lines) |
| Reusability | Universal (all funnels) |
| Browser Support | All modern browsers |
| Dependencies | jQuery, ClickFunnels |
| CDN URLs | 3 (js, base.css, fx.css) |

---

## ✅ Checklist for New Funnels

- [ ] Copy footer code template from QUICK_START.md
- [ ] Find your product IDs in ClickFunnels
- [ ] Update mainProductId in BUMP_CONFIG
- [ ] Update associatedIds with your variants
- [ ] Adjust defaultIndex if needed
- [ ] Update featuredText with your badge (optional)
- [ ] Save footer code
- [ ] Test bump selector functionality
- [ ] Test form validation
- [ ] Check order summary updates
- [ ] Test on mobile
- [ ] Customize colors if desired (optional)

---

## 🐛 Getting Help

### For Configuration Issues
→ See [QUICK_START.md](QUICK_START.md) Configuration Options

### For Technical Questions
→ See [BUMP_SELECTOR_README.md](BUMP_SELECTOR_README.md) Architecture Section

### For Troubleshooting
→ See [BUMP_SELECTOR_README.md](BUMP_SELECTOR_README.md) Troubleshooting Section

### For Refactoring Details
→ See [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)

### For Development Issues
→ Check GitHub repo: https://github.com/kratner/ace-media-cfaddins

---

## 🔗 External Resources

| Resource | URL |
|----------|-----|
| GitHub Repository | https://github.com/kratner/ace-media-cfaddins |
| CDN (bump-selector-v1.2.7.js) | https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-v1.2.7.js |
| CDN (bump-selector-base.css) | https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-base.css |
| CDN (bump-selector-fx.css) | https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-fx.css |
| ClickFunnels Docs | https://www.clickfunnels.com/help |
| CF Pro Tools | https://cfptaddons.com |

---

## 📅 Version Information

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| v1.2.7 | Jan 27, 2026 | ✅ Production | Modularized refactor |
| v1.2.6 | Earlier | 📦 Legacy | Available in GitHub history |
| v1.2.5 | Earlier | 📦 Legacy | Available in GitHub history |

---

## 📝 Recent Changes

### v1.2.7 Modularization (Jan 27, 2026)
✅ **NEW:**
- Separate JavaScript engine file
- Separate base CSS file
- Configuration-driven design
- Public API (init, getState, setState)
- Comprehensive documentation
- Quick start guide

✅ **IMPROVED:**
- Code organization & maintainability
- Reusability across funnels
- HTML footer reduced by 60%
- Better caching (external files)
- Easier to update & test

✅ **UNCHANGED:**
- All v1.2.6 features preserved
- All functionality intact
- Compatible with CF Pro Tools
- Same behavior & animations

---

## 🎓 Learning Path

**New to Bump Selector?**
1. Read: [QUICK_START.md](QUICK_START.md) (5 min)
2. Copy: Footer code template
3. Configure: Your BUMP_CONFIG
4. Test: In your funnel

**Want to understand it better?**
1. Read: [BUMP_SELECTOR_README.md](BUMP_SELECTOR_README.md) (15 min)
2. Review: Architecture & modules
3. Explore: Configuration options
4. Customize: Colors & styling

**Integrating with other tools?**
1. Check: CF Pro Tools compatibility
2. Review: Load order requirements
3. Test: Integration scenarios
4. Troubleshoot: Any issues

---

## 📞 Support & Feedback

For bugs, feature requests, or documentation improvements:

**GitHub Issues:** https://github.com/kratner/ace-media-cfaddins/issues

Include:
- Your ClickFunnels order form name
- Product IDs you're using
- Description of issue
- Browser/device info
- Steps to reproduce

---

**Last Updated:** January 27, 2026  
**Maintainer:** Keith Ratner / Entremax Media  
**License:** © 2026 Entremax Media
