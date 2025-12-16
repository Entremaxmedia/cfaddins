/*!
 * Bump Selector with Dropdowns (CDN) — v1.3.0 (2025-12-16)
 * 
 * CONFIGURATION-DRIVEN BUMP SELECTOR FOR CLICKFUNNELS
 * This script expects window.BUMP_CONFIG to be defined before loading.
 * 
 * Usage:
 * 1. Define window.BUMP_CONFIG = [...] with your bump configurations
 * 2. Load this script: <script src="https://cdn.jsdelivr.net/gh/username/repo@1.3.0/bump-selector-core.js"></script>
 * 
 * Configuration Example:
 * window.BUMP_CONFIG = [
 *   {
 *     mainProductId: '4924696',
 *     associatedIds: ['5012788','5012789','5012790','5012791'],
 *     includeMainInDropdown: true,
 *     defaultIndex: 2,
 *     featuredText: '*NOW!*',
 *     preSelected: false
 *   }
 * ];
 * 
 * Changes from v1.2.5:
 * - Refactored for CDN distribution with external configuration
 * - Added validation for BUMP_CONFIG
 * - Improved error handling and console warnings
 * - Wrapped in IIFE for namespace isolation
 * - Added initialization state checks
 */

(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.BUMP_SELECTOR_INITIALIZED) {
    console.warn('Bump Selector: Already initialized, skipping...');
    return;
  }
  
  /**
   * Initialize the Bump Selector system
   */
  function initBumpSelector() {
    // Check for jQuery
    if (typeof jQuery === 'undefined') {
      console.error('Bump Selector: jQuery is required but not found');
      return;
    }
    
    // Check for configuration
    if (typeof window.BUMP_CONFIG === 'undefined') {
      console.error('Bump Selector: window.BUMP_CONFIG must be defined before loading this script');
      return;
    }
    
    if (!Array.isArray(window.BUMP_CONFIG)) {
      console.error('Bump Selector: window.BUMP_CONFIG must be an array');
      return;
    }
    
    if (window.BUMP_CONFIG.length === 0) {
      console.warn('Bump Selector: window.BUMP_CONFIG is empty, nothing to initialize');
      return;
    }
    
    console.log('Bump Selector v1.3.0: Initializing with ' + window.BUMP_CONFIG.length + ' bump(s)');
    
    // Main initialization wrapped in jQuery ready and delay
    $(function () {
      setTimeout(function () {
        var isUpdatingBumpSelector = false;
        var currentSelections = {};
        
        // Use the externally defined configuration
        const BUMPS = window.BUMP_CONFIG;
        
        
        // ── 1) DERIVE RUNTIME FIELDS ─────────────────────────────────────────
        BUMPS.forEach(function (cfg, i) {
          cfg.index = i;
          cfg.wrapClass = 'bump-selector-wrap';
          cfg.currentValue = '';
          cfg.$wrap = $();        // Start empty; only build if we have variant ids
          cfg.$bump = $();
          cfg.$visibleChk = $();
          cfg.checkerId = '';
          cfg.originalInput = null;
        });
        
        
        // ── 2) HELPER FUNCTIONS ──────────────────────────────────────────────
        
        /**
         * Get all product IDs for a bump configuration
         */
        function combinedIds(cfg) {
          var ids = [];
          if (cfg.includeMainInDropdown && cfg.mainProductId) {
            ids.push(cfg.mainProductId);
          }
          if (Array.isArray(cfg.associatedIds) && cfg.associatedIds.length) {
            ids = ids.concat(cfg.associatedIds);
          }
          return ids;
        }
        
        /**
         * Resolve which option should be the default
         */
        function resolveDefaultIndex(cfg, ids) {
          if (cfg.defaultId) {
            var idx = ids.indexOf(cfg.defaultId);
            if (idx >= 0) return idx;
          }
          if (typeof cfg.defaultIndex === 'number') {
            return Math.max(0, Math.min(cfg.defaultIndex, Math.max(ids.length - 1, 0)));
          }
          return 0;
        }
        
        /**
         * HTML escaping utilities
         */
        function escapeHtml(str) {
          return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        }
        
        function escapeHtmlAttr(str) {
          return escapeHtml(str).replace(/"/g, '&quot;');
        }
        
        /**
         * Locate bump container - reordering-safe
         */
        function findBumpContainerByCfg(cfg) {
          var $b = $();
          
          // Try mainProductId first
          if (cfg.mainProductId) {
            $b = $('input[type="radio"][value="' + cfg.mainProductId + '"]')
              .first()
              .closest('.orderFormBump');
          }
          
          // Try associated IDs
          if (!$b.length && Array.isArray(cfg.associatedIds)) {
            for (var i = 0; i < cfg.associatedIds.length; i++) {
              $b = $('input[type="radio"][value="' + cfg.associatedIds[i] + '"]')
                .first()
                .closest('.orderFormBump');
              if ($b.length) break;
            }
          }
          
          // Fallback to index
          if (!$b.length) {
            $b = $('.orderFormBump').eq(cfg.index);
          }
          
          return $b;
        }
        
        /**
         * Get product option text from Clickfunnels DOM
         */
        function getProductOptionText(productId) {
          var $r = $('input[type="radio"][value="' + productId + '"]');
          var txt = '';
          
          if ($r.length) {
            var $l = $r.siblings('label').first();
            if (!$l.length) {
              $l = $r.closest('.elOrderProductOptinProducts').find('label').first();
            }
            txt = $l.text().trim();
          }
          
          if (!txt) {
            var $h = $('#cfAR input[value="' + productId + '"]').siblings('label');
            if ($h.length) txt = $h.text().trim();
          }
          
          return txt || ('Product not found: ' + productId);
        }
        
        /**
         * Ensure a bump has at most ONE product_ids[] checked at a time
         */
        function uncheckAllVariantIds(cfg, exceptId) {
          var ids = combinedIds(cfg);
          ids.forEach(function (id) {
            if (!id) return;
            if (exceptId && id === exceptId) return;
            $('#cfAR [name="purchase[product_ids][]"][value="' + id + '"]')
              .prop('checked', false);
          });
        }
        
        
        // ── 3) BUILD DROPDOWN WRAPPERS ───────────────────────────────────────
        BUMPS.forEach(function (cfg) {
          var ids = combinedIds(cfg);
          if (!ids.length) return; // Nothing to build for simple bumps
          
          var defIdx = resolveDefaultIndex(cfg, ids);
          var selectHtml = '<select data-title="bump-selector">';
          
          ids.forEach(function (id, idx) {
            var txt = getProductOptionText(id);
            var cls = (idx === defIdx) ? ' class="default-option"' : '';
            selectHtml +=
              '<option value="' + id + '" data-original-text="' + escapeHtmlAttr(txt) + '"' + cls + '>' +
                escapeHtml(txt) +
              '</option>';
          });
          
          selectHtml += '</select>';
          
          var $label = $('<label class="quantity-selector-label">Select Quantity:</label>');
          cfg.$wrap = $('<div class="' + cfg.wrapClass + '"></div>')
                        .append($label)
                        .append($(selectHtml))
                        .hide();
        });
        
        
        // ── 4) BIND TO VISIBLE CHECKBOX (CONTROLLER) ─────────────────────────
        BUMPS.forEach(function (cfg) {
          cfg.$bump = findBumpContainerByCfg(cfg);
          var $vis = cfg.$bump.find('input[type="checkbox"]').first();
          
          if (!$vis.length) {
            $vis = $('<input type="checkbox" value="1" />').prependTo(cfg.$bump);
          }
          
          cfg.$visibleChk = $vis;
          cfg.checkerId = 'bump-select-checker-' + (cfg.index + 1);
          cfg.$visibleChk.attr('id', cfg.checkerId);
          cfg.originalInput = cfg.mainProductId ? ('#bump_offer_' + cfg.mainProductId) : null;
        });
        
        
        // ── 5) INJECT WRAPPERS INTO BUMP BOXES ───────────────────────────────
        BUMPS.forEach(function (cfg) {
          if (!cfg.$wrap || !cfg.$wrap.length) return; // Skip simple bumps
          
          var $bump = cfg.$bump && cfg.$bump.length ? cfg.$bump : findBumpContainerByCfg(cfg);
          var $first = $bump.find('.sectioncontent').children().first();
          $first.after(cfg.$wrap);
        });
        
        
        // ── 6) SHARED ACTIVATION/DEACTIVATION LOGIC ──────────────────────────
        
        /**
         * Update Clickfunnels order summary
         */
        function updateOrderSummary() {
          setTimeout(function () {
            if (typeof rebuildOrderSummary === 'function') {
              rebuildOrderSummary();
            }
          }, 50);
        }
        
        /**
         * Activate a bump - show dropdown and select default
         */
        function activateBump(cfg) {
          var ids = combinedIds(cfg);
          
          if (cfg.$wrap && cfg.$wrap.length) {
            cfg.$wrap.show();
            
            // Clear any previous selection for this bump
            uncheckAllVariantIds(cfg);
            if (cfg.currentValue) {
              $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.currentValue + '"]')
                .prop('checked', false);
              cfg.currentValue = '';
            }
            
            // Reset option texts (avoid duplicate featuredText on re-check)
            cfg.$wrap.find('select option').each(function () {
              var $o = $(this);
              var orig = $o.attr('data-original-text');
              if (orig) $o.text(orig);
            });
            
            // Select default and apply badge
            var defIdx = resolveDefaultIndex(cfg, ids);
            var $opt = cfg.$wrap.find('select option').eq(defIdx);
            var val = $opt.val() || '';
            
            cfg.$wrap.find('select option').removeClass('default-option-selected');
            
            if (cfg.featuredText && $opt.length) {
              var orig = $opt.attr('data-original-text') || $opt.text();
              $opt.text(orig + ' ' + cfg.featuredText);
            }
            
            $opt.addClass('default-option-selected');
            
            if (val) {
              cfg.$wrap.find('select').val(val);
              cfg.currentValue = val;
              
              // Ensure only the desired one is checked
              uncheckAllVariantIds(cfg, val);
              $('#cfAR [name="purchase[product_ids][]"][value="' + val + '"]')
                .prop('checked', true);
            }
          }
          
          updateOrderSummary();
        }
        
        /**
         * Deactivate a bump - hide dropdown and uncheck all variants
         */
        function deactivateBump(cfg) {
          // Clear all variants for this bump
          uncheckAllVariantIds(cfg);
          
          if (cfg.currentValue) {
            $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.currentValue + '"]')
              .prop('checked', false);
            cfg.currentValue = '';
          }
          
          if (cfg.$wrap && cfg.$wrap.length) {
            cfg.$wrap.hide();
          }
          
          updateOrderSummary();
        }
        
        
        // ── 7) CHECKBOX CLICK BEHAVIOR (DEFERRED) ────────────────────────────
        BUMPS.forEach(function (cfg) {
          cfg.$visibleChk.on('click', function () {
            if (isUpdatingBumpSelector) return;
            
            // Defer so any other click handlers (CFPT, etc.) run first,
            // then we enforce our final, exclusive selection
            setTimeout(function () {
              var checked = cfg.$visibleChk.is(':checked');
              if (checked) {
                activateBump(cfg);
              } else {
                deactivateBump(cfg);
              }
            }, 0);
          });
        });
        
        
        // ── 8) DROPDOWN CHANGE BEHAVIOR ──────────────────────────────────────
        BUMPS.forEach(function (cfg) {
          if (!cfg.$wrap || !cfg.$wrap.length) return;
          
          cfg.$wrap.find('select').on('change', function () {
            if (isUpdatingBumpSelector) return;
            
            $(this).find('option').removeClass('default-option-selected');
            
            var v = this.value;
            
            // Make this bump exclusive to the newly selected variant
            uncheckAllVariantIds(cfg, v);
            
            if (cfg.currentValue) {
              $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.currentValue + '"]')
                .prop('checked', false);
            }
            
            cfg.currentValue = v;
            
            if (v) {
              $('#cfAR [name="purchase[product_ids][]"][value="' + v + '"]')
                .prop('checked', true);
            }
            
            updateOrderSummary();
          });
        });
        
        
        // ── 9) FORM VALIDATION ───────────────────────────────────────────────
        $('a[href="#submit-form"]').on('click', function (ev) {
          for (var i = 0; i < BUMPS.length; i++) {
            var cfg = BUMPS[i];
            var $chk = $('#' + cfg.checkerId);
            var $sel = (cfg.$wrap && cfg.$wrap.length) ? cfg.$wrap.find('select') : $();
            
            if ($chk.is(':checked') && $sel.length && $sel.val() === '') {
              ev.preventDefault();
              $sel.addClass('elInputError');
              alert("You must select an option");
              
              var $b = $chk.closest('.orderFormBump');
              if ($b.length) {
                var off = $b.offset();
                $('html,body').animate({
                  scrollTop: off.top - 10,
                  scrollLeft: off.left
                });
              }
              
              return false;
            }
          }
        });
        
        
        // ── 10) SAVE/RESTORE ON CORE PRODUCT CHANGES ─────────────────────────
        
        /**
         * Save current bump selections
         */
        function saveCurrentSelections() {
          BUMPS.forEach(function (cfg) {
            var $chk = $('#' + cfg.checkerId);
            var $sel = (cfg.$wrap && cfg.$wrap.length) ? cfg.$wrap.find('select') : $();
            
            currentSelections[cfg.checkerId] = {
              checked: $chk.is(':checked'),
              value: $sel.val(),
              visible: cfg.$wrap && cfg.$wrap.is(':visible')
            };
          });
        }
        
        /**
         * Restore previously saved selections
         */
        function restoreSelections() {
          isUpdatingBumpSelector = true;
          
          BUMPS.forEach(function (cfg) {
            var saved = currentSelections[cfg.checkerId];
            if (!saved) return;
            
            var $chk = $('#' + cfg.checkerId);
            var $sel = (cfg.$wrap && cfg.$wrap.length) ? cfg.$wrap.find('select') : $();
            
            $chk.prop('checked', saved.checked);
            
            if (saved.checked) {
              if (cfg.$wrap && cfg.$wrap.length) {
                cfg.$wrap.show();
                $sel.val(saved.value);
              }
              
              if (saved.value) {
                $('#cfAR [name="purchase[product_ids][]"][value="' + saved.value + '"]')
                  .prop('checked', true);
              }
            } else {
              if (cfg.$wrap && cfg.$wrap.length) {
                cfg.$wrap.hide();
              }
            }
            
            cfg.currentValue = saved.value || '';
          });
          
          setTimeout(function () {
            isUpdatingBumpSelector = false;
            updateOrderSummary();
          }, 100);
        }
        
        // Listen for core product changes
        $(document).on('change', '[name="purchase[product_id]"]', function () {
          saveCurrentSelections();
          setTimeout(restoreSelections, 500);
        });
        
        
        // ── 11) INITIALIZE FROM CURRENT STATE ────────────────────────────────
        
        // A) Respect explicit preSelected flags
        BUMPS.forEach(function (cfg) {
          if (cfg.preSelected && cfg.$visibleChk && cfg.$visibleChk.length && !cfg.$visibleChk.is(':checked')) {
            cfg.$visibleChk.prop('checked', true);
          }
        });
        
        // B) Reflect current checked state in the UI
        BUMPS.forEach(function (cfg) {
          if (!cfg.$visibleChk || !cfg.$visibleChk.length) return;
          
          if (cfg.$visibleChk.is(':checked')) {
            activateBump(cfg);
          } else {
            deactivateBump(cfg);
          }
        });
        
        // Mark as initialized
        window.BUMP_SELECTOR_INITIALIZED = true;
        console.log('Bump Selector v1.3.0: Initialization complete');
        
      }, 3000); // 3-second delay to ensure Clickfunnels is ready
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBumpSelector);
  } else {
    initBumpSelector();
  }
  
})();
// End Bump Selector with Dropdowns (CDN) — v1.3.0