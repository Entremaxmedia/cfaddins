# Bump Selector v1.2.7 — Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ClickFunnels Order Form (HTML)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
         ┌──────────▼─────────┐          ┌───────────▼──────────┐
         │ Bump Offer Sections │          │ Product Row Hider   │
         │ (.orderFormBump)    │          │ (External CDN)      │
         └────────────────────┘          └─────────────────────┘
                    │
         ┌──────────▼──────────────────────────────┐
         │ Bump Selector Engine (IIFE)             │
         │ bump-selector-v1.2.7.js                 │
         ├──────────────────────────────────────────┤
         │ Private State:                           │
         │ • BUMPS[] (runtime config)               │
         │ • currentSelections (save/restore)       │
         │ • isUpdatingBumpSelector (flag)          │
         │ • summaryRebuildTimeout (debounce)       │
         ├──────────────────────────────────────────┤
         │ Helper Functions:                        │
         │ • combinedIds()                          │
         │ • findBumpContainerByCfg()               │
         │ • getProductOptionText()                 │
         │ • uncheckAllVariantIds()                 │
         │ • updateOrderSummary()                   │
         ├──────────────────────────────────────────┤
         │ Core Logic:                              │
         │ • buildBumpUI() → Create dropdowns       │
         │ • injectBumpUI() → Insert into DOM       │
         │ • activateBump() → Check + select        │
         │ • deactivateBump() → Uncheck + clear     │
         ├──────────────────────────────────────────┤
         │ Event Handlers:                          │
         │ • bindCheckboxToggle() → On/off          │
         │ • bindSelectChange() → Variant select    │
         │ • bindFormValidation() → Submit check    │
         │ • bindCoreProductChange() → Save/restore │
         ├──────────────────────────────────────────┤
         │ State Management:                        │
         │ • saveCurrentSelections()                │
         │ • restoreSelections()                    │
         ├──────────────────────────────────────────┤
         │ Initialization:                          │
         │ • initFromConfig() → Main entry point    │
         │ • setupOrderSummaryMonitoring()          │
         ├──────────────────────────────────────────┤
         │ Public API:                              │
         │ window.BumpSelector = {                  │
         │   init(configArray)                      │
         │   getState()                             │
         │   setState(state)                        │
         │ }                                        │
         └──────────────────────────────────────────┘
                    │
        ┌───────────┴────────────┬──────────────────┐
        │                        │                  │
        ▼                        ▼                  ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Base Styles    │  │   FX Styles      │  │ User Styles      │
│ (CSS Cascade)   │  │  (Animations)    │  │ (Optional)       │
├─────────────────┤  ├──────────────────┤  ├──────────────────┤
│ Wrapper         │  │ borderShift      │  │ Custom colors    │
│ Select input    │  │ bumpSheen        │  │ Custom fonts     │
│ Label           │  │ microBounce      │  │ Custom sizes     │
│ Focus states    │  │ labelNudge       │  │ Custom anim      │
│ Default option  │  │ errorShake       │  │                  │
│                 │  │ :has() selector  │  │                  │
│ Colors:         │  │ .attention-pulse │  │                  │
│ • Gold border   │  │ prefers-reduced- │  │                  │
│ • Yellow bg     │  │   motion support │  │                  │
│ • Brown text    │  │                  │  │                  │
└─────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Data Flow

### 1. Initialization Flow

```
Page Load (3 second delay)
    ↓
window.BUMP_CONFIG exists?
    ├─ YES → Proceed
    └─ NO → Log warning & exit
    ↓
Create BUMPS[] from config
    ↓
For each bump:
    ├─ Build dropdown UI (if has variants)
    ├─ Find container in DOM
    ├─ Bind checkbox
    ├─ Generate unique checkerId
    └─ Inject UI into page
    ↓
Bind event handlers:
    ├─ Checkbox clicks → activateBump/deactivateBump
    ├─ Select changes → variant selection
    ├─ Form submit → validation
    ├─ Core product changes → save/restore
    └─ Order summary mutations → monitoring
    ↓
Initialize from current state:
    ├─ Apply preSelected flags
    ├─ Reflect checked state in UI
    └─ Trigger CFProTools recognition
    ↓
Setup monitoring:
    └─ Watch order summary for changes
    ↓
✅ READY
```

