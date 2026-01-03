/*!
 * ClickFunnels Classic – Hidden Product Upsell Popup (CDN)
 * Version: 3.5.0
 * Authors: Keith Ratner, Alec Keith
 * Repository: https://github.com/kratner/ace-media-cfaddins
 * 
 * CONFIGURATION-DRIVEN UPSELL POPUP FOR CLICKFUNNELS
 * This script expects window.UPSELL_CONFIG to be defined before loading.
 * 
 * What's New (v3.5.0):
 * - Added alsoHideOnUpsell config to hide additional products when upsell is accepted
 * - Extra hidden products are restored on revert
 * - Persists extra product IDs in data attributes
 * - Refactored for CDN distribution with external configuration
 * 
 * Usage:
 * 1. Define window.UPSELL_CONFIG = {...} with your configuration
 * 2. Load this script: <script src="https://cdn.jsdelivr.net/gh/kratner/ace-media-cfaddins@main/cdn/hidden-product-upsell-popup.js"></script>
 * 3. Create modal content sections in ClickFunnels editor with data-title="cf-upsell-modal-{productID}"
 * 
 * Configuration Example:
 * window.UPSELL_CONFIG = {
 *   hideProds: ['5022043'],
 *   replaceMap: { '5009059': '5022043' },
 *   alsoHideOnUpsell: { '5022043': ['5009061'] },
 *   ctaDefaults: {
 *     ctaYes: 'Yes, Upgrade My Order Now!',
 *     ctaNo: "No, Thanks. I Don't Want This Upgrade"
 *   },
 *   ctaColors: {
 *     yesBg: 'rgb(18,183,0)',
 *     yesText: '#ffffff',
 *     yesSheen: 'rgba(255,255,255,.3)',
 *     yesShadow: 'rgba(0,0,0,.12)',
 *     noBg: 'red',
 *     noText: 'white'
 *   },
 *   ctaColorOverrides: {
 *     // '5022043': { yesBg:'#28a745', yesText:'#fff', noText:'#666' }
 *   }
 * };
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.UPSELL_POPUP_INITIALIZED) {
    console.warn('[Upsell Popup] Already initialized, skipping...');
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // CONFIGURATION VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════════

  if (typeof window.UPSELL_CONFIG === 'undefined') {
    console.error('[Upsell Popup] window.UPSELL_CONFIG must be defined before loading this script');
    return;
  }

  console.log('[Upsell Popup] Initializing v3.5.0...');

  // Extract configuration with defaults
  var hideProds = window.UPSELL_CONFIG.hideProds || [];
  var replaceMap = window.UPSELL_CONFIG.replaceMap || {};
  var alsoHideOnUpsell = window.UPSELL_CONFIG.alsoHideOnUpsell || {};

  var UPS_COPY_DEFAULTS = window.UPSELL_CONFIG.ctaDefaults || {
    ctaYes: 'Yes, Upgrade My Order Now!',
    ctaNo: "No, Thanks. I Don't Want This Upgrade"
  };

  var CTA_COLORS_DEFAULT = window.UPSELL_CONFIG.ctaColors || {
    yesBg: 'rgb(18,183,0)',
    yesText: '#ffffff',
    yesSheen: 'rgba(255,255,255,.3)',
    yesShadow: 'rgba(0,0,0,.12)',
    noBg: 'red',
    noText: 'white'
  };

  var CTA_COLOR_OVERRIDES = window.UPSELL_CONFIG.ctaColorOverrides || {};

  console.log('[Upsell Popup] Configuration loaded:', {
    hideProds: hideProds.length,
    replaceMappings: Object.keys(replaceMap).length,
    alsoHideRules: Object.keys(alsoHideOnUpsell).length
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════════

  $(function () {
    console.log('[Upsell Popup] jQuery ready, initializing styles and modals...');

    /* ---------- Inject Styles ---------- */
    if (!document.getElementById('upsellV35CSS')) {
      var css = [
        /* highlighted row (dashed red border + negative side margins) */
        '.elOrderProductOptinProducts[data-upsell-hilite="1"]{',
        '  display:flex!important;',
        '  border:6px dashed rgb(255,0,0)!important;',
        '  border-radius:6px!important;',
        '  margin-bottom:8px!important;',
        '  margin-right:-14px!important;',
        '  margin-left:-14px!important;',
        '  cursor:pointer;',
        '}',

        /* modal shell (editor content is injected inside) */
        '.upsellBC-backdrop{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;}',
        '.upsellBC-box{max-width:680px;width:94vw;max-height:90vh;overflow:auto;background:#fff;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.25);} ',
        '.upsellBC-body{padding:0;}',

        /* default action area (only used if editor content lacks buttons) */
        '.upsellBC-actions{display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 16px 20px;}',
        '.upsellBC-btn{width:min(520px,90%);padding:14px 16px;border-radius:8px;font-weight:400;border:0;cursor:pointer;position:relative;overflow:hidden;text-align:center;}',

        /* CTA colors via CSS variables with fallbacks */
        '.upsellBC-yes{',
        '  background:var(--ups-yes-bg, ' + CTA_COLORS_DEFAULT.yesBg + ');',
        '  color:var(--ups-yes-text, ' + CTA_COLORS_DEFAULT.yesText + ');',
        '  font-size:2rem;',
        '  transition:transform .15s ease;',
        '  box-shadow:0 6px 12px var(--ups-yes-shadow, ' + CTA_COLORS_DEFAULT.yesShadow + ');',
        '}',
        '.upsellBC-yes::before{content:"";position:absolute;top:0;left:-75%;width:50%;height:100%;',
        '  background:linear-gradient(120deg,var(--ups-yes-sheen, ' + CTA_COLORS_DEFAULT.yesSheen + ') 0%,rgba(255,255,255,0) 60%);',
        '  transform:skewX(-25deg);}',
        '.upsellBC-yes:hover::before{animation:shine 1s ease-in-out;}',
        '@keyframes shine{0%{left:-75%;}100%{left:125%;}}',
        '.upsellBC-yes:hover{transform:scale(1.02);} ',

        /* make "No" look like a text link under the button */
        '.upsellBC-no{',
        '  background:var(--ups-no-bg, ' + CTA_COLORS_DEFAULT.noBg + ');',
        '  color:var(--ups-no-text, ' + CTA_COLORS_DEFAULT.noText + ');',
        '  width:auto;padding:6px 5px;border:0;box-shadow:none;',
        '}',
        '.upsellBC-no:hover{text-decoration:underline;}',

        /* utility if designers add their own buttons; keep their layout stacked on small screens */
        '@media (max-width:560px){ .upsellBC-actions [data-upsell-yes], .upsellBC-actions [data-upsell-no]{ width:100%; } }'
      ].join('');
      $('head').append('<style id="upsellV35CSS">' + css + '</style>');
      console.log('[Upsell Popup] Styles injected');
    }

    // Initialize global CSS variables once
    function setCtaVars($target, colors) {
      var t = $target.get(0).style;
      t.setProperty('--ups-yes-bg', colors.yesBg);
      t.setProperty('--ups-yes-text', colors.yesText);
      t.setProperty('--ups-yes-sheen', colors.yesSheen);
      t.setProperty('--ups-yes-shadow', colors.yesShadow);
      t.setProperty('--ups-no-bg', colors.noBg);
      t.setProperty('--ups-no-text', colors.noText);
    }

    /* ---------- Helpers ---------- */
    var RADIO_SEL = 'input[type="radio"][name="purchase[product_id]"]';
    function radioByVal(val) { return $(RADIO_SEL + '[value="' + val + '"]'); }
    function rowOf($radio) { return $radio.closest('.clearfix.elOrderProductOptinProducts'); }

    /* ---------- Hide upsell rows initially ---------- */
    console.log('[Upsell Popup] Hiding ' + hideProds.length + ' upsell product(s)...');
    $.each(hideProds, function (_, id) {
      var $row = rowOf(radioByVal(id));
      if ($row.length) {
        $row.hide();
        console.log('[Upsell Popup] Hidden product: ' + id);
      } else {
        console.warn('[Upsell Popup] Product row not found for ID: ' + id);
      }
    });

    /* ---------- Harvest editor modal sections ---------- */
    var harvested = {}; // { upsellId: html }
    var fallbackHtml = '';
    console.log('[Upsell Popup] Harvesting modal sections from editor...');
    
    $('[data-title]').each(function () {
      var $sec = $(this);
      var title = ($sec.attr('data-title') || '').trim();
      if (!title) return;

      var m = title.match(/cf-upsell-modal-(\d+)/i);
      if (m && m[1]) {
        harvested[m[1]] = $('.containerInner', $sec).first().html() || '';
        console.log('[Upsell Popup] Harvested modal for product ID: ' + m[1]);
        $sec.remove();
        return;
      }
      if (/^cf-upsell-modal\b/i.test(title)) {
        fallbackHtml = $('.containerInner', $sec).first().html() || fallbackHtml;
        console.log('[Upsell Popup] Harvested fallback modal');
        $sec.remove();
      }
    });

    function getEditorModalHtml(upsellId) {
      return harvested[upsellId] || fallbackHtml || '';
    }

    /* ---------- Modal shells ---------- */
    var $mainModal = $(
      '<div id="upsellBC" class="upsellBC-backdrop" role="dialog" aria-modal="true">' +
        '<div class="upsellBC-box"><div class="upsellBC-body" id="upsellBC-body"></div></div>' +
      '</div>'
    );
    var $revertModal = $(
      '<div id="upsellRevertBC" class="upsellBC-backdrop" role="dialog" aria-modal="true">' +
        '<div class="upsellBC-box" style="max-width:420px;">' +
          '<div class="upsellBC-body" style="padding:18px;text-align:center;">' +
            '<p style="margin:0 0 12px;font-weight:600;">Return to your original selection?</p>' +
            '<div class="upsellBC-actions">' +
              '<button id="revertYes" class="upsellBC-btn upsellBC-yes" style="background:rgb(255,0,0);">Yes, Revert</button>' +
              '<button id="revertNo"  class="upsellBC-btn upsellBC-no">No, Keep Upgrade</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
    $('body').append($mainModal, $revertModal);
    console.log('[Upsell Popup] Modal shells created');

    // Set global CTA variables on the main modal container
    setCtaVars($('.upsellBC-box'), CTA_COLORS_DEFAULT);

    /* ---------- Content normalization (CTAs + image hydration) ---------- */
    function ensureCTAs($root) {
      var hasYes = $root.find('[data-upsell-yes]').length > 0;
      var hasNo = $root.find('[data-upsell-no]').length > 0;
      if (!hasYes || !hasNo) {
        var $actions = $('<div class="upsellBC-actions"></div>');
        $actions.append('<button class="upsellBC-btn upsellBC-yes" data-default-yes>' + UPS_COPY_DEFAULTS.ctaYes + '</button>');
        $actions.append('<button class="upsellBC-btn upsellBC-no"  data-default-no>' + UPS_COPY_DEFAULTS.ctaNo + '</button>');
        $root.append($actions);
      } else {
        // If designers provided their own elements, push toward stacked look
        $root.find('[data-upsell-yes], [data-upsell-no]').each(function () {
          this.style.display = 'block';
          this.style.margin = '6px auto';
        });
      }
    }

    function absolutize(url) {
      if (!url) return url;
      if (url.indexOf('//') === 0) return (location.protocol || 'https:') + url;
      if (/^https?:/i.test(url)) return url;
      try { return new URL(url, window.location.origin).href; } catch (e) { return url; }
    }

    function hydrateImages($root) {
      $root.find('img').each(function () {
        var $img = $(this);
        var ds = $img.attr('data-src') || $img.attr('data-cfsrc') || $img.attr('data-lazy') || '';
        if (ds) {
          $img.attr('src', absolutize(ds));
          $img.removeAttr('data-src data-cfsrc data-lazy');
        } else {
          var src = $img.attr('src');
          if (src && src.indexOf('//') === 0) $img.attr('src', absolutize(src));
        }
        $img.attr('loading', 'eager');
      });
    }

    function openMainModal(fromId, toId) {
      console.log('[Upsell Popup] Opening modal: ' + fromId + ' → ' + toId);
      var html = getEditorModalHtml(toId);

      if (html) {
        $('#upsellBC-body').html(html);
      } else {
        console.warn('[Upsell Popup] No modal content found for product ' + toId + ', using default');
        $('#upsellBC-body').html(
          '<div style="padding:18px 16px;text-align:center;">' +
            '<div style="background:rgb(255,227,0);color:rgb(255,0,0);font-weight:800;font-size:20px;padding:10px;border-radius:6px 6px 0 0;">Congratulations!</div>' +
            '<div style="padding:14px 10px;font-weight:600;">Special Upgrade Available</div>' +
          '</div>'
        );
      }

      // Apply per-upsell CTA color overrides (if any)
      var colors = CTA_COLOR_OVERRIDES[toId] ? Object.assign({}, CTA_COLORS_DEFAULT, CTA_COLOR_OVERRIDES[toId]) : CTA_COLORS_DEFAULT;
      setCtaVars($('#upsellBC .upsellBC-box'), colors);

      var $body = $('#upsellBC-body');
      hydrateImages($body);
      ensureCTAs($body);

      $('#upsellBC').css('display', 'flex').data({ fromId: fromId, toId: toId });
    }
    
    function closeMainModal() { 
      console.log('[Upsell Popup] Closing main modal');
      $('#upsellBC').hide().removeData(); 
    }

    function openRevertModal(fromId, toId) {
      console.log('[Upsell Popup] Opening revert modal: ' + fromId + ' ← ' + toId);
      $('#upsellRevertBC').css('display', 'flex').data({ fromId: fromId, toId: toId });
    }
    
    function closeRevertModal() { 
      console.log('[Upsell Popup] Closing revert modal');
      $('#upsellRevertBC').hide().removeData(); 
    }

    // Click outside to close
    $(document).on('click', '#upsellBC', function (e) { if (e.target.id === 'upsellBC') closeMainModal(); });
    $(document).on('click', '#upsellRevertBC', function (e) { if (e.target.id === 'upsellRevertBC') closeRevertModal(); });

    /* ---------- Trigger popup when selecting a trigger product ---------- */
    var shownFor = {};
    $(document).on('change', RADIO_SEL, function () {
      var chosenId = $(this).val();
      if (replaceMap.hasOwnProperty(chosenId) && !shownFor[chosenId]) {
        shownFor[chosenId] = true;
        var upsellId = replaceMap[chosenId];
        if (radioByVal(upsellId).length) {
          console.log('[Upsell Popup] Trigger activated: ' + chosenId + ' → ' + upsellId);
          openMainModal(chosenId, upsellId);
        } else {
          console.warn('[Upsell Popup] Upsell product not found: ' + upsellId);
        }
      }
    });

    /* ---------- YES / NO handling (supports editor or default CTAs) ---------- */
    function persistAttrs($row, fromId, toId, extras) {
      // Tag attributes and reapply shortly after in case CF repaints
      var ex = (extras || []).join(',');
      $row.attr({ 'data-upsell-hilite': '1', 'data-upsell-from': fromId, 'data-upsell-to': toId, 'data-upsell-extras': ex });
      setTimeout(function () { $row.attr({ 'data-upsell-hilite': '1', 'data-upsell-from': fromId, 'data-upsell-to': toId, 'data-upsell-extras': ex }); }, 80);
      setTimeout(function () { $row.attr({ 'data-upsell-hilite': '1', 'data-upsell-from': fromId, 'data-upsell-to': toId, 'data-upsell-extras': ex }); }, 300);
    }

    function handleYes(fromId, toId) {
      console.log('[Upsell Popup] Accepted upsell: ' + fromId + ' → ' + toId);
      var $fromRadio = radioByVal(fromId), $toRadio = radioByVal(toId);
      var $fromRow = rowOf($fromRadio), $toRow = rowOf($toRadio);

      // Swap visibility
      $toRow.css('display', 'flex');
      $fromRow.hide();

      // Hide additional products if configured
      var extras = alsoHideOnUpsell[toId] || [];
      if (extras.length) {
        console.log('[Upsell Popup] Also hiding ' + extras.length + ' additional product(s):', extras);
      }
      $.each(extras, function (_, xid) { rowOf(radioByVal(xid)).hide(); });

      // Select upsell & notify CF
      $toRadio.prop('checked', true).trigger('click').trigger('change');

      // Mark + persist attributes for delegated revert (including extras)
      persistAttrs($toRow, fromId, toId, extras);
    }

    // YES/NO from modal (designer or default buttons)
    $(document).on('click', '#upsellBC [data-upsell-yes], #upsellBC [data-default-yes], #upsellBC .upsellBC-yes', function (e) {
      e.preventDefault(); e.stopPropagation();
      var d = $('#upsellBC').data(); closeMainModal();
      handleYes(d.fromId, d.toId);
    });
    $(document).on('click', '#upsellBC [data-upsell-no], #upsellBC [data-default-no], #upsellBC .upsellBC-no', function (e) {
      e.preventDefault(); e.stopPropagation();
      console.log('[Upsell Popup] Declined upsell');
      closeMainModal();
    });

    /* ---------- Delegated revert trigger (survives DOM rewrites) ---------- */
    $(document).on('click', '.elOrderProductOptinProducts[data-upsell-hilite="1"]', function (ev) {
      // Ignore clicks directly on form controls/labels/prices to avoid accidental pop
      var $t = $(ev.target);
      if ($t.is('input, label, .elOrderProductOptinPrice, [data-cf-product-price]')) return;

      var $row = $(this);
      var fromId = $row.attr('data-upsell-from');
      var toId = $row.attr('data-upsell-to') || ($row.find('input[type="radio"]').val() || '');

      if (fromId && toId) openRevertModal(fromId, toId);
    });

    /* ---------- Revert flow ---------- */
    $(document).on('click', '#revertYes', function (e) {
      e.preventDefault();
      var d = $('#upsellRevertBC').data(), fromId = d.fromId, toId = d.toId;
      console.log('[Upsell Popup] Reverting: ' + toId + ' → ' + fromId);

      var $fromRadio = radioByVal(fromId), $toRadio = radioByVal(toId);
      var $fromRow = rowOf($fromRadio), $toRow = rowOf($toRadio);

      $fromRow.css('display', 'flex');

      // Restore additional hidden products
      var extras = ($toRow.attr('data-upsell-extras') || '').split(',').filter(Boolean);
      if (extras.length) {
        console.log('[Upsell Popup] Restoring ' + extras.length + ' additional product(s):', extras);
      }
      $.each(extras, function (_, xid) { rowOf(radioByVal(xid)).css('display', 'flex'); });

      $toRow.hide()
        .attr('data-upsell-hilite', '0')
        .removeAttr('data-upsell-from data-upsell-to data-upsell-extras');

      $fromRadio.prop('checked', true).trigger('click').trigger('change');

      shownFor[fromId] = false; // allow the prompt again
      closeRevertModal();
    });

    $(document).on('click', '#revertNo', function (e) { 
      e.preventDefault(); 
      console.log('[Upsell Popup] Keeping upgrade');
      closeRevertModal(); 
    });

    // Mark as initialized
    window.UPSELL_POPUP_INITIALIZED = true;
    console.log('[Upsell Popup] Initialization complete');
  });

})();
// End ClickFunnels Classic – Hidden Product Upsell Popup v3.5.0 (CDN)
