# Bump Selector v1.2.10 — Documentation Index

**Latest:** August 25, 2026 (v1.2.10) — see [Recent Changes](#-recent-changes)  
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
**File:** `bump-selector-v1.2.10.js` (~615 lines) — current version. `bump-selector-v1.2.9.js`, `bump-selector-v1.2.8.js`, and `bump-selector-v1.2.7.js` remain for funnels already pointed at them (never delete/rename live CDN files).

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
<script src="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-v1.2.10.js"></script>
```

**Note:** `window.BUMP_CONFIG` array order no longer needs to match the live DOM order of the bump blocks (fixed in v1.2.8 — see [Recent Changes](#-recent-changes)). v1.2.9 and v1.2.10 each fix a different race that could leave two variants of the same bump checked and charged together — see [Recent Changes](#-recent-changes).

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
<script src="bump-selector-v1.2.10.js"></script>

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
| CDN (bump-selector-v1.2.10.js) | https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-v1.2.10.js |
| CDN (bump-selector-v1.2.9.js, legacy) | https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-v1.2.9.js |
| CDN (bump-selector-v1.2.8.js, legacy) | https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-v1.2.8.js |
| CDN (bump-selector-v1.2.7.js, legacy) | https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-v1.2.7.js |
| CDN (bump-selector-base.css) | https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-base.css |
| CDN (bump-selector-fx.css) | https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/bump-selector-fx.css |
| ClickFunnels Docs | https://www.clickfunnels.com/help |
| CF Pro Tools | https://cfptaddons.com |

---

## 📅 Version Information

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| v1.2.10 | Aug 25, 2026 | ✅ Production (current) | Fixed the "notify CF Pro Tools" change-trigger (in initFromConfig + restoreSelections) re-checking a bump's mainProductId on top of the selected variant |
| v1.2.9 | Aug 17, 2026 | 📦 Legacy | Fixed restoreSelections() leaving two variants of the same bump checked/charged after a main-product change — still live for funnels pointed at it |
| v1.2.8 | Jul 24, 2026 | 📦 Legacy | Bump containers matched by product ID (data-title), no longer order-dependent — still live for funnels pointed at it |
| v1.2.7 | Jan 27, 2026 | 📦 Legacy | Modularized refactor — still live for funnels pointed at it |
| v1.2.6 | Earlier | 📦 Legacy | Available in GitHub history |
| v1.2.5 | Earlier | 📦 Legacy | Available in GitHub history |

---

## 📝 Recent Changes

### v1.2.10 Fixed Duplicate Variant Charge on the CFPT Notify-Trigger (Aug 25, 2026)

**Bug fixed:** v1.2.9 (below) closed one duplicate-charge race but left a
second, related one. Both `initFromConfig()`'s startup pass and
`restoreSelections()` end by calling `cfg.$visibleChk.trigger('change')` on
each checked bump's native visible checkbox — necessary so CF Pro Tools'
"Multiple Bumps" add-in registers the bump as active in its own bookkeeping.

Inspecting CF Pro Tools' actual source confirmed the mechanism: at page
load, "Multiple Bumps" hardcodes that checkbox's `value` attribute to the
bump's `mainProductId` (`.find('[name="purchase[product_ids][]"]').val(bumpId)`),
independent of whatever variant our dropdown has selected, and binds
`.orderFormBump input[type="checkbox"][name="purchase[product_ids][]"]`'s
`change` event to unconditionally set `#cfAR`'s mirror checkbox for that
`value` to `checked` — with no clearing of sibling variant checkboxes. Our
notify-trigger fires this handler **after** we'd already correctly enforced
single-variant exclusivity, so CF Pro Tools re-checked the base/mainProductId
variant on top of the one we'd just set, with nothing downstream to correct
it — both got submitted.

**Real order affected:** 1st Hour Trauma First Aid Kit funnel (13688167),
Launch - Long Copy step, reported 8/25/2026 — shopper was charged for both
"1 Expert Survivalist Kit" ($29.00) + "2 Expert Survivalist Kits, 15% Off"
($49.30), and both "1 Water Filter Straw" ($19.95) + "2 Water Filter Straws,
15% Off" ($33.92), in the same transaction after switching the main product
tier to "3 Trauma First Aid Kit."

**Fix:** new `enforceExclusivityAfterNotify()` re-runs
`uncheckAllVariantIds(cfg, cfg.currentValue)` + re-checks `cfg.currentValue`
immediately after the notify-trigger loop, in both `initFromConfig()` and
`restoreSelections()`, so our selection is always the last word before the
final order-summary rebuild.

✅ **Backwards compatible:** no `BUMP_CONFIG` changes required. Affects any
funnel with a variant-dropdown bump and the CF Pro Tools "Multiple Bumps" /
"Bump Content" add-ins — broader than the v1.2.9 case, since it doesn't
require a main-product-tier change to trigger on initial page load (though
the 1st Hour report did involve one).

**Not yet independently verified live** — this fix is grounded in reading CF
Pro Tools' actual "Multiple Bumps" source (`cdn.cfptaddons.com/...`) rather
than a reproduced browser test. **Test on the 1st Hour Launch - Long Copy
order form before rolling to other funnels.**

**Existing funnels:** stay on `bump-selector-v1.2.9.js` or earlier unless
switched to v1.2.10 — nothing was renamed or removed. Prioritize any funnel
combining a variant-dropdown bump with CF Pro Tools' "Multiple Bumps" /
"Bump Content" add-ins for the upgrade.

### v1.2.9 Fixed Duplicate Variant Charge on Main-Product Change (Aug 17, 2026)

**Bug fixed:** Every code path that checks a bump variant — `activateBump()` and
the dropdown's `change` handler — calls `uncheckAllVariantIds()` first to make
sure only one variant of a bump (e.g. "1 CPR Car Kit" vs. "2 CPR Car Kits, 15%
Off") is ever checked at a time. `restoreSelections()` — fired ~600ms after the
shopper changes the **main product/tier** (`bindCoreProductChange`) — was the
one path that skipped this step. It re-checked the previously-saved variant
directly, without clearing sibling variant IDs first.

CF Pro Tools' "Bump Content" / "Multiple Bumps" add-ins re-render and
re-default a bump's native checkbox whenever the main product changes. When
that happened inside the 600ms window between `saveCurrentSelections()` and
`restoreSelections()`, the saved variant got checked **on top of** the add-in's
own default checkbox instead of replacing it — leaving both checked, and both
submitted as separate paid line items.

**Real order affected:** 1st Hour Trauma First Aid Kit funnel (13688167),
Launch - Long Copy step, 8/11/2026 — shopper switched the main product to the
5-Kit Full Family Bundle tier and was charged for both "1 CPR Car Kit"
($29.99) and "2 CPR Car Kits, 15% Off" ($50.98) in the same transaction.

**Fix:** `restoreSelections()` now calls `uncheckAllVariantIds()` before
re-checking the saved value, matching `activateBump()` and the select
`change` handler.

✅ **Backwards compatible:** no `BUMP_CONFIG` changes required. Only affects
the restore-after-main-product-change path; funnels without multiple main
product tiers, or without a variant-dropdown bump, were never exposed to this.

**Existing funnels:** stay on `bump-selector-v1.2.8.js` or `v1.2.7.js` unless
switched to v1.2.9 — nothing was renamed or removed. Any funnel that offers
more than one main-product tier **and** a quantity/variant bump dropdown
should be prioritized for the upgrade, since that's the exact combination that
triggers the bug.

### v1.2.8 Order-Independent Bump Matching (Jul 24, 2026)

**Bug fixed:** `findBumpContainerByCfg()` located each bump's `.orderFormBump`
wrapper by first searching for a `<input type="radio" value="{productId}">`
and walking up to `.closest('.orderFormBump')`. On pages where CF's bump
checkboxes carry no product ID (they're often just a generic, non-unique
`id="bump-offer"`), that lookup always failed and matching silently fell back
to pairing `window.BUMP_CONFIG` array position with `.orderFormBump` DOM
position. If CF Pro Tools' "Multiple Bumps"/"Bump Content" add-ins rendered
the bump blocks in a different order than the config array listed them, a
bump's dropdown/badge got injected into a *different* bump's header —
e.g. two variant bumps' quantity dropdowns and discount badges swapping with
each other, and the order summary showing the wrong line item for what was
checked.

**Fix:** container lookup now tries `[data-title="cf-multi-bump-{productId}"]`
first — the wrapper CF Pro Tools' "Multiple Bumps" add-in already tags with
the real product ID, independent of DOM order — before falling back to the
old radio-lookup and positional-index behavior. `window.BUMP_CONFIG` entries
no longer need to be listed in the same order the bumps render on the page.

✅ **Backwards compatible:** the v1.2.7 radio-lookup and positional-index
fallbacks are unchanged and still run if the data-title match finds nothing,
so any funnel without CF Pro Tools' "Multiple Bumps" markup behaves exactly
as before. No BUMP_CONFIG changes required to adopt v1.2.8.

**Existing funnels:** stay on `bump-selector-v1.2.7.js` unless/until you
switch them to v1.2.8 — per the CDN safety rules, nothing was renamed or
removed.

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

**Last Updated:** August 25, 2026  
**Maintainer:** Keith Ratner / Entremax Media  
**License:** © 2026 Entremax Media