### 2. User Interaction Flow

```
User clicks bump checkbox
    ↓
Deferred handler (setTimeout(..., 0))
    ↓
Is checked?
    ├─ YES → activateBump()
    │         ├─ Show dropdown
    │         ├─ Uncheck all variants
    │         ├─ Select default variant
    │         ├─ Check selected variant in form
    │         └─ updateOrderSummary() (debounced)
    │
    └─ NO → deactivateBump()
            ├─ Uncheck all variants
            ├─ Hide dropdown
            └─ updateOrderSummary() (debounced)
    ↓
User selects from dropdown
    ↓
Select change event
    ↓
Uncheck all variants (except new)
    ↓
Check new variant in form
    ↓
updateOrderSummary() (debounced)
    ↓
CFProTools rebuilds order summary
    ↓
✅ Updates reflected
```

### 3. State Persistence Flow

```
Core product changes
    ↓
Change event fired: [name="purchase[product_id]"]
    ↓
saveCurrentSelections()
    ├─ For each bump:
    │   └─ Save: checked state, selected variant, visibility
    │
Wait 600ms (allow CFProTools to process)
    ↓
restoreSelections()
    ├─ isUpdatingBumpSelector = true (prevent loops)
    ├─ For each bump:
    │   ├─ Restore checkbox state
    │   ├─ Restore select value
    │   ├─ Ensure correct variants checked
    │   └─ Restore visibility
    │
    ├─ After 100ms:
    │   ├─ isUpdatingBumpSelector = false
    │   ├─ Trigger change events
    │   ├─ forceOrderSummaryRebuild()
    │   │
    │   └─ After 200ms (catch late updates):
    │       └─ forceOrderSummaryRebuild()
    │
✅ Selections preserved
```

### 4. Order Summary Sync Flow

```
Order summary mutations detected
    ↓
MutationObserver callback fires
    ↓
isUpdatingBumpSelector?
    ├─ YES → Ignore (we're updating)
    └─ NO → Check for missing bumps
        ├─ For each checked bump:
        │   └─ Is product ID in summary?
        │       └─ NO → Set needsRebuild = true
        │
        └─ needsRebuild?
            └─ YES → setTimeout(forceOrderSummaryRebuild, 100)
                     ↓
                     ✅ Summary rebuilt with missing bumps
```

---

## Component Relationships

```
                    window.BUMP_CONFIG
                           ↑
                           │
                      Reads from
                           │
    ┌──────────────────────────────────────┐
    │  Bump Selector Engine (v1.2.7)       │
    │  (bump-selector-v1.2.7.js)           │
    └──────────────────────────────────────┘
     │              │              │
     │ Writes       │ Reads        │ Listens
     │              │              │
     ▼              ▼              ▼
DOM Elements  Form Products  Events
  .orderFormBump    ├─ [name="purchase[product_ids][]"]
  input[id^="bump-"]├─ [name="purchase[product_id]"]
  select           ├─ .elOrderProductOptinsLineItems
  label            └─ (changes/mutations)
     │
     │ Styled by
     │
     ├─► bump-selector-base.css
     │   (core styling)
     │
     └─► bump-selector-fx.css
         (animations & effects)

     │
     │ Interacts with
     │
     └─► CF Pro Tools Scripts
         • Order Summary rebuild
         • Multiple Bumps add-in
         • Bump Content add-in
         • etc.
```

---

## File Dependencies

