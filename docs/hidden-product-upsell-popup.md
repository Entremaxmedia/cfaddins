# Hidden Product Upsell Popup Documentation

**Version:** 3.5.0  
**Last Updated:** December 17, 2025  
**Authors:** Keith Ratner, Alec Keith  
**Repository:** [kratner/ace-media-cfaddins](https://github.com/kratner/ace-media-cfaddins)

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Setup Guide](#setup-guide)
4. [Configuration Reference](#configuration-reference)
5. [Modal Design Guidelines](#modal-design-guidelines)
6. [Usage Example](#usage-example)
7. [Advanced Features](#advanced-features)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)
10. [Changelog](#changelog)

---

## Overview

The Hidden Product Upsell Popup is a JavaScript-based solution for ClickFunnels order forms that creates dynamic upsell popups triggered when customers select specific products. When a trigger product is selected, a modal appears offering an upgrade to a better/larger package, seamlessly replacing the original selection if accepted.

### Key Features

- **Trigger-Based Popups**: Automatically show upsell modal when specific products are selected
- **Product Swapping**: Seamlessly swap trigger product with upsell product
- **Hidden Products**: Automatically hide upsell products from main form until triggered
- **Multi-Product Hiding**: Hide additional products when upsell is accepted (v3.5.0)
- **Revert Capability**: Customers can click upgraded product to revert to original selection
- **Custom Modal Design**: Design popup content directly in ClickFunnels editor
- **Flexible CTA Buttons**: Use default buttons or design custom CTAs
- **Color Customization**: Per-upsell button color overrides
- **ClickFunnels Integration**: Works with existing CF order forms and addons
- **Console Logging**: Comprehensive debugging output

### Use Cases

- **Quantity Upsells**: Offer 3x or 5x when customer selects 1x
- **Package Upgrades**: Basic → Premium, Standard → VIP
- **Bundle Offers**: Single product → Complete set
- **Premium Variants**: Regular → Deluxe version
- **Cross-Sells**: Product A → Product A + Bonus B

---

## How It Works

### Workflow Overview

```
1. Customer selects "trigger" product (e.g., 1x Coin)
   ↓
2. Popup appears with upsell offer (e.g., 5x Coin Set)
   ↓
3. Customer clicks "Yes" → Upsell product selected, trigger hidden
   OR
   Customer clicks "No" → Popup closes, trigger remains selected
   ↓
4. If "Yes" selected: Upgraded product row highlighted with red border
   ↓
5. Customer can click highlighted row to revert to original
```

### Technical Process

1. **Product Hiding**: Upsell products are hidden from main product selection on page load
2. **Modal Harvesting**: Modal content sections are extracted from page and stored
3. **Trigger Detection**: Script listens for product selection changes
4. **Modal Display**: When trigger product selected, corresponding modal is shown
5. **Product Swap**: On acceptance, trigger product is hidden and upsell product is shown/selected
6. **Revert Option**: Accepted upsell products are marked with data attributes for reversion
7. **Additional Hiding**: Extra products can be hidden when specific upsells are accepted (v3.5.0)

---

## Setup Guide

### Step 1: Create Products in ClickFunnels

1. **Create trigger product(s)**: The base products customers will see initially
2. **Create upsell product(s)**: One unique product per upsell (these will be hidden initially)

**Best Practice:** Use CFProTools "Rearrange Products" addon to ensure hidden products appear in the same relative position as the products they replace.

### Step 2: Test with Variations

Before activating on your live page:
1. Create a Variation of your order form
2. Implement the popup code on the Variation
3. Test thoroughly
4. Activate on main page once verified

### Step 3: Design Modal Content

In the ClickFunnels editor, create sections for your popup content:

#### Option A: Product-Specific Modal
Set Section Title to: `cf-upsell-modal-{productID}`

Example: `cf-upsell-modal-5022043` for product ID 5022043

#### Option B: Global Fallback Modal
Set Section Title to: `cf-upsell-modal`

This will be used for any upsell without a specific modal section.

#### Modal Design Guidelines

Your modal section should include:
- **Red headline** saying "Congratulations!"
- **Subheadline** explaining the deal
- **Retail value** of the complete set
- **Product image** showcasing the offer
- **Simplified text** explaining benefits
- **Optional: Custom CTA buttons** (see below)

**Note:** By default, buttons are automatically generated. Only add custom buttons if you want more design control.

### Step 4: Add Configuration and Script

Add this code to your ClickFunnels order form footer:

```html
<script>
// Configure upsell behavior
window.UPSELL_CONFIG = {
  // Product IDs to hide (your upsell products)
  hideProds: ['5022043'],
  
  // Map trigger products to upsell products
  replaceMap: { 
    '5009059': '5022043'  // trigger ID → upsell ID
  },
  
  // Optional: Hide additional products when upsell is accepted
  alsoHideOnUpsell: { 
    '5022043': ['5009061']  // upsell ID → [additional IDs to hide]
  },
  
  // Optional: Customize default button text
  ctaDefaults: {
    ctaYes: 'Yes, Upgrade My Order Now!',
    ctaNo: "No, Thanks. I Don't Want This Upgrade"
  },
  
  // Optional: Customize button colors (global defaults)
  ctaColors: {
    yesBg: 'rgb(18,183,0)',
    yesText: '#ffffff',
    yesSheen: 'rgba(255,255,255,.3)',
    yesShadow: 'rgba(0,0,0,.12)',
    noBg: 'red',
    noText: 'white'
  },
  
  // Optional: Per-upsell color overrides
  ctaColorOverrides: {
    // '5022043': { 
    //   yesBg: '#28a745', 
    //   yesText: '#fff', 
    //   noText: '#666' 
    // }
  }
};
</script>

<!-- Load Hidden Product Upsell Popup script from CDN -->
<script src="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/hidden-product-upsell-popup.js"></script>
```

---

## Configuration Reference

### UPSELL_CONFIG Object Structure

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `hideProds` | Array\<String\> | Yes | Array of product IDs to hide (your upsell products) |
| `replaceMap` | Object | Yes | Maps trigger product IDs to upsell product IDs |
| `alsoHideOnUpsell` | Object | No | Maps upsell IDs to additional products to hide when accepted |
| `ctaDefaults` | Object | No | Custom text for default Yes/No buttons |
| `ctaColors` | Object | No | Global default colors for CTA buttons |
| `ctaColorOverrides` | Object | No | Per-upsell color overrides keyed by upsell product ID |

### Configuration Examples

#### Basic Single Upsell

```javascript
window.UPSELL_CONFIG = {
  hideProds: ['5022043'],
  replaceMap: { '5009059': '5022043' }
};
```

#### Multiple Upsells

```javascript
window.UPSELL_CONFIG = {
  hideProds: ['5022043', '5022044', '5022045'],
  replaceMap: { 
    '5009059': '5022043',  // 1x → 3x
    '5009060': '5022044',  // Basic → Premium
    '5009061': '5022045'   // Single → Bundle
  }
};
```

#### With Multi-Product Hiding (v3.5.0)

```javascript
window.UPSELL_CONFIG = {
  hideProds: ['5022043'],
  replaceMap: { '5009059': '5022043' },
  
  // When product 5022043 is accepted, also hide products 5009061 and 5009062
  alsoHideOnUpsell: { 
    '5022043': ['5009061', '5009062']
  }
};
```

**Use Case:** When customer accepts upsell, you might want to hide conflicting or redundant options.

#### With Custom Colors Per Upsell

```javascript
window.UPSELL_CONFIG = {
  hideProds: ['5022043', '5022044'],
  replaceMap: { 
    '5009059': '5022043',
    '5009060': '5022044'
  },
  
  // Different colors for each upsell
  ctaColorOverrides: {
    '5022043': { 
      yesBg: 'rgb(255,140,0)',  // Orange for first upsell
      yesText: '#fff'
    },
    '5022044': { 
      yesBg: 'rgb(138,43,226)',  // Purple for second upsell
      yesText: '#fff'
    }
  }
};
```

---

## Modal Design Guidelines

### Section Naming Convention

**Product-Specific Modal:**
```
Section Title: cf-upsell-modal-5022043
```
Use this format when you want different modal designs for different upsells.

**Global Fallback Modal:**
```
Section Title: cf-upsell-modal
```
Use this as a catch-all for any upsell without a specific modal.

### Custom CTA Buttons (Optional)

If you want to design your own buttons instead of using the defaults:

**Yes Button:**
```html
<button data-upsell-yes>
  Yes, I Want This Upgrade!
</button>
```

**No Button:**
```html
<button data-upsell-no>
  No Thanks
</button>
```

**Important:** Both `data-upsell-yes` and `data-upsell-no` attributes must be present for custom buttons to work. Otherwise, default buttons will be added.

### Recommended Modal Structure

```
┌─────────────────────────────────────┐
│  🎉 CONGRATULATIONS!                │  ← Red headline
├─────────────────────────────────────┤
│  Special Upgrade Available          │  ← Subheadline
│                                     │
│  [Product Image]                    │  ← Visual
│                                     │
│  Get the Complete 5-Piece Set!      │  ← Description
│  Retail Value: $299                 │  ← Value prop
│  Today Only: $199                   │  ← Offer
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Yes, Upgrade My Order Now!    │  │  ← CTA buttons
│  └───────────────────────────────┘  │  (auto-generated
│  No, Thanks. I Don't Want This     │  or custom)
└─────────────────────────────────────┘
```

---

## Usage Example

### Complete Implementation

See **orderforms/testform-hidden-product-replacement-upsell.html** for a full working example.

#### Scenario: Department of Defense Coin Upsell

**Products:**
- Trigger Product: `5009059` - Single DOD Coin ($29)
- Upsell Product: `5022043` - 5-Piece DOD Coin Set ($99)
- Also Hide: `5009061` - 3-Piece Set (conflicts with 5-piece set)

**Configuration:**

```html
<script>
window.UPSELL_CONFIG = {
  hideProds: ['5022043'],
  replaceMap: { '5009059': '5022043' },
  alsoHideOnUpsell: { '5022043': ['5009061'] },
  
  ctaDefaults: {
    ctaYes: 'Yes, Upgrade My Order Now!',
    ctaNo: "No, Thanks. I Don't Want This Upgrade"
  },
  
  ctaColors: {
    yesBg: 'rgb(18,183,0)',
    yesText: '#ffffff',
    yesSheen: 'rgba(255,255,255,.3)',
    yesShadow: 'rgba(0,0,0,.12)',
    noBg: 'red',
    noText: 'white'
  }
};
</script>
<script src="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/hidden-product-upsell-popup.js"></script>
```

**Modal Section in Editor:**
- Section Title: `cf-upsell-modal-5022043`
- Content: Congratulations message, product image, value proposition, benefits

**Customer Flow:**
1. Customer selects "Single DOD Coin" ($29)
2. Popup appears: "Upgrade to 5-Piece Set for only $99!"
3. If Yes: 5-Piece Set selected, Single Coin hidden, 3-Piece Set also hidden
4. Customer can click red-bordered row to revert back to Single Coin

---

## Advanced Features

### Multi-Product Hiding (v3.5.0)

Hide additional products when an upsell is accepted:

```javascript
alsoHideOnUpsell: { 
  '5022043': ['5009061', '5009062', '5009063']
}
```

**When to use:**
- Hide lower-tier options when customer accepts higher-tier upsell
- Remove conflicting product combinations
- Clean up form after premium selection

**Behavior:**
- Additional products are hidden when upsell is accepted
- Additional products are restored if customer reverts
- Persists through ClickFunnels DOM updates

### Per-Upsell Color Customization

Different color schemes for different upsells:

```javascript
ctaColorOverrides: {
  '5022043': { 
    yesBg: '#ff6b35',      // Bold orange
    yesText: '#ffffff',
    noBg: '#004e89',       // Navy blue
    noText: '#ffffff'
  },
  '5022044': { 
    yesBg: '#7209b7',      // Purple
    yesText: '#ffffff',
    noBg: '#f72585',       // Pink
    noText: '#ffffff'
  }
}
```

### Image Hydration

The script automatically handles lazy-loaded images:
- Converts `data-src`, `data-cfsrc`, `data-lazy` to `src`
- Handles protocol-relative URLs (`//cdn.example.com/image.jpg`)
- Forces eager loading for modal images

### ClickFunnels Compatibility

Works seamlessly with:
- CFProTools addons (Multiple Bumps, Rearrange Products, etc.)
- ClickFunnels Classic order forms
- jQuery-based ClickFunnels environment
- Order summary updates via `rebuildOrderSummary()`

---

## API Reference

### Global Variables

#### window.UPSELL_CONFIG
- **Type:** `Object`
- **Required:** Yes
- **Description:** Configuration object defining all upsell behaviors
- **Must be defined:** Before loading `hidden-product-upsell-popup.js`

#### window.UPSELL_POPUP_INITIALIZED
- **Type:** `Boolean`
- **Set by:** Upsell popup script
- **Description:** Flag indicating popup has been initialized (prevents double initialization)

### CSS Classes

#### .upsellBC-backdrop
- **Applied to:** Modal overlay background
- **Styling:** Full-screen fixed overlay with semi-transparent black background

#### .upsellBC-box
- **Applied to:** Modal container
- **Styling:** White rounded box with shadow, max-width 680px

#### .upsellBC-body
- **Applied to:** Modal content container
- **Purpose:** Holds injected editor content

#### .upsellBC-actions
- **Applied to:** CTA button container
- **Styling:** Flexbox column layout with centered alignment

#### .upsellBC-yes
- **Applied to:** Accept/upgrade button
- **Styling:** Green background with shine animation, 2rem font size

#### .upsellBC-no
- **Applied to:** Decline button
- **Styling:** Red background or text link styling

#### [data-upsell-hilite="1"]
- **Applied to:** Selected upsell product rows
- **Styling:** Red dashed border, clickable for revert
- **Data Attributes:**
  - `data-upsell-from`: Original trigger product ID
  - `data-upsell-to`: Accepted upsell product ID
  - `data-upsell-extras`: Comma-separated list of additionally hidden product IDs

### Events

| Event | Target | Purpose |
|-------|--------|---------|
| `change` | `input[type="radio"][name="purchase[product_id]"]` | Detect product selection to trigger popup |
| `click` | `[data-upsell-yes]`, `.upsellBC-yes` | Accept upsell offer |
| `click` | `[data-upsell-no]`, `.upsellBC-no` | Decline upsell offer |
| `click` | `[data-upsell-hilite="1"]` | Open revert confirmation modal |
| `click` | `#revertYes` | Confirm revert to original product |
| `click` | `#revertNo` | Keep upgraded product |
| `click` | `.upsellBC-backdrop` (outside) | Close modal |

### Console Logging

The script provides comprehensive console output for debugging:

```
[Upsell Popup] Initializing v3.5.0...
[Upsell Popup] Configuration loaded: { hideProds: 1, replaceMappings: 1, alsoHideRules: 1 }
[Upsell Popup] jQuery ready, initializing styles and modals...
[Upsell Popup] Styles injected
[Upsell Popup] Hiding 1 upsell product(s)...
[Upsell Popup] Hidden product: 5022043
[Upsell Popup] Harvesting modal sections from editor...
[Upsell Popup] Harvested modal for product ID: 5022043
[Upsell Popup] Modal shells created
[Upsell Popup] Trigger activated: 5009059 → 5022043
[Upsell Popup] Opening modal: 5009059 → 5022043
[Upsell Popup] Accepted upsell: 5009059 → 5022043
[Upsell Popup] Also hiding 1 additional product(s): ["5009061"]
[Upsell Popup] Initialization complete
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Popup Not Appearing

**Symptoms:** Customer selects trigger product but no popup shows

**Possible Causes:**
- `window.UPSELL_CONFIG` not defined before script loads
- Product IDs don't match ClickFunnels product IDs
- jQuery not loaded
- Modal section not created in editor

**Solutions:**
```javascript
// Check console for errors:
// "[Upsell Popup] window.UPSELL_CONFIG must be defined before loading this script"

// Verify configuration is defined BEFORE script tag:
<script>
window.UPSELL_CONFIG = { /* config */ };
</script>
<script src="hidden-product-upsell-popup.js"></script>  // AFTER config

// Check product IDs match exactly:
console.log($('input[type="radio"][value="YOUR_TRIGGER_ID"]').length);
// Should return > 0 if product exists

// Verify jQuery is loaded:
console.log(typeof jQuery);  // Should return "function"

// Check if modal was harvested:
// Look for console message: "[Upsell Popup] Harvested modal for product ID: ..."
```

---

#### 2. Upsell Product Visible on Page Load

**Symptoms:** Upsell product appears in main product list

**Possible Causes:**
- Product ID not in `hideProds` array
- Product ID doesn't match
- Script timing issue

**Solutions:**
```javascript
// Verify hideProds configuration:
console.log(window.UPSELL_CONFIG.hideProds);

// Check if product was hidden:
// Look for console message: "[Upsell Popup] Hidden product: 5022043"

// Force manual hiding test:
$('input[type="radio"][value="UPSELL_PRODUCT_ID"]')
  .closest('.elOrderProductOptinProducts')
  .hide();
```

---

#### 3. Default Buttons Not Showing

**Symptoms:** Modal appears but has no buttons

**Possible Causes:**
- Custom buttons partially defined (missing `data-upsell-yes` or `data-upsell-no`)
- Modal content structure issue
- CSS conflicting with button injection

**Solutions:**
```javascript
// Check if buttons exist:
console.log($('#upsellBC [data-upsell-yes]').length);
console.log($('#upsellBC .upsellBC-yes').length);

// Verify modal body HTML:
console.log($('#upsellBC-body').html());

// Force button injection:
$('#upsellBC-body').append(
  '<div class="upsellBC-actions">' +
    '<button class="upsellBC-btn upsellBC-yes" data-default-yes>Yes</button>' +
    '<button class="upsellBC-btn upsellBC-no" data-default-no>No</button>' +
  '</div>'
);
```

---

#### 4. Cannot Revert After Accepting

**Symptoms:** Customer clicks upgraded product row but revert modal doesn't appear

**Possible Causes:**
- Clicking on form controls (input, label, price) instead of row
- Data attributes not persisting through CF repaints
- JavaScript error

**Solutions:**
```javascript
// Check if row is marked with data attribute:
console.log($('.elOrderProductOptinProducts[data-upsell-hilite="1"]').length);

// Verify data attributes:
$('.elOrderProductOptinProducts[data-upsell-hilite="1"]').each(function() {
  console.log({
    from: $(this).attr('data-upsell-from'),
    to: $(this).attr('data-upsell-to'),
    extras: $(this).attr('data-upsell-extras')
  });
});

// Click anywhere EXCEPT the radio button or label:
// (The script intentionally ignores clicks on form controls)
```

---

#### 5. Additional Products Not Hiding

**Symptoms:** `alsoHideOnUpsell` configured but products still visible

**Possible Causes:**
- Product IDs in `alsoHideOnUpsell` don't match
- Configuration syntax error
- Products haven't been accepted yet (only hide on "Yes")

**Solutions:**
```javascript
// Verify alsoHideOnUpsell configuration:
console.log(window.UPSELL_CONFIG.alsoHideOnUpsell);

// Check console for hiding message:
// "[Upsell Popup] Also hiding 2 additional product(s): ["5009061", "5009062"]"

// Test manual hiding:
$('input[type="radio"][value="EXTRA_PRODUCT_ID"]')
  .closest('.elOrderProductOptinProducts')
  .hide();

// Verify products exist on form:
console.log($('input[type="radio"][value="EXTRA_PRODUCT_ID"]').length);
```

---

### Debug Mode

The script includes comprehensive console logging by default. To view debug information:

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for messages prefixed with `[Upsell Popup]`

**Console Output Includes:**
- Configuration validation
- Product hiding operations
- Modal harvesting results
- Trigger activations
- Upsell acceptances
- Product restores
- Error warnings

---

### Browser Compatibility

**Tested and Working:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Requirements:**
- jQuery (loaded by ClickFunnels)
- ES5+ JavaScript support
- CSS3 support
- CSS Variables support (for CTA colors)

---

## Changelog

### Version 3.5.0 (2025-12-17)
- **NEW**: Added `alsoHideOnUpsell` configuration for multi-product hiding
- **NEW**: Extra hidden products are restored on revert
- **NEW**: Persists extra product IDs in data attributes
- **NEW**: Refactored for CDN distribution with external configuration
- **NEW**: Comprehensive console logging for debugging
- **IMPROVED**: Data attribute persistence survives ClickFunnels DOM repaints
- **IMPROVED**: Modal content is now harvested before initialization
- **FIXED**: Image hydration handles various lazy-load formats

### Version 3.4.1 (2024-12-15)
- Revert trigger is now delegated (survives CF DOM rewrites)
- Persists data attributes briefly after selection to resist repaint
- Pointer cursor on highlighted row

### Version 3.0.0 (2024-06-10)
- Complete rewrite with modal-based approach
- Custom CTA button support
- Per-upsell color overrides
- Image hydration for lazy-loaded images

### Version 2.0.0 (2023-11-20)
- Added revert capability
- Product row highlighting
- Improved ClickFunnels compatibility

### Version 1.0.0 (2023-08-15)
- Initial release
- Basic product hiding
- Trigger-based product swapping
- Simple alert-based confirmation

---

## CDN Delivery

### jsDelivr CDN URLs

**Latest (Main Branch):**
```html
<script src="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/hidden-product-upsell-popup.js"></script>
```
- Updates automatically when you push to `main` branch
- Cache refreshes within minutes
- Good for development/testing

**Tagged Version:**
```html
<script src="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@v3.5.0/cdn/hidden-product-upsell-popup.js"></script>
```
- Locked to specific release version
- Cached permanently
- Good for production (stable)

### Creating Version Tags

```bash
# Tag a release
git tag v3.5.0
git push origin v3.5.0

# CDN URL becomes available:
# https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@v3.5.0/cdn/...
```

---

## Support and Contributing

### Repository
[https://github.com/kratner/ace-media-cfaddins](https://github.com/kratner/ace-media-cfaddins)

### Issues
Report bugs or request features via GitHub Issues

### Contributing
Pull requests welcome for:
- Bug fixes
- Performance improvements
- Documentation enhancements
- New features (please discuss first in Issues)

---

## License

© 2025 Ace Media  
All rights reserved.

---

**End of Documentation**

