/* ============================================================================
 * FILE: bonus-row-v1.0.3.js
 * PATH: cdn/bonus-row-v1.0.3.js (Entremaxmedia/cfaddins)
 * ----------------------------------------------------------------------------
 * BONUS ROW: shows a free bonus ("FREE $50 Mystery Gift + $25 Gift Card in every order") on a
 * ClickFunnels Classic order form as a locked, pre-selected extra line, with its bonus items side by
 * side and a FREE line in the order summary. Display only: it never touches the form's inputs or
 * totals. Shown only while the brand's smart banner sale is live (cdn/sales-banner-v1.0.0.js + the
 * Team Hub's /banner/count/<brand>); it hides when the day's goal is reached or there's no banner.
 *
 * Install (the page's Footer Code): a settings <div data-emx-sale-gift ...> FIRST, then
 *   <script src="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/bonus-row-v1.0.3.js" defer></script>
 * Every bonus has a ready-made snippet: acelib Bonuses/<slug>/Paste/<slug>_Bonus_v<N>_CDN.html.
 * Settings (data-*), the bonus library and how to make a new bonus: acelib Bonuses/README.md.
 * One bonus per page. Read-only: one GET to the hub's count every 15 s (data-poll-ms).
 *
 * Source of truth: acelib Bonuses/_engine/emx-bonus-row.js (engine e9), copied here unchanged below
 * this header. A changed engine is published as a NEW file (bonus-row-v1.1.0.js ...); never edit or
 * rename this one, pages load it by name.
 *
 * REVISION HISTORY
 *   v1.0.0 (2026-11-27, Keith + Claude): first version = engine e6.
 *   v1.0.1 (2026-11-27, Keith + Claude): engine e7, the order-summary line no longer flickers.
 *   v1.0.2 (2026-11-27, Keith + Claude): engine e8, a strip above the 2-step header so the bonus shows on step 1.
 *   v1.0.3 (2026-11-27, Keith + Claude): engine e9, very narrow form columns: the pill and items label wrap.
 * ========================================================================== */