```
┌──────────────────────────────────────────────────────────────┐
│ Funnel Footer HTML                                           │
│ (TrumpGoldBundle2.0_F+S_FooterCode_BUMPSELECTORFX_CDN02.html)│
└──────────────────────────────────────────────────────────────┘
  │
  ├─► Load (external)
  │   └─ product-row-hider.js
  │       └─ Uses: window.FORCE_HIDE_PRODS
  │
  ├─► Load (external)
  │   └─ bump-selector-base.css
  │       No dependencies (pure CSS)
  │
  ├─► Load (external)
  │   └─ bump-selector-fx.css
  │       Depends on: bump-selector-base.css (cascade)
  │
  ├─► Configure
  │   └─ window.BUMP_CONFIG = [...]
  │       (User-defined data)
  │
  ├─► Load (external)
  │   └─ bump-selector-v1.2.7.js
  │       Requires:
  │       ├─ jQuery (ClickFunnels provides)
  │       ├─ window.BUMP_CONFIG (defined above)
  │       └─ window.rebuildOrderSummary (from CF Pro Tools)
  │
  └─► Load (external)
      └─ CF Pro Tools scripts (defer)
          Depends on: bump-selector-v1.2.7.js
          └─ Uses rebuildOrderSummary called by engine
```

---

## CSS Cascade

```
Loaded in Order (Important!)
    ↓

1️⃣  bump-selector-base.css
    ├─ Wrapper: [class^="bump-selector-wrap"]
    ├─ Select:  select
    ├─ Label:   .quantity-selector-label
    ├─ Colors:  Gold/Yellow/Brown
    └─ Base styling foundation

    ↓ Cascade down to FX styles

2️⃣  bump-selector-fx.css
    ├─ Animations: @keyframes
    ├─ Enhanced:   :has() selector
    ├─ Fallback:   .attention-pulse
    ├─ Override:   Adds animation, box-shadow
    └─ Builds on base styles

    ↓ Optional override

3️⃣  User Custom CSS (optional)
    ├─ Custom colors
    ├─ Custom fonts
    ├─ Custom sizing
    └─ Custom animations
```

---

## State Diagram

```
┌─────────────────────────────────────────────────────┐
│              Bump States                            │
└─────────────────────────────────────────────────────┘

         ┌─ UNCHECKED ─┐
         │             │
    User │             │ User
    Click │             │ Click
         │             │
         ▼             ◄
    ┌─────────────────────┐
    │  ✓ ACTIVE / CHECKED │
    │  ├─ Checkbox ON     │
    │  ├─ Dropdown shown  │
    │  ├─ Variant selected│
    │  ├─ CSS animated    │
    │  └─ Product checked │
    └─────────────────────┘

Variant Selection
    │
    ├─ User selects from dropdown
    │   ↓
    │  Previous variant → unchecked
    │  Selected variant → checked
    │  currentValue → updated
    │  Order Summary → rebuilt
    │
    └─ currentValue holds selected variant ID
       (or '' if unchecked)

State Persistence
    │
    ├─ Core product changes
    │   ↓
    │  Save current selections
    │  Reset form (CFProTools)
    │  Restore bump state
    │  Trigger rebuilds
    │
    └─ BumpSelector.getState() / setState()
       Manual state management
```

---

## Event Flow Diagram

```
User Interaction Events
┌───────────────────────────────────────────────────────┐

CLICK CHECKBOX
    │
    └─ Deferred Handler (setTimeout 0)
        ├─ Check if updating?
        │   └─ If yes, exit (prevent loop)
        │
        ├─ Is now checked?
        │   ├─ YES → activateBump()
        │   └─ NO  → deactivateBump()
        │
        └─ updateOrderSummary() [debounced 50ms]
            └─ Calls: rebuildOrderSummary()

SELECT CHANGE
    │
    └─ Select change event
        ├─ New variant value?
        ├─ Uncheck all others
        ├─ Check selected
        ├─ Save to currentValue
        │
        └─ updateOrderSummary() [debounced 50ms]
            └─ Calls: rebuildOrderSummary()

CORE PRODUCT CHANGE
    │
    └─ Change: [name="purchase[product_id]"]
        ├─ saveCurrentSelections()
        │
        └─ setTimeout 600ms
            └─ restoreSelections()
                ├─ Restore all bump states
                ├─ Restore variant values
                ├─ setTimeout 100ms
                │   └─ forceOrderSummaryRebuild()
                │
                └─ setTimeout 200ms (200ms total)
                    └─ forceOrderSummaryRebuild()

FORM SUBMIT
    │
    └─ Click: a[href="#submit-form"]
        └─ For each bump:
            ├─ Is checked?
            │   └─ Does have variant selected?
            │       └─ NO → Error!
            │           ├─ Add .elInputError
            │           ├─ Shake animation
            │           ├─ Scroll to error
            │           └─ Prevent submit
            │
            └─ All checks pass?
                └─ Allow submit

ORDER SUMMARY MUTATION
    │
    └─ MutationObserver detects change
        ├─ Are we updating?
        │   └─ If yes, ignore
        │
        ├─ Check for missing bumps
        │   └─ Checked bumps missing from summary?
        │
        └─ YES → setTimeout 100ms
            └─ forceOrderSummaryRebuild()

└───────────────────────────────────────────────────────┘
```

