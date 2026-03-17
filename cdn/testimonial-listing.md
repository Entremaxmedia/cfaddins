# Testimonial Listing Web Component

**Version:** 1.0.2  
**Last Updated:** March 16, 2026  
**Repository:** [entremaxmedia/cfaddins](https://github.com/entremaxmedia/cfaddins)  
**CDN:** https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/testimonial-listing.js

## Overview

The `testimonial-listing` web component displays dynamically generated, realistic customer testimonials for your products. It requires **no backend API** — testimonials are generated entirely on the client-side.

**Key Features:**
- ✅ Client-side testimonial generation (no server required)
- ✅ Customizable product names
- ✅ Configurable testimonial count
- ✅ Responsive grid layout
- ✅ Star ratings (4-5 stars)
- ✅ Realistic names and dates
- ✅ CSS variable customization
- ✅ Zero external dependencies
- ✅ Full browser compatibility

---

## Installation

### Step 1: Add the Script

Add this script tag to your ClickFunnels Custom HTML/JavaScript element or page `<head>`:

```html
<script src="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/testimonial-listing.js"></script>
```

> **Note:** If you experience caching issues, use the versioned URL:
> ```html
> <script src="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@f8d58ed/cdn/testimonial-listing.js"></script>
> ```

### Step 2: Add the Component

Place the web component in your HTML where you want testimonials to appear:

```html
<testimonial-listing 
  product-name="Your Product Name"
  count="5">
</testimonial-listing>
```

That's it! The component will automatically generate and display testimonials.

---

## Usage Examples

### Basic Usage (5 Testimonials)

```html
<testimonial-listing product-name="Gold Bar"></testimonial-listing>
```

### Custom Count

```html
<testimonial-listing 
  product-name="American Flag Window Display"
  count="10">
</testimonial-listing>
```

### Multiple Components on Same Page

```html
<h2>Gold Bar Testimonials</h2>
<testimonial-listing 
  product-name="Gold Bar"
  count="5">
</testimonial-listing>

<h2>Patriot Pack Testimonials</h2>
<testimonial-listing 
  product-name="Patriot Pack"
  count="5">
</testimonial-listing>

<h2>Emergency Kit Testimonials</h2>
<testimonial-listing 
  product-name="Emergency Kit"
  count="3">
</testimonial-listing>
```

---

## Attributes

### `product-name` (Required)

The name of the product. This is used in the generated testimonial text to make testimonials relevant.

- **Type:** String
- **Default:** None (required)
- **Example:** `product-name="Survival Knife"`

### `count` (Optional)

The number of testimonials to display.

- **Type:** Integer
- **Default:** `5`
- **Min:** `1`
- **Max:** `20`
- **Example:** `count="10"`

---

## Styling

The component uses CSS custom properties (variables) for easy customization. Add this to your page's CSS:

```css
testimonial-listing {
  --testimonial-bg: #f9f9f9;           /* Card background color */
  --testimonial-text: #333;            /* Testimonial text color */
  --testimonial-author: #666;          /* Author name and date color */
  --testimonial-rating: #ffc107;       /* Star rating color */
  --testimonial-border: #ddd;          /* Card border color */
}
```

### Example: Dark Theme

```css
testimonial-listing {
  --testimonial-bg: #2a2a2a;
  --testimonial-text: #ffffff;
  --testimonial-author: #b0b0b0;
  --testimonial-rating: #ffb700;
  --testimonial-border: #444;
}
```

### Example: Green Theme

```css
testimonial-listing {
  --testimonial-bg: #f0f8f0;
  --testimonial-text: #1a5f1a;
  --testimonial-author: #4a7f4a;
  --testimonial-rating: #27ae60;
  --testimonial-border: #a8d5a8;
}
```

---

## Testimonial Content

Each generated testimonial includes:

- **Customer Name:** Random combination of first and last names
- **Rating:** 4 or 5 stars (randomly selected)
- **Testimonial Text:** Product-relevant feedback mentioning the product name
- **Date:** A date within the last 90 days

All testimonials are **simulated and randomly generated** for each page load. No API calls are made.

---

## Troubleshooting

### No testimonials appear

**Check:**
1. Is the `product-name` attribute set? This is required.
2. Open browser console (F12) and look for error messages
3. Check that the script loaded successfully — you should see a green checkmark message in the console

```html
<!-- ❌ Wrong: Missing product-name -->
<testimonial-listing count="5"></testimonial-listing>

<!-- ✅ Correct: product-name provided -->
<testimonial-listing product-name="Gold Bar" count="5"></testimonial-listing>
```

### Component not rendering

**Check:**
1. Verify the script tag is present and loaded before the component
2. Open browser DevTools → Console tab
3. Look for `[TestimonialListing v1.0.2] Component initialized`
4. Check for any JavaScript errors in the console

### Testimonials don't match your product

**This is expected behavior.** Testimonials are simulated and generated client-side. If you need real customer testimonials, consider:
- Collecting reviews from customers and updating the component
- Using a review platform API (would require backend)
- Manually curating testimonials

### Styling not working

**Check:**
1. CSS variables must be applied to `testimonial-listing` element
2. Web Components use Shadow DOM, which isolates styles
3. Your CSS variables will override the component's defaults

```css
/* ✅ Correct */
testimonial-listing {
  --testimonial-rating: #ff0000;
}

/* ❌ Wrong - won't work */
.testimonial-card {
  color: red;
}
```

---

## Browser Compatibility

The component requires Web Components support. Compatible with:
- ✅ Chrome 67+
- ✅ Firefox 63+
- ✅ Safari 10.1+
- ✅ Edge 18+
- ❌ Internet Explorer (not supported)

---

## Version History

### v1.0.2 (March 16, 2026)
- Switched from API to client-side testimonial generation
- Removed dependency on backend API
- Fixed null reference errors in DOM manipulation
- Added enhanced debug logging
- Improved error messages

### v1.0.1 (March 16, 2026)
- Initial API-based release
- Improved error handling for API responses

### v1.0.0 (March 16, 2026)
- Initial web component implementation

---

## Development

**Repository:** https://github.com/entremaxmedia/cfaddins  
**CDN URL:** https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/testimonial-listing.js

To report issues or suggest improvements, visit the repository's issues page.

---

## License

This component is part of the Entremaxmedia cfaddins library.
