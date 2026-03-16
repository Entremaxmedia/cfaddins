// =============================================================
// Testimonial Listing Web Component
// =============================================================
// VERSION: 1.0.0 (2026-03-16)
// REPOSITORY: https://github.com/entremaxmedia/cfaddins
// CDN: https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/testimonial-listing.js
//
// HOW TO USE:
//   1. Add this script to a ClickFunnels Custom HTML/JavaScript element
//   2. Use the web component in your HTML with attributes:
//
//      <testimonial-listing 
//        product-name="Your Product Name"
//        count="5">
//      </testimonial-listing>
//
//   3. Script will automatically fetch and display testimonials
//
// ATTRIBUTES:
//   - product-name (required): Name of the product to fetch testimonials for
//   - count (optional): Number of testimonials to display (default: 5, max: 20)
//
// EXAMPLES:
//
//   Display 5 testimonials for "Gold Bar":
//   <testimonial-listing 
//     product-name="Gold Bar"
//     count="5">
//   </testimonial-listing>
//
//   Display 10 testimonials for "Patriot Pack":
//   <testimonial-listing 
//     product-name="Patriot Pack"
//     count="10">
//   </testimonial-listing>
//
//   Display default (5) testimonials:
//   <testimonial-listing 
//     product-name="Emergency Kit">
//   </testimonial-listing>
//
// STYLING:
//   The component includes default styling but can be customized with CSS:
//
//   testimonial-listing {
//     --testimonial-bg: #f9f9f9;
//     --testimonial-text: #333;
//     --testimonial-author: #666;
//     --testimonial-rating: #ffc107;
//     --testimonial-border: #ddd;
//   }
//
// API INTEGRATION:
//   This component relies on a backend API endpoint that returns testimonials:
//   GET /api/testimonials?product_name={name}&limit={count}
//
//   Expected response format:
//   {
//     "success": true,
//     "testimonials": [
//       {
//         "id": 1,
//         "customer_name": "John Doe",
//         "testimonial_text": "Great product!",
//         "rating": 5,
//         "date": "2026-01-15"
//       },
//       ...
//     ]
//   }
//
// TROUBLESHOOTING:
//   - No testimonials showing: Check product name spelling and API connectivity
//   - CORS errors: Ensure API endpoint is CORS-enabled
//   - Component not rendering: Verify script is loaded and product-name attribute is set
//
// =============================================================
// RELEASE NOTES
// =============================================================
// v1.0.0 (2026-03-16)
//   - Initial release
//   - Web component implementation
//   - Configurable product name and testimonial count
//   - Default lazy loading and error handling
//   - Responsive design with customizable styling
//   - Star rating display
//   - Customer testimonial cards
//
// =============================================================

