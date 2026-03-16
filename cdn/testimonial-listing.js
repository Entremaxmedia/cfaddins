// =============================================================
// Testimonial Listing Web Component
// =============================================================
// VERSION: 1.0.2
// BUILD DATE: 2026-03-16
// LAST UPDATED: 2026-03-16
// REPOSITORY: https://github.com/entremaxmedia/cfaddins
// CDN: https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/testimonial-listing.js
//
// CHANGELOG v1.0.2: Switched from API to simulated testimonials
//   1. Add this script to a ClickFunnels Custom HTML/JavaScript element
//   2. Use the web component in your HTML with attributes:
//
//      <testimonial-listing 
//        product-name="Your Product Name"
//        count="5">
//      </testimonial-listing>
//
//   3. The component will automatically generate realistic testimonials
//
// ATTRIBUTES:
//   - product-name (required): Name of the product (used to generate relevant testimonials)
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
// TROUBLESHOOTING:
//   - No testimonials showing: Verify the product-name attribute is set
//   - Component not rendering: Check that the script is loaded properly
//   - Styling issues: Ensure browser supports Web Components
//   - Testimonials don't match product: This is expected - testimonials are simulated
//
// =============================================================
// RELEASE NOTES
// =============================================================
// v1.0.2 (2026-03-16)
//   - Changed from API-based to simulated testimonials
//   - No backend required - generates testimonials client-side
//   - Removed api-endpoint attribute (no longer needed)
//   - Simplified component with built-in testimonial generation
//   - Updated examples and documentation
//
// v1.0.1 (2026-03-16)
//   - Added configurable api-endpoint attribute for custom API endpoints
//   - Improved error messages with URL and response details
//   - Better debugging: logs full fetch URL to console
//   - Added detailed troubleshooting guide in comments
//   - Fixed JSON parse error handling for HTML responses
//
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

  // Log version information to console
  console.log('%c✓ Testimonial Listing Component Loaded', 'color: #4CAF50; font-weight: bold; font-size: 12px;');
  console.log('%cVersion: 1.0.2 | Built: 2026-03-16', 'color: #666; font-size: 11px;');
  console.log('%cRepo: https://github.com/entremaxmedia/cfaddins', 'color: #2196F3; font-size: 11px;');

  // Define the testimonial listing web component
  class TestimonialListing extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    // Version information
    static get version() {
      return '1.0.2';
    }

    static get buildDate() {
      return '2026-03-16';
    }

    // Define observed attributes
    static get observedAttributes() {
      return ['product-name', 'count'];
    }

    // Lifecycle: element inserted into DOM
    connectedCallback() {
      const productName = this.getAttribute('product-name');
      const count = this.getAttribute('count') || '5';
      console.log(`[TestimonialListing v${TestimonialListing.version}] Component initialized:`, {
        productName,
        count: parseInt(count),
        element: this
      });
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

    // Generate simulated testimonials based on product name
    generateTestimonials(productName, count) {
      const firstNames = ['John', 'Sarah', 'Michael', 'Jennifer', 'David', 'Lisa', 'James', 'Maria', 'Robert', 'Patricia', 'William', 'Linda', 'Richard', 'Barbara', 'Joseph', 'Susan'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
      
      const positives = [
        `This ${productName} exceeded all my expectations!`,
        `I'm absolutely thrilled with my ${productName} purchase.`,
        `The quality of this ${productName} is outstanding.`,
        `I recommend this ${productName} to everyone.`,
        `This ${productName} is worth every penny.`,
        `Best ${productName} I've ever owned.`,
        `Can't imagine life without my ${productName} now.`,
        `The ${productName} works exactly as described.`,
        `Great value for money with this ${productName}.`,
        `I've already recommended it to friends and family.`,
        `The ${productName} arrived quickly and in perfect condition.`,
        `Customer service was excellent when I had questions.`,
        `This ${productName} has made a real difference.`,
        `Five stars doesn't do justice to this product.`,
        `I'm a repeat customer because of quality like this.`,
        `Worth the investment without a doubt.`,
        `The durability is impressive on this ${productName}.`,
        `Exactly what I was looking for in a ${productName}.`,
        `This ${productName} is a game-changer.`,
        `Couldn't have made a better purchase decision.`
      ];

      const testimonials = [];
      for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
        const testimonial = positives[Math.floor(Math.random() * positives.length)];
        
        // Generate a date within the last 90 days
        const now = new Date();
        const daysAgo = Math.floor(Math.random() * 90);
        const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        testimonials.push({
          id: i + 1,
          customer_name: `${firstName} ${lastName}`,
          testimonial_text: testimonial,
          rating: rating,
          date: date
        });
      }

      return testimonials;
    }

    // Load testimonials (generate simulated ones)
    loadTestimonials() {
      const productName = this.getProductName();
      const count = this.getCount();
      const contentEl = this.shadowRoot.getElementById('content');
      const loadingEl = this.shadowRoot.querySelector('.testimonials-loading');

      console.log(`[TestimonialListing v${TestimonialListing.version}] Loading testimonials:`, {
        productName,
        count,
        element: this
      });

      // Validate product name
      if (!productName) {
        loadingEl.style.display = 'none';
        contentEl.innerHTML = `
          <div class="testimonials-error">
            Error: product-name attribute is required
          </div>
        `;
        console.warn(`[TestimonialListing v${TestimonialListing.version}] Missing product-name attribute`);
        return;
      }

      try {
        loadingEl.style.display = 'none';
        
        // Generate simulated testimonials
        const testimonials = this.generateTestimonials(productName, count);
        console.log(`[TestimonialListing v${TestimonialListing.version}] Generated ${testimonials.length} testimonials`);

        if (!testimonials || testimonials.length === 0) {
          contentEl.innerHTML = `
            <div class="testimonials-empty">
              No testimonials available
            </div>
          `;
          console.warn(`[TestimonialListing v${TestimonialListing.version}] No testimonials generated`);
          return;
        }

        // Render testimonials
        contentEl.innerHTML = this.renderTestimonials(testimonials);
        console.log(`[TestimonialListing v${TestimonialListing.version}] Testimonials rendered successfully`);

      } catch (error) {
        console.error(`[TestimonialListing v${TestimonialListing.version}] Error:`, error);
        loadingEl.style.display = 'none';
        contentEl.innerHTML = `
          <div class="testimonials-error">
            <strong>Error rendering testimonials:</strong><br>
            ${this.escapeHtml(error.message)}
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
