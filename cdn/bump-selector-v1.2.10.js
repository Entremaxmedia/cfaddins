/* FILE: bump-selector-v1.2.10.js
   PATH: cdn/bump-selector-v1.2.10.js */
/*!
 * Bump Selector with Dropdowns — v1.2.10 (2026-08-25)
 * Modular refactor of ClickFunnels footer code
 *
 * CHANGES FROM v1.2.9 (this version):
 * - Fixed a second, related duplicate-charge path left over after v1.2.9.
 *   Both initFromConfig()'s startup pass and restoreSelections() (fired
 *   ~600ms after a main-product/tier change) finish by calling
 *   `cfg.$visibleChk.trigger('change')` on the bump's native visible
 *   checkbox — this is needed so CF Pro Tools' "Multiple Bumps" add-in
 *   registers the bump as active internally. But CF Pro Tools' own script
 *   hardcodes that checkbox's `value` attribute to the bump's
 *   `mainProductId` at page load (independent of which variant our
 *   dropdown has selected), and binds a `change` handler that
 *   unconditionally re-checks the `#cfAR` mirror checkbox for that
 *   `mainProductId` whenever the visible checkbox's `change` event fires —
 *   with no knowledge of, or attempt to clear, sibling variant checkboxes.
 *   Since our synthetic trigger('change') call ran AFTER we'd already
 *   correctly enforced single-variant exclusivity, CF Pro Tools' handler
 *   re-checked the base/mainProductId variant on top of the one we'd just
 *   set — leaving both checked and both charged, with nothing after it in
 *   the sequence to clean it up. v1.2.9 only closed the pre-trigger race
 *   (the CPR Car Kit case in its own changelog below); this trigger-time
 *   race could duplicate ANY variant bump, on both the initial-load path
 *   and the main-product-change path.
 *   Real order affected: 1st Hour Trauma First Aid Kit funnel (13688167),
 *   Launch - Long Copy step, reported 8/25/2026 — shopper was charged for
 *   both "1 Expert Survivalist Kit" + "2 Expert Survivalist Kits (15% Off)"
 *   AND both "1 Water Filter Straw" + "2 Water Filter Straws (15% Off)" in
 *   the same transaction after switching the main product tier.
 * - Fix: added enforceExclusivityAfterNotify(), which re-runs
 *   uncheckAllVariantIds(cfg, cfg.currentValue) + re-checks cfg.currentValue
 *   immediately after the trigger('change') loop, in both initFromConfig()
 *   and restoreSelections(), so our exclusive selection is always the last
 *   word before the final order-summary rebuild.
 * ✅ Backwards compatible: no BUMP_CONFIG changes required. Funnels on
 *   v1.2.9 or earlier are unaffected unless/until switched to this file.
 *
 * CHANGES FROM v1.2.8 (carried into v1.2.9):
 * - Fixed a bug where restoreSelections() — called ~600ms after the shopper
 *   changes the main product/tier (see bindCoreProductChange) — re-checked
 *   the previously-saved variant WITHOUT first clearing its sibling variant
 *   IDs. activateBump() and the dropdown's `change` handler both call
 *   uncheckAllVariantIds() before checking a new value; restoreSelections()
 *   did not, so it was the one code path that could leave two variants of
 *   the same bump checked at once.
 *   Real-world trigger: CF Pro Tools' "Bump Content" / "Multiple Bumps"
 *   add-ins re-render/re-default a bump's native checkbox when the main
 *   product changes. If that happened inside the 600ms window between
 *   saveCurrentSelections() and restoreSelections(), restoreSelections()
 *   would re-check the saved variant ON TOP OF the add-in's own default
 *   checkbox instead of replacing it — leaving both checked and both
 *   submitted with the order.
 *   Root-caused from a live order (8/11/2026, 1st Hour Trauma First Aid Kit
 *   funnel, Launch - Long Copy step) that was charged for both "1 CPR Car
 *   Kit" ($29.99) and "2 CPR Car Kits, 15% Off" ($50.98) in the same
 *   transaction after the shopper switched the main product to the
 *   5-Kit Full Family Bundle tier.
 * - Fix: restoreSelections() now calls uncheckAllVariantIds() before
 *   re-checking the saved value, exactly like activateBump() and the select
 *   `change` handler already do.
 * ✅ Backwards compatible: no BUMP_CONFIG changes required. Funnels on
 *   v1.2.8 or v1.2.7 are unaffected unless/until switched to this file.
 *
 * CHANGES FROM v1.2.7 (carried into v1.2.8):
 * - findBumpContainerByCfg() now matches each bump's container by the CF Pro
 *   Tools "Multiple Bumps" wrapper attribute (`[data-title="cf-multi-bump-{productId}"]`)
 *   before falling back to radio-lookup and positional index. Previously, when
 *   a page's CF bump checkboxes carried no product ID (common — CF just gives
 *   them a generic, non-unique `id="bump-offer"`), the radio-lookup silently
 *   found nothing and matching fell through to matching BUMP_CONFIG array
 *   position to `.orderFormBump` DOM position. If CF Pro Tools' own add-ins
 *   ("Multiple Bumps" / "Bump Content") ever ordered the bump blocks
 *   differently than window.BUMP_CONFIG listed them, dropdowns/badges got
 *   injected into the wrong bump's header (e.g. two variant bumps swapped).
 *   This matches by product ID first, so BUMP_CONFIG's array order no
 *   longer needs to match the live DOM order.
 * - Fully backwards compatible: the old radio-lookup and positional-index
 *   fallbacks are unchanged and still run if the data-title match finds
 *   nothing, so pages without the CF Pro Tools "Multiple Bumps" markup behave
 *   exactly as they did on v1.2.7.
 *
 * FEATURES (carried over from v1.2.7):
 * - Fixed preselected bumps not appearing in order summary on initial page load
 *   when using CFProTools Order Summary add-in (forces rebuild after initialization)
 * - Added robust order summary monitoring to prevent bumps from disappearing
 * - Extended restore delay and added multiple rebuild calls to ensure proper sync
 * - Added debouncing to prevent excessive rebuilds during rapid changes
 * - Deferred bump checkbox click handling for proper variant management
 *
 * DEPENDENCIES:
 * - jQuery (required by ClickFunnels)
 * - window.BUMP_CONFIG configuration object (defined in footer before loading this script)
 *
 * CONFIGURATION:
 * window.BUMP_CONFIG should be an array of bump configurations:
 * [
 *   {
 *     mainProductId: 'product-id-string',
 *     associatedIds: ['variant1', 'variant2', ...],
 *     includeMainInDropdown: true|false,
 *     defaultId: 'product-id' (optional),
 *     defaultIndex: 0-N (fallback if defaultId not found),
 *     featuredText: '*LABEL*' (optional badge text),
 *     preSelected: true|false
 *   },
 *   ...
 * ]
 *
 * PUBLIC API:
 * window.BumpSelector.init(configArray) - Initialize with custom config
 * window.BumpSelector.getState() - Get current bump selections
 * window.BumpSelector.setState(state) - Restore bump selections
 */

