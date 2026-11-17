/* ============================================================================
 * FILE: sales-banner-v1.0.0.js
 * PATH: cdn/sales-banner-v1.0.0.js (Entremaxmedia/cfaddins)
 * ----------------------------------------------------------------------------
 * Sales banner loader: shows the brand's current sales banner at the top of the page. The banners themselves are
 * designed, turned on and scheduled in the Team Hub (/banners); this file only fetches the brand's live one from the
 * hub, so on/off changes, countdowns and live sales counts are never held up by jsDelivr's cache.
 *
 * Use (funnel or page Tracking Code, head or footer):
 *   <script async src="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/sales-banner-v1.0.0.js"
 *           data-brand="mytacticalpromos"></script>
 * In a Custom JS/HTML element a pasted <script> doesn't run, so the hub's /banners page gives an <img onload> version
 * that adds this same script (with data-brand). Copy the snippets from there.
 *
 * Brands: mytacticalpromos, apesurvival, patriotaddict, 1sthour (the hub's list). The banner hides itself on upsell,
 * downsell and thank-you pages, goes full width at the top of <body>, and does nothing if the hub can't be reached.
 *
 * Settings (optional, on the script tag): data-hub="https://…" points at another hub (testing).
 * Read-only: loads one script from the hub; sends nothing.
 *
 * REVISION HISTORY
 *   v1.0.0 (2026-11-17, Alec + Claude): first version.
 * ========================================================================== */
(function () {
  'use strict';
  var HUB = 'https://web-production-382d7ab6.up.railway.app';
  var me = document.currentScript;
  if (!me) { // very old browsers: the last loader tag on the page
    var tags = document.querySelectorAll('script[src*="sales-banner-v"]');
    me = tags[tags.length - 1] || null;
  }
  var brand = String((me && me.getAttribute('data-brand')) || window.EMX_BANNER_BRAND || '').toLowerCase();
  var hub = String((me && me.getAttribute('data-hub')) || window.EMX_BANNER_HUB || HUB).replace(/\/+$/, '');
  if (!/^[a-z0-9-]{2,40}$/.test(brand)) {
    if (window.console) console.warn('[sales-banner] add data-brand="<brand>" to the script tag (see the Team Hub /banners page)');
    return;
  }
  if (!/^https:\/\//.test(hub) && !/^http:\/\/localhost(:\d+)?$/.test(hub)) return;
  if (window.__emxBannerLoader) return; // one banner per page, however many snippets
  window.__emxBannerLoader = 1;
  var s = document.createElement('script');
  s.async = true;
  s.src = hub + '/banner/' + brand + '.js';
  (document.head || document.documentElement).appendChild(s);
})();