/* ============================================================================
   FILE: emx-bonus-row.js   (the Bonus Row engine; shipped Base64 inside every Bonuses/<slug>/<slug>_Bonus_v#.html)
   PATH: Bonuses/_engine/emx-bonus-row.js
   ----------------------------------------------------------------------------
   Library docs: Bonuses/README.md. Each bonus's copy/image/value is in Bonuses/<slug>/spec.json;
   Bonuses/_engine/build_bonus.js turns a spec into its paste block.

   ENGINE REVISION HISTORY
     e1  2026-11-27  First version as _src/emx-sale-gift-row.js in the 1HBFBD step (1HBFBD_SaleGiftRow_v1).
     e2  2026-11-27  Layout by container queries (1HBFBD_SaleGiftRow_v2; Keith: horizontal rhythm).
     e3  2026-11-27  Moved to Bonuses/_engine/ as the shared engine; first library bonus
                     bfcm-mystery-gift-giftcard (image instead of the drawn gift). Same globals
                     (__emxSaleGiftRan) and host attribute (data-emx-sale-gift), so one engine per
                     page whatever version pasted it.
     e4  2026-11-27  Bonus ITEMS (data-items JSON [{name, value, img}], data-items-label): each item =
                     picture / name / crossed-out price stacked, items side by side (Keith, after the
                     reference "includes N bonus items" strip). Wide: main + counter left, items right;
                     medium/narrow: one column. Without data-items it renders the e3 single picture.
     e5  2026-11-27  data-summary-img: its own order-summary thumbnail (Keith: the summary line uses the
                     combined gift-box + card image, the form keeps the two item pictures).
     e6  2026-11-27  Hub count refresh 60 s -> 15 s (data-poll-ms; Keith: refresh). Same file published
                     on the CDN as cdn/bonus-row-v1.0.0.js (Entremaxmedia/cfaddins).
     e7  2026-11-27  No more flicker of the summary line (Keith: "every 15 seconds or so, the order summary
                     bonus line item disappears briefly"). The OrderFormEnhancer rebuilds its whole summary on
                     any change inside the form (our counter update, a kit switch) and the line only came back
                     on the next 700 ms tick. Now a MutationObserver puts it back in the same microtask the
                     summary is rebuilt (before the next paint), and the counter is only re-drawn when its
                     number changes. CDN: cdn/bonus-row-v1.0.1.js.
     e9  2026-11-27  Very narrow form columns (< 240px box, e.g. the 1st Hour abandon-cart page's half-width
                     form): the value pill and the items label wrap instead of spilling out of the box.
                     CDN: cdn/bonus-row-v1.0.3.js.
     e8  2026-11-27  Header strip (Keith: "visible before the 2nd step is activated … its own row just above
                     the title/header row"): on a CF 2-step form, a slim row right above the "1 Shipping /
                     2 Your Info" header (.order2StepHeader): thumbnail · name · "Included with every order" ·
                     value pill. Part of the form (a flush band, not a card), same sale gate, re-placed if the
                     page re-renders. data-strip="off" turns it off; data-strip-text / data-strip-sub /
                     data-strip-anchor (a CSS selector to sit above, for other form types) adjust it.
                     CDN: cdn/bonus-row-v1.0.2.js.

   BONUS ROW: a "free gift with every order" offer shown on a CF Classic order form as
   an extra CORE line: pre-selected, locked on (nothing to untick), listed in the order
   summary as FREE, and live ONLY while the brand's smart-banner sale is live.

   DISPLAY ONLY (Keith 2026-11-27): no CF product and no extra charge. CF won't save a
   product under its minimum price, and the warehouse adds the gift to every order itself.
   So this module never touches the form's inputs or totals; it can't change what's charged.

   TIED TO THE SMART BANNER (cdn/sales-banner-v1.0.0.js → hub /banner/<brand>.js)
     data-gate="banner" (default): shown only while BOTH
       · the banner is on the page ([data-emx-banner], open shadow root) and not in its
         ended state (.b.is-ended: daily goal sold out / deadline passed), and
       · the hub's count (GET <hub>/banner/count/<brand> → {count, goal, reached}) isn't reached.
     No banner within data-wait-ms (default 12 s) = the sale isn't running → stays hidden.
     It hides the moment the banner flips to ended while the page is open, and re-checks the
     hub count every data-poll-ms (default 15 s). Starts hidden, so a visitor never sees it appear and vanish.
     data-gate="hub": the count only. data-gate="always": no gate (tests).
     data-ends="<ISO date>": an optional hard stop on top of any gate.

   DROP IN ON ANOTHER ORDER FORM: paste the block; change only data-* on the host div
   (brand, copy, value, image). It places itself after the product rows
   (.elOrderProductOptinProducts) or after data-anchor="<css selector>", and adds its
   summary line to the OrderFormEnhancer summary (.mw-summary-items, all 1st Hour / TGB2 /
   250AF enhancers) or to CF's native Order Summary table. One gift per page.

   CF RULES: scoped .emxg-* classes, every critical property !important, px/clamp(px) fonts
   (never rem), no form inputs touched, no layout props on CF elements.
============================================================================ */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.__emxSaleGiftRan) return;
  W.__emxSaleGiftRan = 1;

  var host = D.querySelector('[data-emx-sale-gift]');
  if (!host) return;
  function A(n, d) { var v = host.getAttribute('data-' + n); return v == null || v === '' ? d : v; }
  var C = {
    brand: A('brand', '1sthour'),
    hub: A('hub', 'https://optimize.entremaxhq.com').replace(/\/+$/, ''),
    gate: A('gate', 'banner'),
    ends: A('ends', ''),
    waitMs: +A('wait-ms', '12000') || 12000,
    pollMs: Math.max(5000, +A('poll-ms', '15000') || 15000),   // e6: hub count refresh (the endpoint is cached 5 s)
    eyebrow: A('eyebrow', 'Black Friday + Cyber Monday'),
    flag: A('flag', 'Free Gift'),
    name: A('name', 'FREE $50 Mystery Gift'),
    sub: A('sub', 'Included free with every order'),
    pill: A('pill', '$50 Value · Free'),
    divider: A('divider', 'In every order while gifts last'),
    itemLabel: A('item-label', 'Mystery Gift'),
    value: A('value', '$50.00'),
    img: A('img', ''),
    sumName: A('summary-name', 'FREE $50 Mystery Gift'),
    sumDetail: A('summary-detail', 'Black Friday + Cyber Monday gift'),
    sumImg: A('summary-img', ''),            // e5: the order-summary thumbnail; default = data-img, else the first item
    counter: A('counter', 'on') !== 'off',
    counterText: A('counter-text', '{left} of {goal} gifts left today'),
    anchor: A('anchor', ''),
    accent: A('accent', '#F5C542'),
    mark: A('mark', '#E21C13'),
    strip: A('strip', 'on') !== 'off',                       // e8: the row above the 2-step header
    stripText: A('strip-text', ''),                          // default: data-name
    stripSub: A('strip-sub', 'Included with every order'),
    stripAnchor: A('strip-anchor', ''),                      // default: .order2StepHeader
    debug: A('debug', '') === '1'
  };
  function log() { if (C.debug && W.console) console.log.apply(console, ['[sale-gift]'].concat([].slice.call(arguments))); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return String(Math.max(0, Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  // ---------------------------------------------------------------- STYLES
  var GIFT_SVG = '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
    '<rect x="10" y="26" width="44" height="30" rx="3" fill="' + esc(C.mark) + '"/>' +
    '<rect x="6" y="18" width="52" height="11" rx="3" fill="' + esc(C.mark) + '"/>' +
    '<rect x="6" y="26" width="52" height="3" fill="rgba(0,0,0,.18)"/>' +
    '<rect x="28" y="18" width="8" height="38" fill="' + esc(C.accent) + '"/>' +
    '<path d="M32 18c-4-9-15-11-15-4 0 5 9 5 15 4zM32 18c4-9 15-11 15-4 0 5-9 5-15 4z" fill="none" stroke="' + esc(C.accent) + '" stroke-width="4" stroke-linejoin="round"/>' +
    '<text x="32" y="47" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="15" fill="#111">?</text></svg>';
  // e4: bonus ITEMS, like the reference "includes N bonus items" strip: each item = picture, name,
  // crossed-out retail price stacked; items side by side. data-items = JSON [{name, value, img}].
  // With no data-items the e3 single picture + value line is used (older pastes keep working).
  var ITEMS = [];
  try { ITEMS = JSON.parse(A('items', '[]')) || []; } catch (e) { ITEMS = []; }
  ITEMS = ITEMS.filter(function (it) { return it && it.name; }).slice(0, 4);
  var ITEMS_LABEL = A('items-label', 'Includes {n} bonus items').replace('{n}', String(ITEMS.length));
  var css = [
    '.emxg{display:block!important;box-sizing:border-box!important;width:100%!important;margin:14px 0!important;border:2px solid #111!important;border-radius:10px!important;overflow:hidden!important;background:#fff!important;font-family:Inter,Arial,sans-serif!important;color:#111!important;text-align:left!important;font-size:15px!important;line-height:1.3!important}',
    '.emxg[hidden]{display:none!important}',
    '.emxg *{box-sizing:border-box!important}',
    // Layout follows the BOX's own width (container queries), so it fits a full-width form and a narrow
    // form column alike. 8px spacing scale; header and body share the same side padding.
    //   wide   (box >= 760px): left column [radio · kicker/name/sub] over [pill · counter],
    //                          right column (dashed divider) [items label + items side by side]
    //   medium (default)     : one column: main row, items (side by side, full width), [pill · counter]
    //   narrow (box < 460px) : the same, pill and counter stacked full width, smaller item pictures
    '.emxg{container-type:inline-size!important;container-name:emxg!important}',
    '.emxg-hd{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px 16px!important;background:#111!important;color:#fff!important;padding:10px 16px!important}',
    '.emxg-eyebrow{font-family:Anton,Impact,Arial Black,sans-serif!important;font-size:16px!important;letter-spacing:.06em!important;text-transform:uppercase!important;color:#fff!important;line-height:1.15!important}',
    '.emxg-flag{font-family:Anton,Impact,Arial Black,sans-serif!important;font-size:18px!important;letter-spacing:.03em!important;text-transform:uppercase!important;color:' + C.accent + '!important;white-space:nowrap!important;line-height:1.15!important}',
    '.emxg-bd{display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-areas:"main" "items" "count"!important;gap:16px!important;padding:16px!important;align-items:center!important}',
    '.emxg-main{grid-area:main!important;display:flex!important;align-items:center!important;gap:12px 16px!important;min-width:0!important}',
    '.emxg-mark{flex:0 0 24px!important;width:24px!important;height:24px!important;border-radius:50%!important;border:2px solid #111!important;display:flex!important;align-items:center!important;justify-content:center!important;background:#fff!important}',
    '.emxg-mark i{display:block!important;width:12px!important;height:12px!important;border-radius:50%!important;background:' + C.mark + '!important}',
    '.emxg-pic{flex:0 0 56px!important;width:56px!important;height:56px!important;border-radius:50%!important;background:#F7F0DC!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important}',
    '.emxg-pic svg{width:66%!important;height:66%!important;display:block!important}',
    '.emxg-pic img,.emxg-ipic img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;margin:0!important;max-width:none!important}',
    '.emxg-txt{flex:1 1 0!important;min-width:0!important;display:flex!important;flex-direction:column!important;gap:4px!important}',
    '.emxg-kick{font-size:14px!important;font-weight:800!important;text-transform:uppercase!important;letter-spacing:.02em!important;color:' + C.mark + '!important;line-height:1.2!important}',
    '.emxg-name{font-weight:800!important;font-size:19px!important;color:#111!important;line-height:1.2!important}',
    '.emxg-sub{font-size:14px!important;color:#555!important;line-height:1.35!important}',
    '.emxg-val{display:flex!important;align-items:center!important;gap:8px!important;margin-top:4px!important}',
    '.emxg-was{background:#1f2a44!important;color:#fff!important;font-weight:700!important;font-size:14px!important;border-radius:999px!important;padding:2px 10px!important;text-decoration:line-through!important;line-height:1.4!important;white-space:nowrap!important}',
    '.emxg-free{color:#2e7d32!important;font-weight:900!important;font-size:15px!important;text-transform:uppercase!important;letter-spacing:.04em!important}',
    '.emxg-pill{flex:0 0 auto!important;background:#2e7d32!important;color:#fff!important;font-weight:800!important;font-size:14px!important;text-transform:uppercase!important;letter-spacing:.04em!important;border-radius:999px!important;padding:8px 16px!important;white-space:nowrap!important;text-align:center!important;line-height:1.2!important}',
    // items
    '.emxg-items{grid-area:items!important;min-width:0!important}',
    '.emxg-ilabel{display:flex!important;align-items:center!important;gap:10px!important;margin:0 0 12px!important;color:#666!important;font-size:14px!important;font-weight:800!important;text-transform:uppercase!important;letter-spacing:.06em!important;line-height:1.2!important;white-space:nowrap!important}',
    '.emxg-ilabel:before,.emxg-ilabel:after{content:""!important;flex:1 1 auto!important;height:1px!important;background:#dcd7cc!important}',
    '.emxg-list{display:grid!important;grid-template-columns:repeat(var(--emxg-n,2),minmax(0,1fr))!important;gap:12px!important;align-items:start!important}',
    '.emxg-item{display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center!important;gap:6px!important;min-width:0!important}',
    '.emxg-ipic{width:88px!important;height:88px!important;border-radius:50%!important;overflow:hidden!important;background:#F7F0DC!important;display:block!important;flex:0 0 auto!important}',
    '.emxg-iname{font-weight:800!important;font-size:15px!important;color:#111!important;line-height:1.2!important}',
    '.emxg-ival{display:flex!important;align-items:center!important;justify-content:center!important;flex-wrap:wrap!important;gap:4px 8px!important}',
    // counter
    '.emxg-foot{grid-area:count!important;display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:12px 16px!important;min-width:0!important}',
    '.emxg-count{flex:1 1 200px!important;min-width:0!important;font-size:14px!important;color:#444!important;text-align:left!important;line-height:1.3!important}',
    '.emxg-count[hidden]{display:none!important}',
    '.emxg-count b{color:' + C.mark + '!important;font-weight:800!important}',
    '.emxg-bar{height:8px!important;border-radius:4px!important;background:#ece8df!important;overflow:hidden!important;margin-top:8px!important;width:100%!important}',
    '.emxg-bar i{display:block!important;height:100%!important;background:' + C.mark + '!important}',
    '.emxg-sumfree{color:#2e7d32!important}',
    // e8: the strip above the 2-step header: a flush band inside the form (no card, no radius of its own)
    '.emxg-strip{display:block!important;box-sizing:border-box!important;width:100%!important;margin:0!important;container-type:inline-size!important;container-name:emxgs!important;background:#FFF6E0!important;border-bottom:1px solid #f0dfb4!important;font-family:Inter,Arial,sans-serif!important;color:#111!important;text-align:left!important;line-height:1.25!important}',
    '.emxg-strip[hidden]{display:none!important}',
    '.emxg-strip *{box-sizing:border-box!important}',
    '.emxg-srow{display:flex!important;align-items:center!important;gap:12px!important;padding:10px 16px!important}',
    '.emxg-spic{flex:0 0 44px!important;width:44px!important;height:44px!important;border-radius:50%!important;overflow:hidden!important;background:#F7F0DC!important;display:block!important}',
    '.emxg-spic img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;margin:0!important;max-width:none!important}',
    '.emxg-stxt{flex:1 1 0!important;min-width:0!important;display:flex!important;flex-direction:column!important;gap:2px!important}',
    '.emxg-sname{font-weight:800!important;font-size:16px!important;color:#111!important}',
    '.emxg-ssub{font-size:14px!important;color:' + C.mark + '!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:.04em!important}',
    '.emxg-strip .emxg-pill{flex:0 0 auto!important;padding:6px 12px!important;font-size:14px!important}',
    '.emxg-srow{flex-wrap:wrap!important}',
    // text keeps at least 220px next to the picture; when the pill no longer fits beside it, the pill drops to its own line
    '.emxg-stxt{flex:1 1 220px!important}',
    '@container emxgs (max-width: 459px){.emxg-srow{gap:8px 10px!important;padding:10px 12px!important}.emxg-stxt{flex-basis:calc(100% - 46px)!important}.emxg-spic{flex-basis:36px!important;width:36px!important;height:36px!important}.emxg-sname{font-size:15px!important}.emxg-strip .emxg-pill{margin-left:46px!important}}',
    // no items (e3 look): pill + counter strip under the main row
    '.emxg-noitems .emxg-bd{grid-template-areas:"main" "count"!important}',
    '@container emxg (min-width: 760px){' +
      '.emxg-hd{padding:12px 24px!important}' +
      '.emxg-eyebrow{font-size:18px!important}.emxg-flag{font-size:20px!important}' +
      '.emxg-bd{grid-template-columns:minmax(0,1fr) auto!important;grid-template-areas:"main items" "count items"!important;column-gap:24px!important;row-gap:16px!important;padding:20px 24px!important}' +
      '.emxg-noitems .emxg-bd{grid-template-areas:"main main" "count count"!important}' +
      '.emxg-main{gap:12px 20px!important;align-self:end!important}' +
      '.emxg-foot{align-self:start!important}' +
      '.emxg-pic{flex-basis:80px!important;width:80px!important;height:80px!important}' +
      '.emxg-name{font-size:22px!important}.emxg-sub{font-size:15px!important}.emxg-kick{letter-spacing:.06em!important}' +
      '.emxg-items{border-left:1px dashed #dcd7cc!important;padding-left:24px!important;align-self:stretch!important;display:flex!important;flex-direction:column!important;justify-content:center!important}' +
      '.emxg-list{grid-template-columns:repeat(var(--emxg-n,2),150px)!important;gap:16px!important}' +
      '.emxg-ipic{width:96px!important;height:96px!important}' +
    '}',
    '@container emxg (max-width: 459px){' +
      '.emxg-foot{flex-direction:column!important;align-items:stretch!important}.emxg-count{flex:0 0 auto!important}' +
      '.emxg-ipic{width:72px!important;height:72px!important}' +
    '}',
    // e9: a very narrow form column (the 1st Hour abandon-cart page: ~170-280px): the pill and the items label wrap
    '@container emxg (max-width: 239px){.emxg-pill{white-space:normal!important;padding:6px 10px!important}.emxg-ilabel{white-space:normal!important;text-align:center!important}.emxg-hd{padding:8px 10px!important}.emxg-bd{padding:10px!important}.emxg-list{gap:8px!important}.emxg-ipic{width:56px!important;height:56px!important}.emxg-count{font-size:13px!important}}',
    '@container emxg (max-width: 379px){' +
      '.emxg-hd{flex-wrap:wrap!important;padding:10px 14px!important}' +
      '.emxg-bd{padding:14px!important;gap:14px!important}' +
      '.emxg-main{gap:10px 12px!important}' +
      '.emxg-pic{flex-basis:52px!important;width:52px!important;height:52px!important}' +
      '.emxg-name{font-size:17px!important}' +
      '.emxg-ipic{width:64px!important;height:64px!important}' +
      '.emxg-ilabel{white-space:normal!important;text-align:center!important}' +
    '}'
  ].join('\n');

  // ------------------------------------------------------------------ RENDER
  var box = null, counterEl = null, live = false, decided = false, stat = { count: null, goal: null };
  function build() {
    if (!D.getElementById('emxg-css')) { var st = D.createElement('style'); st.id = 'emxg-css'; st.textContent = css; (D.head || D.documentElement).appendChild(st); }
    box = D.createElement('div');
    box.className = 'emxg' + (ITEMS.length ? '' : ' emxg-noitems'); box.hidden = true;
    box.setAttribute('role', 'group'); box.setAttribute('aria-label', C.name + ' (included)');
    box.setAttribute('data-emxg', '1');
    var pic = C.img ? '<img src="' + esc(C.img) + '" alt="' + esc(C.itemLabel) + '">' : GIFT_SVG;
    // data-divider is the kicker above the name; data-item-label is the single picture's alt text.
    var items = ITEMS.length
      ? '<div class="emxg-items"><div class="emxg-ilabel">' + esc(ITEMS_LABEL) + '</div>' +
          '<div class="emxg-list" style="--emxg-n:' + ITEMS.length + '">' +
          ITEMS.map(function (it) {
            return '<div class="emxg-item"><span class="emxg-ipic">' + (it.img ? '<img src="' + esc(it.img) + '" alt="' + esc(it.name) + '">' : GIFT_SVG) + '</span>' +
              '<span class="emxg-iname">' + esc(it.name) + '</span>' +
              '<span class="emxg-ival">' + (it.value ? '<span class="emxg-was">' + esc(it.value) + '</span>' : '') + '<span class="emxg-free">Free</span></span></div>';
          }).join('') + '</div></div>'
      : '';
    box.innerHTML =
      '<div class="emxg-hd"><span class="emxg-eyebrow">' + esc(C.eyebrow) + '</span><span class="emxg-flag">' + esc(C.flag) + '</span></div>' +
      '<div class="emxg-bd">' +
        '<div class="emxg-main"><span class="emxg-mark" role="img" aria-label="Included, selected"><i></i></span>' +
          (ITEMS.length ? '' : '<span class="emxg-pic">' + pic + '</span>') +
          '<div class="emxg-txt"><div class="emxg-kick">' + esc(C.divider) + '</div>' +
            '<div class="emxg-name">' + esc(C.name) + '</div>' +
            '<div class="emxg-sub">' + esc(C.sub) + '</div>' +
            (ITEMS.length ? '' : '<div class="emxg-val"><span class="emxg-was">' + esc(C.value) + '</span><span class="emxg-free">Free</span></div>') + '</div>' +
          '</div>' +
        items +
        '<div class="emxg-foot"><span class="emxg-pill">' + esc(C.pill) + '</span>' +
          (C.counter ? '<div class="emxg-count" hidden></div>' : '') + '</div>' +
      '</div>';
    counterEl = box.querySelector('.emxg-count');
  }
  function productRowsParent() {
    var rows = D.querySelectorAll('.elOrderProductOptinProducts');
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.closest('[data-emxg]')) continue;
      if (r.getAttribute('data-cf-product-template') === 'true' && !r.parentElement.querySelector('.mw-enhanced')) continue;
      return r.parentElement;
    }
    return null;
  }
  // e8: the strip above the 2-step header, so the bonus shows on step 1 too
  var strip = null;
  function buildStrip() {
    if (!C.strip) return;
    var img = C.sumImg || C.img || (ITEMS[0] && ITEMS[0].img) || '';
    strip = D.createElement('div');
    strip.className = 'emxg-strip'; strip.hidden = true; strip.setAttribute('data-emxg-strip', '1');
    strip.setAttribute('role', 'note'); strip.setAttribute('aria-label', (C.stripText || C.name) + ' (included)');
    strip.innerHTML = '<div class="emxg-srow">' +
      '<span class="emxg-spic">' + (img ? '<img src="' + esc(img) + '" alt="">' : GIFT_SVG) + '</span>' +
      '<span class="emxg-stxt"><span class="emxg-sname">' + esc(C.stripText || C.name) + '</span><span class="emxg-ssub">' + esc(C.stripSub) + '</span></span>' +
      '<span class="emxg-pill">' + esc(C.pill) + '</span></div>';
  }
  function placeStrip() {
    if (!strip) return;
    var hdr = C.stripAnchor ? D.querySelector(C.stripAnchor) : D.querySelector('.order2StepHeader');
    if (!hdr || !hdr.parentNode) return;
    if (strip.parentNode === hdr.parentNode && strip.nextElementSibling === hdr) return;
    hdr.parentNode.insertBefore(strip, hdr);
  }
  function place() {
    placeStrip();
    if (!box) return false;
    var a = C.anchor ? D.querySelector(C.anchor) : productRowsParent();
    if (!a || !a.parentNode) return false;
    if (box.parentNode === a.parentNode && box.previousElementSibling === a) return true;
    a.parentNode.insertBefore(box, a.nextSibling);
    return true;
  }
  function paintCounter() {
    if (!counterEl) return;
    if (stat.count == null || !stat.goal) { counterEl.hidden = true; return; }
    var left = Math.max(0, stat.goal - stat.count), pct = Math.max(2, Math.min(100, left / stat.goal * 100));
    var html = C.counterText.replace('{left}', '<b>' + fmt(left) + '</b>').replace('{goal}', fmt(stat.goal)) +
      '<div class="emxg-bar"><i style="width:' + pct.toFixed(1) + '%"></i></div>';
    // e7: touch the DOM only when the number changed. Any change inside the order form makes the
    // OrderFormEnhancer rebuild its summary, so an identical re-draw every 15 s is pure churn.
    if (counterEl.getAttribute('data-emxg-last') !== html) { counterEl.innerHTML = html; counterEl.setAttribute('data-emxg-last', html); }
    if (counterEl.hidden) counterEl.hidden = false;
  }

  // ------------------------------------------------------------------ SUMMARY
  function ensureSummary() {
    var mine = D.querySelectorAll('[data-emxg-sum]');
    if (!live) { for (var k = 0; k < mine.length; k++) mine[k].parentNode.removeChild(mine[k]); return; }
    // 1) OrderFormEnhancer summary (.mw-summary-items): a core-style line, priced FREE
    var list = D.querySelector('#mw-custom-summary .mw-summary-items') || D.querySelector('.mw-summary-items');
    if (list) {
      if (list.querySelector('[data-emxg-sum]')) return;
      var it = D.createElement('div');
      it.className = 'mw-summary-item'; it.setAttribute('data-emxg-sum', '1');
      it.innerHTML = '<div class="mw-summary-item-img" style="display:flex;align-items:center;justify-content:center;background:#F7F0DC">' +
        ((C.sumImg || C.img || (ITEMS[0] && ITEMS[0].img)) ? '<img src="' + esc(C.sumImg || C.img || ITEMS[0].img) + '" alt="" style="width:100%;height:100%;object-fit:cover">' : '<span style="width:36px;height:36px;display:block">' + GIFT_SVG + '</span>') + '</div>' +
        '<div><div class="mw-summary-item-name">' + esc(C.sumName) + '</div><div class="mw-summary-item-detail">' + esc(C.sumDetail) + ' · ' + esc(C.value) + ' value</div></div>' +
        '<div class="mw-summary-item-price emxg-sumfree">FREE</div>';
      var core = list.querySelector('.mw-summary-item');
      list.insertBefore(it, core ? core.nextSibling : list.firstChild);
      return;
    }
    // 2) CF native Order Summary table
    var tb = D.querySelector('[data-title="cf-order-summary"] tbody') || D.querySelector('.elOrderSummary tbody, table.orderSummaryTable tbody');
    if (tb && !tb.querySelector('[data-emxg-sum]')) {
      var tr = D.createElement('tr'); tr.setAttribute('data-emxg-sum', '1');
      tr.innerHTML = '<td>' + esc(C.sumName) + '</td><td>FREE</td>';
      var first = tb.querySelector('tr');
      tb.insertBefore(tr, first ? first.nextSibling : null);
    }
  }

  // --------------------------------------------------------------------- GATE
  function setLive(v, why) {
    if (decided && live === v) return;
    decided = true; live = v; log(v ? 'LIVE' : 'OFF', why);
    if (box) box.hidden = !v;
    if (strip) strip.hidden = !v;
    host.setAttribute('data-emxg-state', v ? 'live' : 'off');
    ensureSummary();
  }
  function endsPassed() { if (!C.ends) return false; var t = Date.parse(C.ends); return !isNaN(t) && Date.now() >= t; }
  function bannerState() {
    var h = D.querySelector('[data-emx-banner]');
    if (!h) return 'absent';
    var root = h.shadowRoot || h;
    if (!root.querySelector('.b')) return 'absent';
    return root.querySelector('.b.is-ended, .is-ended') ? 'ended' : 'live';
  }
  var hubReached = null, bannerObs = null;
  function evaluate(final) {
    if (endsPassed()) return setLive(false, 'ends passed');
    if (C.gate === 'always') return setLive(true, 'gate always');
    if (hubReached === true) return setLive(false, 'hub: goal reached');
    if (C.gate === 'hub') { if (hubReached === false) return setLive(true, 'hub: open'); if (final) setLive(false, 'hub unreachable'); return; }
    var b = bannerState();
    if (b === 'ended') return setLive(false, 'banner ended');
    if (b === 'live') { watchBanner(); return setLive(true, 'banner live'); }
    if (final) setLive(false, 'no banner');
  }
  function watchBanner() {
    if (bannerObs || !W.MutationObserver) return;
    var h = D.querySelector('[data-emx-banner]'); if (!h) return;
    bannerObs = new MutationObserver(function () { evaluate(true); });
    bannerObs.observe(h.shadowRoot || h, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    if (h.parentNode) new MutationObserver(function () { if (!D.querySelector('[data-emx-banner]')) setLive(false, 'banner removed'); }).observe(h.parentNode, { childList: true });
  }
  function pollHub() {
    if (C.gate === 'always' || !W.fetch) return;
    fetch(C.hub + '/banner/count/' + encodeURIComponent(C.brand), { cache: 'no-store', credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return;
        hubReached = !!d.reached;
        if (typeof d.count === 'number' && typeof d.goal === 'number') { stat.count = d.count; stat.goal = d.goal; paintCounter(); }
        evaluate(false);
      })
      .catch(function () { log('hub count unreachable'); });
  }

  // --------------------------------------------------------------------- START
  function start() {
    build();
    buildStrip();
    var t0 = Date.now();
    pollHub();
    setInterval(pollHub, C.pollMs);
    // e7: whenever anything on the page rebuilds the order summary (the OrderFormEnhancer replaces it on every
    // change in the form), put our line back at once. MutationObserver callbacks run as a microtask right
    // after the rebuild, before the browser paints, so the line is never drawn missing. ensureSummary() only
    // writes when the line is absent, so its own insert doesn't loop.
    if (W.MutationObserver && D.body) {
      new MutationObserver(function () { if (live) ensureSummary(); }).observe(D.body, { childList: true, subtree: true });
    }
    (function tick() {
      place();
      // Re-checked every tick: a slow banner that mounts after the wait still turns the gift on;
      // an ended banner, a reached hub goal or data-ends keep it off.
      evaluate(Date.now() - t0 >= C.waitMs);
      ensureSummary();
      setTimeout(tick, decided ? 700 : 300);
    })();
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', start); else start();
})();