(function() {
  'use strict';

  // Configuration & State
  var isUpdatingBumpSelector = false;
  var currentSelections = {};
  var summaryRebuildTimeout = null;
  var BUMPS = [];

  // ───────────────────────────────────────────────────────────────────────────
  // HELPER FUNCTIONS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Combine main product ID and associated IDs into a single array
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
   * Resolve which option index should be selected by default
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
   * Escape HTML special characters
   */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Escape HTML attribute values
   */
  function escapeHtmlAttr(str) {
    return escapeHtml(str).replace(/"/g, '&quot;');
  }

  /**
   * Find a bump's `.orderFormBump` container via the CF Pro Tools
   * "Multiple Bumps" wrapper, which tags each bump with
   * data-title="cf-multi-bump-{productId}" regardless of DOM order.
   */
  function findBumpContainerByDataTitle(productId) {
    if (!productId) return $();
    return $('[data-title="cf-multi-bump-' + productId + '"]')
      .find('.orderFormBump')
      .first();
  }

  /**
   * Find the bump container by matching product IDs
   * Reordering-safe approach
   */
  function findBumpContainerByCfg(cfg) {
    var $b = $();

    // Preferred: match via CF Pro Tools' reorder-safe data-title wrapper.
    if (cfg.mainProductId) {
      $b = findBumpContainerByDataTitle(cfg.mainProductId);
    }
    if (!$b.length && Array.isArray(cfg.associatedIds)) {
      for (var j = 0; j < cfg.associatedIds.length; j++) {
        $b = findBumpContainerByDataTitle(cfg.associatedIds[j]);
        if ($b.length) break;
      }
    }

    // Fallback: match via a radio input carrying the product ID (works only
    // if the page nests that radio inside the .orderFormBump wrapper).
    if (!$b.length && cfg.mainProductId) {
      $b = $('input[type="radio"][value="' + cfg.mainProductId + '"]')
        .first()
        .closest('.orderFormBump');
    }
    if (!$b.length && Array.isArray(cfg.associatedIds)) {
      for (var i = 0; i < cfg.associatedIds.length; i++) {
        $b = $('input[type="radio"][value="' + cfg.associatedIds[i] + '"]')
          .first()
          .closest('.orderFormBump');
        if ($b.length) break;
      }
    }

    // Last resort: positional match by BUMP_CONFIG array index.
    if (!$b.length) {
      $b = $('.orderFormBump').eq(cfg.index);
    }
    return $b;
  }

  /**
   * Retrieve product option text from CF form
   */
  function getProductOptionText(productId) {
    var $r = $('input[type="radio"][value="' + productId + '"]'), txt = '';
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
   * Ensure only one variant is checked per bump
   */
  function uncheckAllVariantIds(cfg, exceptId) {
    var ids = combinedIds(cfg);
    ids.forEach(function(id) {
      if (!id) return;
      if (exceptId && id === exceptId) return;
      $('#cfAR [name="purchase[product_ids][]"][value="' + id + '"]').prop('checked', false);
    });
  }

  /**
   * v1.2.10: Re-assert single-variant exclusivity for every currently-checked
   * bump. Called right after we trigger('change') on a bump's visible
   * checkbox to notify CF Pro Tools' "Multiple Bumps" add-in — that add-in's
   * own change handler unconditionally re-checks the #cfAR mirror checkbox
   * for the bump's mainProductId (it hardcodes the visible checkbox's value
   * to mainProductId at page load, regardless of the selected variant), so
   * this must run AFTER that trigger to stay the last word on which variant
   * is checked.
   */
  function enforceExclusivityAfterNotify() {
    BUMPS.forEach(function(cfg) {
      if (cfg.$visibleChk && cfg.$visibleChk.is(':checked') && cfg.currentValue) {
        uncheckAllVariantIds(cfg, cfg.currentValue);
        $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.currentValue + '"]').prop('checked', true);
      }
    });
  }

  /**
   * Debounced order summary update
   */
  function updateOrderSummary() {
    if (summaryRebuildTimeout) {
      clearTimeout(summaryRebuildTimeout);
    }
    summaryRebuildTimeout = setTimeout(function() {
      if (typeof rebuildOrderSummary === 'function') {
        rebuildOrderSummary();
      }
    }, 50);
  }

  /**
   * Force immediate order summary rebuild
   */
  function forceOrderSummaryRebuild() {
    if (summaryRebuildTimeout) {
      clearTimeout(summaryRebuildTimeout);
    }
    if (typeof rebuildOrderSummary === 'function') {
      rebuildOrderSummary();
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // INITIALIZATION: Build dropdowns for bumps with variant IDs
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Build dropdown UI for a bump configuration
   */
  function buildBumpUI(cfg) {
    var ids = combinedIds(cfg);
    if (!ids.length) {
      // No variants: simple checkbox bump
      return;
    }

    var defIdx = resolveDefaultIndex(cfg, ids);
    var selectHtml = '<select data-title="bump-selector">';

    ids.forEach(function(id, idx) {
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
  }

  /**
   * Inject built dropdown wrappers into the DOM
   */
  function injectBumpUI(cfg) {
    if (!cfg.$wrap || !cfg.$wrap.length) return;
    var $bump = cfg.$bump && cfg.$bump.length ? cfg.$bump : findBumpContainerByCfg(cfg);
    var $first = $bump.find('.sectioncontent').children().first();
    $first.after(cfg.$wrap);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ACTIVATION/DEACTIVATION LOGIC
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Activate a bump (check it and apply the selected variant)
   */
  function activateBump(cfg) {
    var ids = combinedIds(cfg);

    if (cfg.$wrap && cfg.$wrap.length) {
      cfg.$wrap.show();

      // Clear any previous selection for this bump
      uncheckAllVariantIds(cfg);
      if (cfg.currentValue) {
        $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.currentValue + '"]').prop('checked', false);
        cfg.currentValue = '';
      }

      // Reset option texts (avoid duplicate featuredText on re-check)
      cfg.$wrap.find('select option').each(function() {
        var $o = $(this), orig = $o.attr('data-original-text');
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
        $('#cfAR [name="purchase[product_ids][]"][value="' + val + '"]').prop('checked', true);
      }
    } else {
      // Simple bump (no dropdown) - just check the main product
      if (cfg.mainProductId) {
        $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.mainProductId + '"]').prop('checked', true);
        cfg.currentValue = cfg.mainProductId;
      }
    }

    updateOrderSummary();
  }

  /**
   * Deactivate a bump (uncheck it and clear selected variants)
   */
  function deactivateBump(cfg) {
    uncheckAllVariantIds(cfg);
    if (cfg.currentValue) {
      $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.currentValue + '"]').prop('checked', false);
      cfg.currentValue = '';
    }
    if (cfg.mainProductId) {
      $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.mainProductId + '"]').prop('checked', false);
    }
    if (cfg.$wrap && cfg.$wrap.length) {
      cfg.$wrap.hide();
    }
    updateOrderSummary();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT HANDLERS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Bind checkbox toggle (deferred to allow other handlers to run first)
   */
  function bindCheckboxToggle(cfg) {
    cfg.$visibleChk.on('click', function() {
      if (isUpdatingBumpSelector) return;
      setTimeout(function() {
        var checked = cfg.$visibleChk.is(':checked');
        if (checked) activateBump(cfg);
        else deactivateBump(cfg);
      }, 0);
    });
  }

  /**
   * Bind dropdown select change
   */
  function bindSelectChange(cfg) {
    if (!cfg.$wrap || !cfg.$wrap.length) return;
    cfg.$wrap.find('select').on('change', function() {
      if (isUpdatingBumpSelector) return;

      $(this).find('option').removeClass('default-option-selected');

      var v = this.value;

      // Make this bump exclusive to the newly selected variant
      uncheckAllVariantIds(cfg, v);

      if (cfg.currentValue) {
        $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.currentValue + '"]').prop('checked', false);
      }
      cfg.currentValue = v;
      if (v) {
        $('#cfAR [name="purchase[product_ids][]"][value="' + v + '"]').prop('checked', true);
      }
      updateOrderSummary();
    });
  }

  /**
   * Form submission validation
   */
  function bindFormValidation() {
    $('a[href="#submit-form"]').on('click', function(ev) {
      for (var i = 0; i < BUMPS.length; i++) {
        var cfg = BUMPS[i];
        var $chk = $('#' + cfg.checkerId);
        var $sel = (cfg.$wrap && cfg.$wrap.length) ? cfg.$wrap.find('select') : $();
        if ($chk.is(':checked') && $sel.length && $sel.val() === '') {
          ev.preventDefault();
          $sel.addClass('elInputError');
          alert('You must select an option');
          var $b = $chk.closest('.orderFormBump');
          if ($b.length) {
            var off = $b.offset();
            $('html,body').animate({scrollTop: off.top - 10, scrollLeft: off.left});
          }
          return false;
        }
      }
    });
  }

  /**
   * Monitor core product changes and restore bump selections
   */
  function bindCoreProductChange() {
    $(document).on('change', '[name="purchase[product_id]"]', function() {
      saveCurrentSelections();
      setTimeout(restoreSelections, 600);
    });
  }

  /**
   * Monitor order summary for missing bumps and rebuild if needed
   */
  function setupOrderSummaryMonitoring() {
    var summaryObserver = new MutationObserver(function(mutations) {
      if (!isUpdatingBumpSelector) {
        var needsRebuild = false;
        BUMPS.forEach(function(cfg) {
          if (cfg.$visibleChk && cfg.$visibleChk.is(':checked')) {
            var productId = cfg.currentValue || cfg.mainProductId;
            if (productId) {
              var $summaryItem = $('.elOrderProductOptinsLineItems').find('[data-product-id="' + productId + '"]');
              if (!$summaryItem.length) {
                needsRebuild = true;
              }
            }
          }
        });

        if (needsRebuild) {
          console.log('Bump missing from summary, forcing rebuild');
          setTimeout(forceOrderSummaryRebuild, 100);
        }
      }
    });

    var summaryContainer = document.querySelector('.elOrderProductOptinsLineItems');
    if (summaryContainer) {
      summaryObserver.observe(summaryContainer, {
        childList: true,
        subtree: true,
        attributes: false
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Save current bump selections for later restoration
   */
  function saveCurrentSelections() {
    BUMPS.forEach(function(cfg) {
      var $chk = $('#' + cfg.checkerId);
      var $sel = (cfg.$wrap && cfg.$wrap.length) ? cfg.$wrap.find('select') : $();
      currentSelections[cfg.checkerId] = {
        checked: $chk.is(':checked'),
        value: $sel.val() || cfg.currentValue || '',
        visible: cfg.$wrap && cfg.$wrap.is(':visible')
      };
    });
  }

  /**
   * Restore saved bump selections
   */
  function restoreSelections() {
    isUpdatingBumpSelector = true;
    BUMPS.forEach(function(cfg) {
      var saved = currentSelections[cfg.checkerId];
      if (!saved) return;

      var $chk = $('#' + cfg.checkerId);
      var $sel = (cfg.$wrap && cfg.$wrap.length) ? cfg.$wrap.find('select') : $();

      $chk.prop('checked', saved.checked);
      if (saved.checked) {
        if (cfg.$wrap && cfg.$wrap.length) {
          cfg.$wrap.show();
          if (saved.value) {
            $sel.val(saved.value);
          }
        }
        // v1.2.9 fix: clear sibling variant IDs before re-checking the saved
        // value. Without this, a CF Pro Tools add-in ("Bump Content" /
        // "Multiple Bumps") re-checking this bump's native default checkbox
        // during the 600ms restore window left BOTH the default and the
        // saved variant checked and submitted together.
        if (saved.value) {
          uncheckAllVariantIds(cfg, saved.value);
          $('#cfAR [name="purchase[product_ids][]"][value="' + saved.value + '"]').prop('checked', true);
          cfg.currentValue = saved.value;
        } else if (cfg.mainProductId) {
          uncheckAllVariantIds(cfg, cfg.mainProductId);
          $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.mainProductId + '"]').prop('checked', true);
          cfg.currentValue = cfg.mainProductId;
        }
      } else {
        if (cfg.$wrap && cfg.$wrap.length) cfg.$wrap.hide();
        uncheckAllVariantIds(cfg);
        if (cfg.mainProductId) {
          $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.mainProductId + '"]').prop('checked', false);
        }
      }
    });

    setTimeout(function() {
      isUpdatingBumpSelector = false;

      BUMPS.forEach(function(cfg) {
        if (cfg.$visibleChk && cfg.$visibleChk.is(':checked')) {
          cfg.$visibleChk.trigger('change');
        }
      });

      // v1.2.10 fix: the trigger above lets CF Pro Tools' add-in re-check
      // its own default (mainProductId) variant — reassert our selection.
      enforceExclusivityAfterNotify();

      forceOrderSummaryRebuild();

      setTimeout(function() {
        forceOrderSummaryRebuild();
      }, 200);
    }, 100);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Initialize bump selector from window.BUMP_CONFIG
   */
  function initFromConfig() {
    if (!window.BUMP_CONFIG || !Array.isArray(window.BUMP_CONFIG)) {
      console.warn('Bump Selector v1.2.10: window.BUMP_CONFIG not found or not an array');
      return;
    }

    BUMPS = window.BUMP_CONFIG.map(function(cfg, i) {
      return {
        index: i,
        mainProductId: cfg.mainProductId || null,
        associatedIds: cfg.associatedIds || [],
        includeMainInDropdown: cfg.includeMainInDropdown !== false,
        defaultId: cfg.defaultId || null,
        defaultIndex: typeof cfg.defaultIndex === 'number' ? cfg.defaultIndex : 0,
        featuredText: cfg.featuredText || '',
        preSelected: cfg.preSelected || false,
        wrapClass: 'bump-selector-wrap',
        currentValue: '',
        $wrap: $(),
        $bump: $(),
        $visibleChk: $(),
        checkerId: '',
        originalInput: null
      };
    });

    // Build UI for all bumps
    BUMPS.forEach(buildBumpUI);

    // Bind to visible checkboxes
    BUMPS.forEach(function(cfg) {
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

    // Inject UI
    BUMPS.forEach(injectBumpUI);

    // Bind event handlers
    BUMPS.forEach(bindCheckboxToggle);
    BUMPS.forEach(bindSelectChange);
    bindFormValidation();
    bindCoreProductChange();
    setupOrderSummaryMonitoring();

    // Initialize from current state
    // A) Respect explicit preSelected flags
    BUMPS.forEach(function(cfg) {
      if (cfg.preSelected && cfg.$visibleChk && cfg.$visibleChk.length && !cfg.$visibleChk.is(':checked')) {
        cfg.$visibleChk.prop('checked', true);
      }
    });

    // B) Reflect current checked state in UI
    BUMPS.forEach(function(cfg) {
      if (!cfg.$visibleChk || !cfg.$visibleChk.length) return;
      if (cfg.$visibleChk.is(':checked')) activateBump(cfg);
      else deactivateBump(cfg);
    });

    // C) Force CFProTools to recognize checked bumps
    setTimeout(function() {
      BUMPS.forEach(function(cfg) {
        if (cfg.$visibleChk && cfg.$visibleChk.is(':checked')) {
          cfg.$visibleChk.trigger('change');
        }
      });
      // v1.2.10 fix: reassert exclusivity after the notify-trigger above —
      // see enforceExclusivityAfterNotify() for why this must run after it.
      enforceExclusivityAfterNotify();
      setTimeout(function() {
        forceOrderSummaryRebuild();
      }, 50);
    }, 100);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ───────────────────────────────────────────────────────────────────────────

  window.BumpSelector = {
    init: function(configArray) {
      window.BUMP_CONFIG = configArray;
      initFromConfig();
    },
    getState: function() {
      var state = {};
      BUMPS.forEach(function(cfg) {
        state[cfg.checkerId] = {
          checked: cfg.$visibleChk.is(':checked'),
          value: cfg.currentValue
        };
      });
      return state;
    },
    setState: function(state) {
      BUMPS.forEach(function(cfg) {
        if (state[cfg.checkerId]) {
          var s = state[cfg.checkerId];
          cfg.$visibleChk.prop('checked', s.checked);
          cfg.currentValue = s.value || '';
          if (s.checked) activateBump(cfg);
          else deactivateBump(cfg);
        }
      });
    }
  };

  // Initialize when jQuery is ready
  $(function() {
    // Add small delay to ensure CF form is fully initialized
    setTimeout(initFromConfig, 3000);
  });
})();