(function() {
  'use strict';

  // Define the testimonial listing web component
  class TestimonialListing extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    // Define observed attributes
    static get observedAttributes() {
      return ['product-name', 'count'];
    }

    // Lifecycle: element inserted into DOM
    connectedCallback() {
      this.render();
      this.loadTestimonials();
    }

    // Lifecycle: watched attributes changed
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue && this.shadowRoot) {
        this.loadTestimonials();
      }
    }

    // Render component HTML and styles
    render() {
      const shadowRoot = this.shadowRoot;
      shadowRoot.innerHTML = `
        <style>
          :host {
            --testimonial-bg: #f9f9f9;
            --testimonial-text: #333;
            --testimonial-author: #666;
            --testimonial-rating: #ffc107;
            --testimonial-border: #ddd;
            display: block;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }

          .testimonials-container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px 0;
          }

          .testimonials-loading {
            text-align: center;
            padding: 40px 20px;
            color: var(--testimonial-author);
            font-size: 16px;
          }

          .testimonials-error {
            padding: 20px;
            background-color: #fee;
            border: 1px solid #fcc;
            border-radius: 4px;
            color: #c33;
            margin: 20px 0;
          }

          .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            margin: 20px 0;
          }

          .testimonial-card {
            background: white;
            border: 1px solid var(--testimonial-border);
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
          }

          .testimonial-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }

          .testimonial-rating {
            display: flex;
            gap: 4px;
            margin-bottom: 12px;
          }

          .star {
            font-size: 18px;
            color: var(--testimonial-rating);
            line-height: 1;
          }

          .testimonial-text {
            color: var(--testimonial-text);
            font-size: 15px;
            line-height: 1.6;
            margin: 12px 0;
            font-style: italic;
          }

          .testimonial-author {
            color: var(--testimonial-author);
            font-size: 14px;
            font-weight: 600;
            margin-top: 16px;
          }

          .testimonial-date {
            color: var(--testimonial-author);
            font-size: 12px;
            font-weight: normal;
            margin-top: 4px;
            opacity: 0.7;
          }

          .testimonials-empty {
            text-align: center;
            padding: 40px 20px;
            color: var(--testimonial-author);
            font-size: 16px;
          }

          @media (max-width: 768px) {
            .testimonials-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }

            .testimonial-card {
              padding: 16px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .testimonial-card {
              transition: none;
            }
          }
        </style>

        <div class="testimonials-container">
          <div class="testimonials-loading" id="loading">
            Loading testimonials...
          </div>
          <div id="content"></div>
        </div>
      `;
    }

    // Get attribute values with defaults
    getProductName() {
      return this.getAttribute('product-name') || '';
    }

    getCount() {
      const count = parseInt(this.getAttribute('count')) || 5;
      // Limit to max 20 testimonials
      return Math.min(Math.max(count, 1), 20);
    }

    // Load testimonials from API
    async loadTestimonials() {
      const productName = this.getProductName();
      const count = this.getCount();
      const contentEl = this.shadowRoot.getElementById('content');
      const loadingEl = this.shadowRoot.querySelector('.testimonials-loading');

      // Validate product name
      if (!productName) {
        loadingEl.style.display = 'none';
        contentEl.innerHTML = `
          <div class="testimonials-error">
            Error: product-name attribute is required
          </div>
        `;
        return;
      }

      try {
        loadingEl.style.display = 'block';
        contentEl.innerHTML = '';

        // Fetch testimonials from API
        const response = await fetch(
          `/api/testimonials?product_name=${encodeURIComponent(productName)}&limit=${count}`
        );

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !data.testimonials || data.testimonials.length === 0) {
          loadingEl.style.display = 'none';
          contentEl.innerHTML = `
            <div class="testimonials-empty">
              No testimonials found for "${productName}"
            </div>
          `;
          return;
        }

        // Render testimonials
        loadingEl.style.display = 'none';
        contentEl.innerHTML = this.renderTestimonials(data.testimonials);

      } catch (error) {
        console.error('Testimonial Listing Error:', error);
        loadingEl.style.display = 'none';
        contentEl.innerHTML = `
          <div class="testimonials-error">
            Error loading testimonials: ${error.message}
          </div>
        `;
      }
    }

    // Render testimonials HTML
    renderTestimonials(testimonials) {
      const cards = testimonials.map(testimonial => `
        <div class="testimonial-card">
          <div class="testimonial-rating">
            ${this.renderStars(testimonial.rating || 5)}
          </div>
          <div class="testimonial-text">
            "${this.escapeHtml(testimonial.testimonial_text)}"
          </div>
          <div class="testimonial-author">
            — ${this.escapeHtml(testimonial.customer_name)}
          </div>
          ${testimonial.date ? `
            <div class="testimonial-date">
              ${this.formatDate(testimonial.date)}
            </div>
          ` : ''}
        </div>
      `).join('');

      return `<div class="testimonials-grid">${cards}</div>`;
    }

    // Render star rating
    renderStars(rating) {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      let stars = '';

      for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star">★</span>';
      }

      if (hasHalfStar && fullStars < 5) {
        stars += '<span class="star" style="opacity: 0.5;">★</span>';
      }

      // Fill remaining with empty stars
      const emptyStars = 5 - Math.ceil(rating);
      for (let i = 0; i < emptyStars; i++) {
        stars += '<span class="star" style="opacity: 0.2;">★</span>';
      }

      return stars;
    }

    // Format date
    formatDate(dateString) {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (e) {
        return dateString;
      }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Register the web component
  if (!customElements.get('testimonial-listing')) {
    customElements.define('testimonial-listing', TestimonialListing);
  }
})();