---

## Timing Diagram

```
Page Load Timeline
├─ T+0ms    Page loaded
├─ T+0ms    jQuery ready event fires
├─ T+3000ms (3 second delay)
│           initFromConfig() called
│           ├─ Read window.BUMP_CONFIG
│           ├─ Create BUMPS[] from config
│           ├─ Build dropdown UIs
│           ├─ Find & bind checkboxes
│           ├─ Inject UI into DOM
│           ├─ Bind event handlers
│           ├─ Apply initial state
│           └─ Setup monitoring
│
├─ T+3100ms setTimeout 100ms (CFProTools recognition)
│           ├─ Trigger change events
│           └─ forceOrderSummaryRebuild()
│
├─ T+3150ms setTimeout 50ms (order summary rebuild)
│           └─ rebuildOrderSummary()
│
└─ T+3350ms setTimeout 200ms (catch late updates)
            └─ forceOrderSummaryRebuild()

User Interaction Timeline
├─ T+X ms   User clicks bump checkbox
├─ T+0ms    Deferred handler (setTimeout 0)
│           ├─ activateBump() or deactivateBump()
│           └─ updateOrderSummary() called
│
├─ T+50ms   Debounced rebuild executes
│           └─ rebuildOrderSummary()
│
└─ T+Y ms   Order summary visibly updates

State Persistence Timeline
├─ T+X ms   Core product changes
├─ T+0ms    saveCurrentSelections()
│
├─ T+600ms  restoreSelections() called
│           ├─ Restore all bump states
│           └─ isUpdatingBumpSelector = false (after 100ms)
│
├─ T+100ms  (from start of restore)
│           ├─ Trigger change events
│           └─ forceOrderSummaryRebuild()
│
├─ T+300ms  (from start of restore)
│           └─ forceOrderSummaryRebuild() [2nd attempt]
│
└─ Complete ✅
```

---

## Troubleshooting Decision Tree

```
Bumps Not Working?
    │
    ├─ Bumps not appearing?
    │   ├─ Is window.BUMP_CONFIG defined?
    │   │   ├─ NO  → Define before script load
    │   │   └─ YES → Check browser console
    │   │
    │   ├─ Is jQuery loaded?
    │   │   ├─ NO  → ClickFunnels should provide
    │   │   └─ YES → Check for JS errors
    │   │
    │   └─ Check CSS loads
    │       └─ Network tab: bump-selector-*.css
    │
    ├─ Dropdowns don't work?
    │   ├─ Are product IDs correct?
    │   │   └─ Check ClickFunnels form
    │   │
    │   ├─ Is jQuery working?
    │   │   └─ console.log(typeof jQuery)
    │   │
    │   └─ Browser console errors?
    │       └─ Fix JS errors first
    │
    ├─ Variants show in product list?
    │   ├─ Is window.FORCE_HIDE_PRODS set?
    │   │   └─ Add all variant IDs
    │   │
    │   └─ Is product-row-hider.js loaded?
    │       └─ Check Network tab
    │
    └─ Order summary not updating?
        ├─ Is rebuildOrderSummary() available?
        │   └─ Check CF Pro Tools installed
        │
        └─ Manual test:
            └─ console: rebuildOrderSummary()
```

---

**Diagram Version:** 1.2.7  
**Last Updated:** January 27, 2026  
**Purpose:** Visual reference for bump selector architecture
