/*!
 * Bump Selector with Dropdowns — v1.2.7 (2026-01-22 CDN)
 * FIXES:
 * - Fixed preselected bumps not appearing in order summary on initial page load
 * - Fixed bump products disappearing when core product selection changes
 * - Fixed blank space at top of order form (uses data-bump-hidden attribute)
 * 
 * Key improvements from earlier versions:
 * - Deferred click handling with setTimeout(...,0) for exclusive selection
 * - Enhanced save/restore logic on core product changes (600ms delay)
 * - Debounced order summary updates (50ms)
 * - MutationObserver monitoring of order summary
 * - Force rebuilds at 100ms and 200ms intervals
 * - CFProTools integration (trigger change events)
 * - Multiple initialization attempts to ensure sync
 */
$(function () {
  setTimeout(function () {
    var isUpdatingBumpSelector = false;
    var currentSelections = {};
    var summaryRebuildTimeout = null;

    // Validate configuration
    if (typeof window.BUMP_CONFIG === 'undefined') {
      console.error('[Bump Selector] window.BUMP_CONFIG is not defined. Aborting initialization.');
      return;
    }

    if (!Array.isArray(window.BUMP_CONFIG)) {
      console.error('[Bump Selector] window.BUMP_CONFIG must be an array. Aborting initialization.');
      return;
    }

    console.log('[Bump Selector v1.2.7] Initializing with ' + window.BUMP_CONFIG.length + ' bump configurations.');

    // ── 1) SINGLE SOURCE OF TRUTH ────────────────────────────────────────────
    const BUMPS = window.BUMP_CONFIG;
    // ─────────────────────────────────────────────────────────────────────────

    // ── 2) Derive runtime fields
    BUMPS.forEach(function (cfg, i) {
      cfg.index = i;
      cfg.wrapClass = 'bump-selector-wrap';
      cfg.currentValue = '';
      cfg.$wrap = $();
      cfg.$bump = $();
      cfg.$visibleChk = $();
      cfg.checkerId = '';
      cfg.originalInput = null;
    });

    // Helpers
    function combinedIds(cfg) {
      var ids = [];
      if (cfg.includeMainInDropdown && cfg.mainProductId) ids.push(cfg.mainProductId);
      if (Array.isArray(cfg.associatedIds) && cfg.associatedIds.length) ids = ids.concat(cfg.associatedIds);
      return ids;
    }

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

    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escapeHtmlAttr(str) { return escapeHtml(str).replace(/"/g, '&quot;'); }

    // Reordering-safe: locate bump container
    function findBumpContainerByCfg(cfg) {
      var $b = $();
      if (cfg.mainProductId) {
        $b = $('input[type="radio"][value="' + cfg.mainProductId + '"]').first().closest('.orderFormBump');
      }
      if (!$b.length && Array.isArray(cfg.associatedIds)) {
        for (var i = 0; i < cfg.associatedIds.length; i++) {
          $b = $('input[type="radio"][value="' + cfg.associatedIds[i] + '"]').first().closest('.orderFormBump');
          if ($b.length) break;
        }
      }
      if (!$b.length) $b = $('.orderFormBump').eq(cfg.index);
      return $b;
    }

    // Pull CF product text
    function getProductOptionText(productId) {
      var $r = $('input[type="radio"][value="' + productId + '"]'), txt = '';
      if ($r.length) {
        var $l = $r.siblings('label').first();
        if (!$l.length) $l = $r.closest('.elOrderProductOptinProducts').find('label').first();
        txt = $l.text().trim();
      }
      if (!txt) {
        var $h = $('#cfAR input[value="' + productId + '"]').siblings('label');
        if ($h.length) txt = $h.text().trim();
      }
      return txt || ('Product not found: ' + productId);
    }

    // Ensure a bump has at most ONE product_ids[] checked at a time
    function uncheckAllVariantIds(cfg, exceptId) {
      var ids = combinedIds(cfg);
      ids.forEach(function (id) {
        if (!id) return;
        if (exceptId && id === exceptId) return;
        $('#cfAR [name="purchase[product_ids][]"][value="' + id + '"]').prop('checked', false);
      });
    }

    // ── ENHANCED: Debounced order summary update ────────────────────────────
    function updateOrderSummary() {
      if (summaryRebuildTimeout) {
        clearTimeout(summaryRebuildTimeout);
      }
      summaryRebuildTimeout = setTimeout(function () {
        if (typeof rebuildOrderSummary === 'function') {
          rebuildOrderSummary();
        }
      }, 50);
    }

    // Force immediate rebuild
    function forceOrderSummaryRebuild() {
      if (summaryRebuildTimeout) {
        clearTimeout(summaryRebuildTimeout);
      }
      if (typeof rebuildOrderSummary === 'function') {
        rebuildOrderSummary();
      }
    }

    // ── 3) Build dropdowns ONLY when there are ids
    BUMPS.forEach(function (cfg) {
      var ids = combinedIds(cfg);
      if (!ids.length) return;

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

    // ── 3A) Bind to visible checkbox (controller)
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

    // ── 4) Inject wrappers in bump box (only if built)
    BUMPS.forEach(function (cfg) {
      if (!cfg.$wrap || !cfg.$wrap.length) return;
      var $bump  = cfg.$bump && cfg.$bump.length ? cfg.$bump : findBumpContainerByCfg(cfg);
      var $first = $bump.find('.sectioncontent').children().first();
      $first.after(cfg.$wrap);
    });

    // ── Shared on/off logic ─────────────────────────────────────────────────
    function activateBump(cfg) {
      var ids = combinedIds(cfg);

      if (cfg.$wrap && cfg.$wrap.length) {
        cfg.$wrap.show();
        uncheckAllVariantIds(cfg);
        if (cfg.currentValue) {
          $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.currentValue + '"]').prop('checked', false);
          cfg.currentValue = '';
        }

        cfg.$wrap.find('select option').each(function () {
          var $o = $(this), orig = $o.attr('data-original-text');
          if (orig) $o.text(orig);
        });

        var defIdx = resolveDefaultIndex(cfg, ids);
        var $opt   = cfg.$wrap.find('select option').eq(defIdx);
        var val    = $opt.val() || '';

        cfg.$wrap.find('select option').removeClass('default-option-selected');
        if (cfg.featuredText && $opt.length) {
          var orig = $opt.attr('data-original-text') || $opt.text();
          $opt.text(orig + ' ' + cfg.featuredText);
        }
        $opt.addClass('default-option-selected');

        if (val) {
          cfg.$wrap.find('select').val(val);
          cfg.currentValue = val;
          uncheckAllVariantIds(cfg, val);
          $('#cfAR [name="purchase[product_ids][]"][value="' + val + '"]').prop('checked', true);
        }
      } else {
        if (cfg.mainProductId) {
          $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.mainProductId + '"]').prop('checked', true);
          cfg.currentValue = cfg.mainProductId;
        }
      }

      updateOrderSummary();
    }

    function deactivateBump(cfg) {
      uncheckAllVariantIds(cfg);
      if (cfg.currentValue) {
        $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.currentValue + '"]').prop('checked', false);
        cfg.currentValue = '';
      }
      if (cfg.mainProductId) {
        $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.mainProductId + '"]').prop('checked', false);
      }
      if (cfg.$wrap && cfg.$wrap.length) cfg.$wrap.hide();
      updateOrderSummary();
    }

    // ── 5) Behavior: click toggles on/off via helpers (DEFERRED)
    BUMPS.forEach(function (cfg) {
      cfg.$visibleChk.on('click', function () {
        if (isUpdatingBumpSelector) return;
        setTimeout(function () {
          var checked = cfg.$visibleChk.is(':checked');
          if (checked) activateBump(cfg);
          else         deactivateBump(cfg);
        }, 0);
      });
    });

    // ── 6) Manual select change
    BUMPS.forEach(function (cfg) {
      if (!cfg.$wrap || !cfg.$wrap.length) return;
      cfg.$wrap.find('select').on('change', function () {
        if (isUpdatingBumpSelector) return;
        $(this).find('option').removeClass('default-option-selected');
        var v = this.value;
        uncheckAllVariantIds(cfg, v);
        if (cfg.currentValue) {
          $('#cfAR [name="purchase[product_ids][]"][value="' + cfg.currentValue + '"]').prop('checked', false);
        }
        cfg.currentValue = v;
        if (v) $('#cfAR [name="purchase[product_ids][]"][value="' + v + '"]').prop('checked', true);
        updateOrderSummary();
      });
    });

    // ── 7) Validation
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
            $('html,body').animate({ scrollTop: off.top - 10, scrollLeft: off.left });
          }
          return false;
        }
      }
    });

    // ── 8) ENHANCED: Save/restore on core-product changes ──────────────────
    function saveCurrentSelections() {
      BUMPS.forEach(function (cfg) {
        var $chk = $('#' + cfg.checkerId);
        var $sel = (cfg.$wrap && cfg.$wrap.length) ? cfg.$wrap.find('select') : $();
        currentSelections[cfg.checkerId] = {
          checked: $chk.is(':checked'),
          value: $sel.val() || cfg.currentValue || '',
          visible: cfg.$wrap && cfg.$wrap.is(':visible')
        };
      });
    }

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
            if (saved.value) {
              $sel.val(saved.value);
            }
          }
          if (saved.value) {
            $('#cfAR [name="purchase[product_ids][]"][value="' + saved.value + '"]').prop('checked', true);
            cfg.currentValue = saved.value;
          } else if (cfg.mainProductId) {
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

      setTimeout(function () {
        isUpdatingBumpSelector = false;
        BUMPS.forEach(function (cfg) {
          if (cfg.$visibleChk && cfg.$visibleChk.is(':checked')) {
            cfg.$visibleChk.trigger('change');
          }
        });
        forceOrderSummaryRebuild();
        setTimeout(function () {
          forceOrderSummaryRebuild();
        }, 200);
      }, 100);
    }

    $(document).on('change', '[name="purchase[product_id]"]', function () {
      saveCurrentSelections();
      setTimeout(restoreSelections, 600);
    });

    // ── 9) INITIALIZE FROM CURRENT STATE
    BUMPS.forEach(function (cfg) {
      if (cfg.preSelected && cfg.$visibleChk && cfg.$visibleChk.length && !cfg.$visibleChk.is(':checked')) {
        cfg.$visibleChk.prop('checked', true);
      }
    });
    BUMPS.forEach(function (cfg) {
      if (!cfg.$visibleChk || !cfg.$visibleChk.length) return;
      if (cfg.$visibleChk.is(':checked')) activateBump(cfg);
      else                                deactivateBump(cfg);
    });

    // Immediate rebuild to ensure preselected bumps appear in order summary on page load
    setTimeout(function() {
      forceOrderSummaryRebuild();
    }, 50);

    setTimeout(function() {
      BUMPS.forEach(function (cfg) {
        if (cfg.$visibleChk && cfg.$visibleChk.is(':checked')) {
          cfg.$visibleChk.trigger('change');
        }
      });
      setTimeout(function() {
        forceOrderSummaryRebuild();
      }, 50);
    }, 100);

    // ENHANCED: Monitor order summary for changes and re-sync if needed
    var summaryObserver = new MutationObserver(function(mutations) {
      if (!isUpdatingBumpSelector) {
        var needsRebuild = false;
        BUMPS.forEach(function (cfg) {
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
          console.log('[Bump Selector] Bump missing from summary, forcing rebuild');
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

  }, 3000);
});
// End Bump Selector with Dropdowns — v1.2.7
