/* ============================================================================
 * FILE: pack-your-box.js
 * PATH: Upsells/Pack Your Box/Pack Your Box 3.0/Engine/pack-your-box.js
 * ----------------------------------------------------------------------------
 * Pack Your Box 3.0 — THE ENGINE. Served from the CDN as
 *   https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@<tag>/cdn/pyb/pack-your-box.js
 * and loaded from a ClickFunnels step's Tracking Code → Footer Code, after
 * the two data variables the console script emits:
 *
 *   window.PYB_CONFIG  = [ { active, productID, productName, productTitle,
 *                            productDescription, productPrice, productRetail,
 *                            productImage, productArticle, status }, … ]
 *   window.PYB_OPTIONS = { schema, funnelId, stepId, catalog, release, skin,
 *                          base:{productID, productName, productPrice},
 *                          columns, copy:{…}, mount, preview,
 *                          soldOut:"show"|"hide", lowStockTag, stockUrl }
 *
 * STOCK (2026-09-30). Each product carries a status — in-stock, low-stock,
 * sold-out or discontinued — baked into the footer when it was generated.
 * If PYB_OPTIONS.stockUrl is set, the live page then reads the shared stock
 * file (pack-your-box-stock.json on the CDN) and applies its statuses, so
 * marking a product sold out once reaches every funnel without re-pasting
 * footers. The file can only change a product's status — never an id, a
 * price or which products are on the page. If it can't be read, the footer's
 * statuses stand. Sold out = shown with a "Sold out" tag and no button
 * (soldOut:"show", the default) or left off the page (soldOut:"hide");
 * discontinued = never shown; neither can be added or charged.
 *
 * It renders the ACTIVE products into <div id="pyb-root"> as the Pack Your
 * Box block (ribbon, intro, product grid with +ADD, YES / No thanks with the
 * running total) and appends the selected product ids to the CF order at
 * submit. Design and rationale: ../PLAN_v1.md.
 *
 * WHAT IS PORTED, UNCHANGED IN LOGIC
 *   - Pack Your Box 2.0 payload (proven by live test purchases 2026-09-23):
 *     the #cfAR submit hook, the CF Pro Tools add-on refusal, delegated
 *     clicks, the re-render observer, the scrollbar/container width sync.
 *   - 1st Hour BoxBar (2026-09-25): the block's own YES / No thanks forwarding
 *     to the hidden native oto-accept / oto-decline, YES disabled while the
 *     box is empty, the capture-phase guard on the native accept, the running
 *     total including the base product, the sticky bar.
 *
 * CTAs (v3, Pack Your Box 3.1 — ../PLAN_3.1_EngineCTAs_v1.md). Decided on
 * every click by one rule: a hidden native [data-title*="oto-accept"] outside
 * the block → NATIVE mode (3.0, unchanged: YES / No thanks click the hidden
 * buttons; the server charges the base product through the wired button).
 * None → ENGINE mode: YES appends the base product + the box items to #cfAR
 * and submits through ClickFunnels' own delegated #yes-link handler; No
 * thanks builds the decline request itself. Deleting the hidden row IS the
 * switch, so every 3.0 page keeps working. window.PYB.ctaMode reports it.
 *
 * STATUS: v0 was proven live 2026-09-30 (self-contained footer, Trump step,
 * test sales). v1 adds stock, v2 the master-catalog stock file; neither live
 * yet. v3 (engine-mode CTAs) is harness-tested only; it goes live on branch
 * pyb31-dev after the session probe and the purchase matrix (PLAN_3.1 §6, §7).
 * First CDN publish: branch pyb3-dev (2026-10-02), tag pyb-v3.0.0 after
 * a live test purchase. The stepId guard (PLAN §3.2) is not implemented yet.
 *
 * REVISION HISTORY
 *   v0 (2026-09-26) — initial port for the catalog workbench's live preview.
 *   v0 (2026-09-29) — sticky bar spells out "{items} items + {base}"; a $0
 *                     base drops the fee clause. Proven live 2026-09-30 on
 *                     the Trump step 13708348 / 99107789 (test sales).
 *   v1 (2026-09-30) — STOCK: per-product status (in-stock / low-stock /
 *                     sold-out / discontinued), soldOut "show" | "hide",
 *                     low-stock tag, and the live stock-file overlay
 *                     (stockUrl). Sold-out and discontinued products can't
 *                     be added or appended at submit. Money path otherwise
 *                     unchanged.
 *   v2 (2026-10-02) — stock file schema 2 (one status per product, keyed by
 *                     cfName, for the master catalog); schema 1 still read.
 *                     Nothing else changed. (Copy: _archive/pack-your-box_v2.js.)
 *   v3 (2026-10-07) — ENGINE-MODE CTAs (Pack Your Box 3.1). Native mode is
 *                     unchanged. Engine mode, checked at click time: needs
 *                     jQuery, #cfAR, CF's delegated #yes-link handler (read
 *                     from jQuery's event data: CF binds it on DOM-ready,
 *                     possibly after we mount) and a numeric base id; else
 *                     YES says it can't order and nothing is sent. YES clicks
 *                     a hidden #yes-link inside the block; at submit the base
 *                     id is appended once with the items (never alone, never
 *                     when the form already holds it). No submit within 6 s
 *                     (CF's handler is async) → message, loading screen
 *                     cleared, YES enabled again. No thanks → #cfAR's action
 *                     + upsell=0 & purchase[product_id]=<base> #no-link, and
 *                     works even when YES can't. window.PYB.ctaMode.
 *   v4 (2026-10-07) — ENGINE MODE: the base product is the order's MAIN
 *                     product, posted as purchase[product_id] (a checked clone
 *                     of CF's product-template radio); the box items stay in
 *                     purchase[product_ids][]. v3 sent the base in
 *                     product_ids[] and left purchase[product_id] empty, and
 *                     CF answered "?declined=true&errors=Missing Purchase"
 *                     with its "card declined" modal (first live 3.1 test,
 *                     13644952 / 99131294 — no charge was attempted). The CF
 *                     editor's own labels for this action are "1-Click-Upsell
 *                     - %s" (one product); its card-retry code resubmits the
 *                     #cfAR purchase[product_id] radio. The base is never in
 *                     both fields; if CF's form already holds it as the main
 *                     product it isn't added again. Native mode unchanged.
 *                     (Copy: _archive/pack-your-box_v3.js.)
 *   v5 (2026-10-07) — ENGINE MODE: YES now goes through CF's own [data-upsell]
 *                     handler, like a native button. v4 still got "Missing
 *                     Purchase" live. The session probe on a working native
 *                     page (Source Data/PYB3_ProbeReport_13644952_99131294_
 *                     2026-10-07_v1.md) showed that the real button is
 *                     <a href="#yes-link-multi-<id>" data-upsell="1"
 *                     data-purchase='{"product_id":"<id>"}'>. lander.js's
 *                     delegated [data-upsell] handler appends hidden
 *                     purchase[product_id]=<id> AND upsell=1 to #cfAR before
 *                     the #yes-link handler submits. upsell=1 is what v3/v4
 *                     never sent. The engine's hidden link now carries the same
 *                     three attributes, so CF adds its own fields. If that
 *                     handler isn't on the page, the engine adds both fields
 *                     at submit. Leftover fields from an earlier failed click
 *                     are removed first. Items stay purchase[product_ids][].
 *                     (Copy: _archive/pack-your-box_v4.js.)
 * ========================================================================== */

(function () {
  "use strict";
  if (window.__pybRan) { return; }
  window.__pybRan = 1;

  var LOG = "[PYB]";
  var log  = function () { try { console.log.apply(console,  [LOG].concat([].slice.call(arguments))); } catch (e) {} };
  var warn = function () { try { console.warn.apply(console, [LOG].concat([].slice.call(arguments))); } catch (e) {} };
  var err  = function () { try { console.error.apply(console,[LOG].concat([].slice.call(arguments))); } catch (e) {} };

  // ---- Which release is this? Read off our own <script src>. -----------------
  var SRC = "";
  try { SRC = (document.currentScript && document.currentScript.src) || ""; } catch (e) {}
  var REF = (function () { var m = SRC.match(/cfaddins@([^/]+)\//); return m ? m[1] : (SRC ? "?" : "inline"); })();
  var IS_TAG = /^pyb-v\d+\.\d+\.\d+$/.test(REF);

  var CFG = window.PYB_CONFIG;
  var OPT = window.PYB_OPTIONS || {};
  var PREVIEW = !!OPT.preview;
  var PROBLEMS = [];
  function problem(m) { PROBLEMS.push(m); err(m); }

  // ==========================================================================
  // 0. COPY — neutral defaults; the footer's copy block overrides per key.
  // ==========================================================================
  var COPY = {
    ribbon:     "⚠ Wait — your order isn’t complete yet ⚠",
    eyebrow:    "One-Time Offer · This Page Only",
    headline:   "Pack Your <span>Box</span>",
    deck:       "Add any of these to your order — one click each, no new checkout. They ship with the rest of your order.",
    ctaTitle:   "Ready? Add your box to this order.",
    yes:        "Yes! Add my selected items",
    no:         "No thanks — continue to my order",
    disclosure: "By clicking “Yes,” you authorize us to charge the payment method already on file a one-time payment for the items you selected, plus a {base} fee. This is not a subscription. Your items ship together with the rest of your order.",
    trust:      ["🔒 Secure One-Click Checkout", "📦 Ships With Your Order", "🛡️ Same Guarantee As Your Order"],
    ctaLine:    "Click +ADD to put {article} {title} in your box for just {price} today.",
    empty:      "Your box is empty — tap <strong>+ ADD</strong> on at least one item above.",
    yesSubEmpty:"Add at least one item above to continue",
    yesSub:     "Charge {total} · one click · ships with your order",
    barGo:      "Finish my order ›",
    barNote:    "{items} items + {base} · added to today’s order",
    soldOutTag: "Sold out",
    soldOutBtn: "Sold out",
    lowTag:     "Almost gone!",
    allGone:    "Everything on this page has been claimed — please continue below.",
    goneToast:  "{title} just sold out, so it was taken out of your box."
  };
  if (OPT.copy && typeof OPT.copy === "object") {
    for (var ck in OPT.copy) { if (OPT.copy[ck] != null && OPT.copy[ck] !== "") { COPY[ck] = OPT.copy[ck]; } }
  }

  // ==========================================================================
  // 1. VALIDATE — never render half a page. Bad data = banner, not a guess.
  // ==========================================================================
  var FATAL = null;
  if (!Array.isArray(CFG)) { FATAL = "window.PYB_CONFIG is missing or not an array. Paste the footer code emitted by the console script into this STEP’s Tracking Code → Footer Code."; }
  else if (OPT.schema !== 1) { FATAL = "PYB_OPTIONS.schema is " + JSON.stringify(OPT.schema) + "; this engine understands schema 1. Re-run the console script or use the matching engine release."; }
  else if (!OPT.base || !OPT.base.productID || isNaN(Number(OPT.base.productPrice))) { FATAL = "PYB_OPTIONS.base must name the base product (productID, productName, productPrice): the one charged with the box items (Shipping)."; }

  var STATUSES = { "in-stock": 1, "low-stock": 1, "sold-out": 1, "discontinued": 1 };
  var SOLD_OUT_MODE = OPT.soldOut === "hide" ? "hide" : "show";
  var LOW_TAG = OPT.lowStockTag !== false;
  function normStatus(v) { v = String(v || "").toLowerCase(); return STATUSES[v] ? v : "in-stock"; }
  function available(p) { return p.status === "in-stock" || p.status === "low-stock"; }
  function visible(p) { return p.status !== "discontinued" && (available(p) || SOLD_OUT_MODE === "show"); }
  var BASE = OPT.base || {};
  var BASE_PRICE = Number(BASE.productPrice) || 0;
  var BASE_NAME  = String(BASE.productName || "handling");
  var PRODUCTS = [];
  var seen = Object.create(null);
  if (!FATAL) {
    for (var i = 0; i < CFG.length; i++) {
      var p = CFG[i] || {};
      if (!p.active) { continue; }
      var label = p.productName || p.productTitle || ("entry #" + (i + 1));
      var why = null;
      if (!/^\d+$/.test(String(p.productID || ""))) { why = "no ClickFunnels product id (not created on this step yet — re-run the console script)"; }
      else if (String(p.productID) === String(BASE.productID)) { why = "its productID is the BASE product’s id"; }
      else if (seen[p.productID]) { why = "duplicate productID " + p.productID; }
      else if (!p.productName && !p.productTitle) { why = "no productName"; }
      else if (p.productPrice == null || isNaN(Number(p.productPrice))) { why = "no productPrice"; }
      else if (!/^https:\/\//.test(String(p.productImage || ""))) { why = "no https productImage"; }
      else if (!p.productDescription) { why = "no productDescription"; }
      if (why) { problem("not rendering “" + label + "” — " + why); continue; }
      seen[p.productID] = 1;
      var retail = (p.productRetail == null || p.productRetail === "") ? null : Number(p.productRetail);
      if (retail != null && !(retail > Number(p.productPrice))) { problem("“" + label + "”: retail " + retail + " is not above price " + p.productPrice + " — anchor dropped"); retail = null; }
      PRODUCTS.push({ id: String(p.productID), name: p.productName || p.productTitle, title: p.productTitle || p.productName,
                      blurb: p.productDescription, price: Number(p.productPrice), retail: retail, img: p.productImage, article: p.productArticle || null,
                      status: normStatus(p.status) });
    }
    if (!PRODUCTS.length) { FATAL = "No products are switched on for this page — every PYB_CONFIG entry is active:false (or invalid). Set active:true on the products this page sells, then republish."; }
  }
  if (SRC && !IS_TAG && !PREVIEW) { problem("engine loaded from ref “" + REF + "”, not a pyb-v* release tag — fine for development, NOT for a live funnel (PLAN §3.8)."); }

  // ==========================================================================
  // 2. REFUSE TO DOUBLE-CHARGE  (2.0, unchanged)
  // ==========================================================================
  var ADDON_PRESENT = (typeof window.cfptOTOprods !== "undefined");

  // ==========================================================================
  // 3. STATE + HELPERS
  // ==========================================================================
  var SELECTED = Object.create(null);
  var BY_ID = Object.create(null);
  for (var b = 0; b < PRODUCTS.length; b++) { BY_ID[PRODUCTS[b].id] = PRODUCTS[b]; }

  window.PYB = {
    version: REF, ref: REF, isRelease: IS_TAG,
    funnelId: OPT.funnelId, stepId: OPT.stepId, catalog: OPT.catalog, release: OPT.release, variant: OPT.variant || "",
    options: OPT, products: PRODUCTS,
    get activeIds() { return PRODUCTS.map(function (p) { return p.id; }); },
    get selected() { return Object.keys(SELECTED); },
    get availableIds() { return PRODUCTS.filter(available).map(function (p) { return p.id; }); },
    stock: { source: "footer", url: OPT.stockUrl || "", updated: null, error: null, mode: SOLD_OUT_MODE },
    addonConflict: ADDON_PRESENT, problems: PROBLEMS, fatal: FATAL,
    ctaMode: null   // "native" | "engine", set at mount and re-checked on every click
  };

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
  function money(n) { if (n == null || isNaN(n)) { return ""; } var v = Number(n); return "$" + (v % 1 === 0 ? String(v) : v.toFixed(2)); }
  function money2(n) { return "$" + (Math.round(Number(n) * 100) / 100).toFixed(2); }
  function article(p) { if (p.article) { return p.article; } return /^[aeiou]/i.test(String(p.title || "")) ? "an" : "a"; }
  function fill(t, map) { return String(t).replace(/\{(\w+)\}/g, function (m, k) { return map[k] != null ? map[k] : m; }); }
  function baseLabel() { return BASE_PRICE ? money2(BASE_PRICE) + " " + BASE_NAME.toLowerCase() : BASE_NAME.toLowerCase(); }
  // A $0 base (the accept button's product exists only to submit the order) must not read "plus a shipping fee":
  // strip the ", plus a {base} fee" clause from the disclosure when there is nothing to add.
  function disclosureText() {
    var t = COPY.disclosure;
    if (!BASE_PRICE) { t = t.replace(/,?\s*plus (?:a|an|the)?\s*\{base\}(?: fee| charge)?/i, ""); }
    return fill(t, { base: baseLabel() });
  }
  function CSS_ESC(s) { if (window.CSS && CSS.escape) { return CSS.escape(String(s)); } return String(s).replace(/[^\w-]/g, "\\$&"); }
  function setText(el, v) { if (el && el.textContent !== v) { el.textContent = v; } }
  function setHTML(el, v) { if (el && el.__pybHTML !== v) { el.innerHTML = v; el.__pybHTML = v; } }

  // ==========================================================================
  // 4. RENDER
  // ==========================================================================
  function rowHTML(p) {
    var sel = !!SELECTED[p.id], out = !available(p), low = p.status === "low-stock" && LOW_TAG;
    var line = fill(COPY.ctaLine, { article: article(p), title: p.title, price: money(p.price) });
    return '' +
      '<div class="pyb-row' + (sel ? ' is-selected' : '') + (out ? ' is-soldout' : '') + (low ? ' is-low' : '') + '" data-pyb-row="' + esc(p.id) + '" data-pyb-status="' + esc(p.status) + '">' +
        '<div class="pyb-media"><img class="pyb-img" src="' + esc(p.img) + '" alt="' + esc(p.title) + '" loading="lazy">' +
          (out ? '<span class="pyb-flag pyb-flag-soldout">' + esc(COPY.soldOutTag) + '</span>' : low ? '<span class="pyb-flag pyb-flag-low">' + esc(COPY.lowTag) + '</span>' : '') + '</div>' +
        '<div class="pyb-body">' +
          '<h3 class="pyb-title">' + esc(p.name) + '</h3>' +
          '<p class="pyb-blurb">' + esc(p.blurb) + '</p>' +
          (out ? '' : '<p class="pyb-ctaline">' + esc(line) + '</p>') +
        '</div>' +
        '<div class="pyb-aside">' +
          (p.retail != null ? '<div class="pyb-retail">retail ' + esc(money(p.retail)) + '</div>' : '') +
          '<div class="pyb-price">Your Price: ' + esc(money(p.price)) + '</div>' +
          (out ? '<span class="pyb-soldout-btn" aria-disabled="true">' + esc(COPY.soldOutBtn) + '</span>'
               : '<button type="button" class="pyb-btn" data-pyb-toggle="' + esc(p.id) + '" aria-pressed="' + (sel ? 'true' : 'false') + '">' +
                 '<span class="pyb-btn-icon" aria-hidden="true"></span><span class="pyb-btn-label"></span></button>') +
        '</div>' +
      '</div>';
  }

  function blockHTML() {
    var trust = Array.isArray(COPY.trust) ? COPY.trust : String(COPY.trust).split("\n");
    var h = '';
    if (COPY.ribbon) { h += '<div class="pyb-ribbon">' + COPY.ribbon + '</div>'; }
    h += '<div class="pyb-intro">' +
           (COPY.eyebrow ? '<p class="pyb-eyebrow">' + COPY.eyebrow + '</p>' : '') +
           '<h2 class="pyb-headline">' + COPY.headline + '</h2>' +
           (COPY.deck ? '<p class="pyb-deck">' + COPY.deck + '</p>' : '') +
         '</div>';
    // Available products first, in catalog order; sold-out ones (when shown) after them.
    var shown = PRODUCTS.filter(function (p) { return visible(p) && available(p); })
                        .concat(PRODUCTS.filter(function (p) { return visible(p) && !available(p); }));
    h += '<div class="pyb-grid" data-pyb-grid>';
    if (!PRODUCTS.some(available)) { h += '<p class="pyb-allgone">' + esc(COPY.allGone) + '</p>'; }
    for (var i = 0; i < shown.length; i++) { h += rowHTML(shown[i]); }
    h += '</div>';
    h += '<div class="pyb-cta">' +
           '<h3 class="pyb-cta-title">' + COPY.ctaTitle + '</h3>' +
           '<div class="pyb-summary is-empty" data-pyb-summary>' + COPY.empty + '</div>' +
           '<button type="button" class="pyb-yes" data-pyb-yes disabled>' +
             '<span class="pyb-yes-main">' + COPY.yes + '</span>' +
             '<span class="pyb-yes-sub" data-pyb-yes-sub>' + COPY.yesSubEmpty + '</span>' +
           '</button>' +
           '<button type="button" class="pyb-no" data-pyb-no>' + COPY.no + '</button>' +
           '<p class="pyb-disclosure">' + disclosureText() + '</p>' +
           '<ul class="pyb-trust" aria-label="Trust signals">' + trust.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
         '</div>';
    return h;
  }

  function banner(root, msg) {
    root.innerHTML = '<div class="pyb-fatal" role="alert"><strong>Pack Your Box is not active on this page.</strong> ' + esc(msg) + '</div>';
  }

  function render(root) {
    if (ADDON_PRESENT) {
      banner(root, "A CF Pro Tools add-on (cfptOTOprods) is still loaded in this step’s Tracking Code. With it in place every selected product would be charged TWICE. Remove both CF Pro Tools Pack Your Box add-ons from the step’s Tracking Code, then reload.");
      return;
    }
    if (FATAL) { banner(root, FATAL); return; }
    root.innerHTML = blockHTML();
    if (CTA_BLOCKED) { ctaError(BLOCKED_MSG); }   // survives every re-render (stock overlay, CF re-render)
    for (var k in SELECTED) { paint(k); }
    update();
  }

  function paint(id) {
    var sel = !!SELECTED[id];
    var rows = document.querySelectorAll('[data-pyb-row="' + CSS_ESC(id) + '"]');
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.toggle("is-selected", sel);
      var btn = rows[i].querySelector("[data-pyb-toggle]");
      if (btn) { btn.setAttribute("aria-pressed", sel ? "true" : "false"); }
    }
  }

  // ==========================================================================
  // 5. RUNNING TOTAL — summary above YES, YES state, sticky bar  (BoxBar)
  // ==========================================================================
  var bar = null, yesVisible = false, io = null, observedYes = null;
  function yesEl() { return document.querySelector("[data-pyb-yes]"); }

  function buildBar() {
    if (bar || FATAL || ADDON_PRESENT) { return; }
    bar = document.createElement("div");
    bar.className = "pyb-bar";
    bar.setAttribute("role", "status"); bar.setAttribute("aria-live", "polite");
    bar.innerHTML = '<span class="pyb-bar-count" data-pyb-count></span><span class="pyb-bar-total" data-pyb-total></span>' +
                    '<span class="pyb-bar-note" data-pyb-note></span><button type="button" class="pyb-bar-go" data-pyb-go>' + COPY.barGo + '</button>';
    document.body.appendChild(bar);
  }
  function watchYes() {
    var y = yesEl();
    if (!y || y === observedYes || !window.IntersectionObserver) { return; }
    if (!io) { io = new IntersectionObserver(function (entries) { yesVisible = entries[entries.length - 1].isIntersecting; update(); }); }
    if (observedYes) { io.unobserve(observedYes); }
    observedYes = y; yesVisible = false; io.observe(y);
  }
  function update() {
    if (FATAL || ADDON_PRESENT) { return; }
    watchYes();
    var ids = Object.keys(SELECTED), sum = 0;
    for (var i = 0; i < ids.length; i++) { sum += (BY_ID[ids[i]] ? BY_ID[ids[i]].price : 0); }
    var empty = ids.length === 0;
    var total = sum + (empty ? 0 : BASE_PRICE);
    var count = ids.length + (ids.length === 1 ? " item" : " items");
    if (bar) {
      setText(bar.querySelector("[data-pyb-count]"), "Your box: " + count);
      setText(bar.querySelector("[data-pyb-total]"), money2(total));
      setText(bar.querySelector("[data-pyb-note]"), BASE_PRICE ? fill(COPY.barNote, { base: baseLabel(), items: money2(sum), total: money2(total) }) : "added to today’s order");
      bar.classList.toggle("is-on", !empty && !yesVisible);
    }
    var s = document.querySelectorAll("[data-pyb-summary]");
    for (var j = 0; j < s.length; j++) {
      s[j].classList.toggle("is-empty", empty);
      setHTML(s[j], empty ? COPY.empty
        : "Your box: <strong>" + count + "</strong> &middot; " + (BASE_PRICE
            ? money2(sum) + " + " + money2(BASE_PRICE) + " " + esc(BASE_NAME.toLowerCase()) + " = <strong>" + money2(total) + "</strong>"
            : "<strong>" + money2(total) + "</strong>"));
    }
    var yes = document.querySelectorAll("[data-pyb-yes]");
    for (var k = 0; k < yes.length; k++) {
      var off = empty || !!CTA_BLOCKED;
      if (yes[k].disabled !== off && !yes[k].__pybSubmitting) { yes[k].disabled = off; }
      setText(yes[k].querySelector("[data-pyb-yes-sub]"), empty ? COPY.yesSubEmpty : fill(COPY.yesSub, { total: money2(total) }));
    }
  }

  // ==========================================================================
  // 6. CTAs — native (3.0) or engine (3.1) mode, decided on every click
  // ==========================================================================
  function nativeLink(title) {
    var wraps = document.querySelectorAll('[data-title*="' + title + '"]');
    for (var i = 0; i < wraps.length; i++) {
      if (wraps[i].closest && wraps[i].closest(".pyb")) { continue; }
      var a = (wraps[i].matches && wraps[i].matches("a")) ? wraps[i] : wraps[i].querySelector("a");
      if (a) { return a; }
    }
    return null;
  }
  // One rule (PLAN_3.1 §4.1): a hidden native accept on the page → native. A page that still
  // has a wired oto-accept must never also get the base id from us, or it could be charged twice.
  function ctaMode() { return nativeLink("oto-accept") ? "native" : "engine"; }
  var CTA_BLOCKED = null;   // engine mode can't take orders on this page (reason), set at mount
  var BLOCKED_MSG = "Sorry, this offer can't be added right now. Please use the link below to continue to your order.";
  function toast(msg) {
    var t = document.createElement("div"); t.className = "pyb-toast"; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { try { t.parentNode.removeChild(t); } catch (e) {} }, 3500);
  }
  function ctaError(msg) {
    var ctas = document.querySelectorAll(".pyb-cta");
    for (var i = 0; i < ctas.length; i++) {
      var p = ctas[i].querySelector("[data-pyb-cta-error]");
      if (!p) {
        p = document.createElement("p"); p.setAttribute("data-pyb-cta-error", ""); p.setAttribute("role", "alert");
        p.setAttribute("style", "margin:10px 0 0;padding:10px 12px;border:2px solid #b91517;border-radius:8px;background:#fff4f4;color:#b91517;font-weight:700;font-size:15px;line-height:1.4");
        var no = ctas[i].querySelector("[data-pyb-no]");
        ctas[i].insertBefore(p, no || null);
      }
      p.textContent = msg;
    }
  }
  function loading(show) {
    try { var ls = window.ClickFunnels && window.ClickFunnels.OrderPage && window.ClickFunnels.OrderPage.LoadingScreen;
          if (ls) { if (show && ls.show) { ls.show(); } else if (!show && ls.hide) { ls.hide(); } } } catch (e) {}
    if (!show) { try { var o = document.querySelectorAll(".otoloading"); for (var i = 0; i < o.length; i++) { o[i].style.display = "none"; } } catch (e) {} }
  }
  // CF's delegated "#yes-link" click handler on document, read from jQuery's event data.
  function cfYesHandlerBound() {
    try {
      var $ = window.jQuery, ev = $ && $._data && $._data(document, "events");
      var clicks = (ev && ev.click) || [];
      for (var i = 0; i < clicks.length; i++) { if (String(clicks[i].selector || "").indexOf("#yes-link") >= 0) { return true; } }
    } catch (e) {}
    return false;
  }
  function engineProblem() {
    if (CTA_BLOCKED) { return CTA_BLOCKED; }
    if (!window.jQuery) { return "jQuery isn't on this page, so ClickFunnels can't submit the order."; }
    if (!document.querySelector("#cfAR")) { return "this page has no ClickFunnels order form (#cfAR)."; }
    if (!cfYesHandlerBound()) { return "ClickFunnels' order button handler isn't on this page yet."; }
    return null;
  }
  var ACCEPT = null;   // engine-mode accept in flight: { at, submitted }
  // Hidden purchase[product_id] / upsell fields that CF's [data-upsell] handler appended on an earlier click (a retry
  // after a failed submit would otherwise post them twice). CF's own template row is not a direct hidden child.
  function clearUpsellFields() {
    var form = document.querySelector("#cfAR"); if (!form) { return; }
    var els = form.querySelectorAll(':scope > input[type="hidden"][name="upsell"], :scope > input[type="hidden"][name="purchase[product_id]"]');
    for (var i = 0; i < els.length; i++) { els[i].parentNode.removeChild(els[i]); }
  }
  function hiddenField(name, value) {
    var h = document.createElement("input"); h.type = "hidden"; h.name = name; h.value = value; h.setAttribute("data-pyb-appended", "1"); return h;
  }
  function stepUrl() { return String(location.href).split("#")[0]; }
  function acceptEngine(yes) {
    var why = engineProblem();
    if (why) {
      err("YES (engine mode) can't submit: " + why);
      ctaError(BLOCKED_MSG);
      return false;
    }
    if (ACCEPT && !ACCEPT.done) { return false; }
    ACCEPT = { at: Date.now(), submitted: false, done: false };
    // v5: the same link CF renders for a native 1-click-upsell button. CF's delegated [data-upsell] handler reads
    // data-purchase and appends purchase[product_id] + upsell=1 to #cfAR; then its #yes-link handler submits.
    clearUpsellFields();
    var bid = String(BASE.productID), a = document.createElement("a");
    a.href = stepUrl() + "#yes-link-multi-" + bid; a.setAttribute("data-pyb-native", "yes"); a.setAttribute("aria-hidden", "true");
    a.setAttribute("data-upsell", "1"); a.setAttribute("data-purchase", JSON.stringify({ product_id: bid }));
    a.style.display = "none"; a.textContent = "yes";
    (document.querySelector(".pyb") || document.body).appendChild(a);
    loading(true);
    log("YES (engine mode) — submitting through ClickFunnels' [data-upsell] + #yes-link handlers (purchase[product_id] " + bid + ", upsell=1).");
    a.click();
    setTimeout(function () { try { a.parentNode.removeChild(a); } catch (e) {} }, 10000);
    var mine = ACCEPT;
    setTimeout(function () {
      if (mine.submitted) { return; }
      mine.done = true; loading(false);
      err("YES (engine mode): ClickFunnels didn't submit the order within 6 s.");
      ctaError("Sorry, your order didn't go through. Please try again, or use the link below to continue.");
      if (yes) { yes.__pybSubmitting = 0; } update();
    }, 6000);
    return true;
  }
  function declineEngine() {
    var form = document.querySelector("#cfAR");
    var id = /^\d+$/.test(String(BASE.productID || "")) ? String(BASE.productID) : (PRODUCTS[0] ? PRODUCTS[0].id : "");
    var u;
    try { u = new URL((form && form.action) || stepUrl(), location.href); } catch (e) { u = new URL(stepUrl()); }
    u.searchParams.set("upsell", "0");
    if (id) { u.searchParams.set("purchase[product_id]", id); }
    u.hash = "no-link";
    loading(true);
    log("No thanks (engine mode) →", u.toString());
    location.href = u.toString();
  }
  function acceptNow(yes) {
    var mode = window.PYB.ctaMode = ctaMode();
    var ids = Object.keys(SELECTED);
    if (PREVIEW) {
      toast(mode === "native"
        ? "Preview — Yes would click the hidden oto-accept button and add product ids " + ids.join(", ") + " (native mode)."
        : "Preview — Yes would submit product ids " + ids.join(", ") + " + the base product " + (BASE.productID || "?") + " (engine mode, no hidden buttons).");
      return false;
    }
    if (mode === "native") { nativeLink("oto-accept").click(); return true; }
    return acceptEngine(yes);
  }
  function declineNow() {
    var mode = window.PYB.ctaMode = ctaMode();
    if (PREVIEW) {
      toast(mode === "native" ? "Preview — No thanks would click the hidden oto-decline button (native mode)."
                              : "Preview — No thanks would go to the next step without charging (engine mode).");
      return false;
    }
    if (mode === "native") {
      var a = nativeLink("oto-decline");
      if (a) { a.click(); return true; }
      warn('Native mode but no button with CSS Title "oto-decline" — declining in engine mode instead.');
    }
    declineEngine();
    return true;
  }

  // ==========================================================================
  // 7. SUBMIT — the only part that touches money  (2.0, unchanged)
  // ==========================================================================
  var TEMPLATE_HTML = null;
  function captureTemplate() {
    var node = document.querySelector('[data-cf-product-template="true"]');
    if (!node) { return false; }
    TEMPLATE_HTML = node.outerHTML;
    var inp = node.querySelector('[name="purchase[product_ids][]"]');
    if (inp) { inp.disabled = true; }
    return true;
  }
  function buildInput(id) {
    if (TEMPLATE_HTML) {
      var wrap = document.createElement("div"); wrap.innerHTML = TEMPLATE_HTML;
      var node = wrap.firstElementChild;
      var inp = node.querySelector('[name="purchase[product_ids][]"]');
      if (inp) { inp.value = id; inp.checked = true; inp.disabled = false; inp.setAttribute("checked", "checked"); }
      node.setAttribute("data-pyb-appended", "1"); node.removeAttribute("data-cf-product-template");
      return node;
    }
    var hidden = document.createElement("input");
    hidden.type = "hidden"; hidden.name = "purchase[product_ids][]"; hidden.value = id; hidden.setAttribute("data-pyb-appended", "1");
    return hidden;
  }
  // The order's MAIN product (engine mode, v4): CF's 1-click upsell is keyed on purchase[product_id]; the
  // product_ids[] are extras on top of it. A clone of CF's template row with its radio set, its checkbox removed.
  function buildMain(id) {
    if (TEMPLATE_HTML) {
      var wrap = document.createElement("div"); wrap.innerHTML = TEMPLATE_HTML;
      var node = wrap.firstElementChild, radio = node.querySelector('[name="purchase[product_id]"]');
      if (radio) {
        var extras = node.querySelectorAll('[name="purchase[product_ids][]"]');
        for (var i = 0; i < extras.length; i++) { extras[i].parentNode.removeChild(extras[i]); }
        radio.value = id; radio.checked = true; radio.disabled = false; radio.setAttribute("checked", "checked");
        node.setAttribute("data-pyb-appended", "1"); node.setAttribute("data-pyb-main", "1"); node.removeAttribute("data-cf-product-template");
        return node;
      }
    }
    var hidden = document.createElement("input");
    hidden.type = "hidden"; hidden.name = "purchase[product_id]"; hidden.value = id; hidden.setAttribute("data-pyb-appended", "1"); hidden.setAttribute("data-pyb-main", "1");
    return hidden;
  }
  // CF's own main-product field, if it carries one (not ours, enabled, checked when a radio): its value, else "".
  function formMain(form) {
    var els = form.querySelectorAll('[name="purchase[product_id]"]');
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.disabled || e.closest("[data-pyb-appended]") || e.hasAttribute("data-pyb-appended")) { continue; }
      if ((e.type === "checkbox" || e.type === "radio") && !e.checked) { continue; }
      if (String(e.value)) { return String(e.value); }
    }
    return "";
  }
  // Is this id already an enabled product field in the form (not one of ours)?
  function formHas(form, id) {
    var els = form.querySelectorAll('[name="purchase[product_ids][]"], [name="purchase[product_id]"]');
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.disabled || e.closest("[data-pyb-appended]") || e.hasAttribute("data-pyb-appended")) { continue; }
      if ((e.type === "checkbox" || e.type === "radio") && !e.checked) { continue; }
      if (String(e.value) === id) { return true; }
    }
    return false;
  }
  function onSubmit(form) {
    if (ADDON_PRESENT) { err("refusing to append products — a CF Pro Tools add-on is loaded and would double-charge."); return; }
    var old = form.querySelectorAll("[data-pyb-appended]");
    for (var i = 0; i < old.length; i++) { old[i].parentNode.removeChild(old[i]); }
    var ids = Object.keys(SELECTED), added = [];
    for (var j = 0; j < ids.length; j++) { if (BY_ID[ids[j]] && available(BY_ID[ids[j]])) { form.appendChild(buildInput(ids[j])); added.push(ids[j]); } }
    // Engine mode: the base product is the order's MAIN product, purchase[product_id] (v4), sent with the items
    // (never alone) and never also as an extra. If CF's form already names it as the main product, it isn't added.
    var mode = window.PYB.ctaMode = ctaMode(), baseNote = "";
    if (mode === "engine" && added.length && /^\d+$/.test(String(BASE.productID || ""))) {
      var bid = String(BASE.productID), main = formMain(form);
      // v5: normally CF's [data-upsell] handler has just appended purchase[product_id]=<base> and upsell=1 (from the
      // link's data-purchase / data-upsell). Only if it didn't (handler missing) does the engine add them.
      if (main === bid) { baseNote = " + base " + bid + " (purchase[product_id], added by ClickFunnels)"; }
      else {
        if (main) { warn("CF's form already names product " + main + " as the main product; the base " + bid + " replaces it."); }
        form.appendChild(buildMain(bid)); baseNote = " + base " + bid + " (purchase[product_id], added by the engine — CF's [data-upsell] handler didn't)";
      }
      if (!form.querySelector('[name="upsell"]')) { form.appendChild(hiddenField("upsell", "1")); baseNote += " + upsell=1 (added by the engine)"; }
      else { baseNote += " + upsell=1"; }
    }
    if (ACCEPT && !ACCEPT.done) { ACCEPT.submitted = true; ACCEPT.done = true; }
    log("submit (" + mode + " mode) — appending " + added.length + " product id(s):", (added.join(", ") || "(none)") + baseNote);
  }
  function bindSubmit() {
    var form = document.querySelector("#cfAR");
    if (!form) { if (!PREVIEW) { err("#cfAR not found — nothing selected on this page can reach the order. Is this the OTO step?"); } return false; }
    captureTemplate() || warn('No [data-cf-product-template="true"] on the page — falling back to a plain hidden input. Confirm with a test purchase.');
    form.addEventListener("submit", function () { onSubmit(form); }, true);
    if (window.jQuery) { try { window.jQuery(form).on("submit", function () { onSubmit(form); }); } catch (e) {} }
    return true;
  }

  // ==========================================================================
  // 8. CLICKS — delegated on document (survives CF re-rendering the subtree)
  // ==========================================================================
  document.addEventListener("click", function (ev) {
    var t = ev.target; if (!t || !t.closest) { return; }
    var btn = t.closest("[data-pyb-toggle]");
    if (btn) {
      ev.preventDefault(); ev.stopPropagation();
      var id = btn.getAttribute("data-pyb-toggle");
      if (!BY_ID[id]) { warn("click on unknown product id", id); return; }
      if (!available(BY_ID[id])) { return; }
      if (SELECTED[id]) { delete SELECTED[id]; } else { SELECTED[id] = true; }
      paint(id); update();
      try { document.dispatchEvent(new CustomEvent("pyb:change", { detail: { id: id, selected: !!SELECTED[id], all: Object.keys(SELECTED) } })); } catch (e) {}
      return;
    }
    if (t.closest("[data-pyb-go]")) {
      ev.preventDefault();
      var y = yesEl(); if (y && y.scrollIntoView) { y.scrollIntoView({ behavior: "smooth", block: "center" }); }
      return;
    }
    var yes = t.closest("[data-pyb-yes]");
    if (yes) {
      ev.preventDefault();
      if (yes.disabled || !Object.keys(SELECTED).length) { return; }
      yes.disabled = true; yes.__pybSubmitting = 1;
      setTimeout(function () { yes.__pybSubmitting = 0; update(); }, 4000);
      try { document.dispatchEvent(new CustomEvent("pyb:accept", { detail: { ids: Object.keys(SELECTED), base: BASE.productID } })); } catch (e) {}
      acceptNow(yes);
      return;
    }
    if (t.closest("[data-pyb-no]")) {
      ev.preventDefault();
      try { document.dispatchEvent(new CustomEvent("pyb:decline")); } catch (e) {}
      declineNow();
    }
  }, false);

  // Guard the NATIVE accept while the box is empty (capture phase, before CF).
  window.addEventListener("click", function (ev) {
    var t = ev.target;
    var hit = t && t.closest ? t.closest('[data-title*="oto-accept"]') : null;
    if (!hit || (hit.closest && hit.closest(".pyb")) || Object.keys(SELECTED).length) { return; }
    ev.preventDefault(); ev.stopImmediatePropagation(); ev.stopPropagation();
  }, true);

  // ==========================================================================
  // 9. MOUNT + LAYOUT  (2.0, unchanged)
  // ==========================================================================
  function findMount() {
    var el = null;
    if (OPT.mount) { try { el = document.querySelector(OPT.mount); } catch (e) {} if (el) { return el; } }
    el = document.getElementById("pyb-root") || document.querySelector("[data-pyb-root]");
    if (el) { return el; }
    var accept = document.querySelector('[data-title*="oto-accept"]');
    if (accept) {
      var row = accept.closest(".row") || accept.parentNode;
      var d = document.createElement("div"); d.id = "pyb-root";
      row.parentNode.insertBefore(d, row);
      warn("no #pyb-root on the page — inserted one before the hidden oto-accept section. Add a Custom HTML/JS element holding <div id=\"pyb-root\"></div> to the template.");
      return d;
    }
    return null;
  }
  function syncScrollbarWidth() {
    try { var sbw = window.innerWidth - document.documentElement.clientWidth; if (!(sbw >= 0)) { sbw = 0; }
          document.documentElement.style.setProperty("--pyb-sbw", sbw + "px"); } catch (e) {}
  }
  function syncContainerWidth(root) {
    try {
      var ref = root.closest(".containerInner") || root.closest(".row");
      if (!ref) { return; }
      var cs = getComputedStyle(ref);
      var w = ref.getBoundingClientRect().width - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      if (w > 200) { document.documentElement.style.setProperty("--pyb-cw", Math.round(w) + "px"); }
    } catch (e) {}
  }

  // ==========================================================================
  // 10. LIVE STOCK — the shared stock file can only change a product's status.
  // ==========================================================================
  function applyStock(root, data) {
    // schema 2 (2026-10-02, master catalog): one status per product, { products: { cfName: status } }.
    // schema 1: per product set, { catalogs: { <set>: { cfName: status } } } — still read.
    var set = data && (data.products && typeof data.products === "object" && !Array.isArray(data.products) ? data.products : data.catalogs && data.catalogs[OPT.catalog]);
    if (!set || typeof set !== "object") { window.PYB.stock.error = "catalog “" + OPT.catalog + "” not in the stock file"; warn("stock file has no entry for catalog", OPT.catalog, "— keeping the footer's statuses."); return; }
    var changed = [], gone = [];
    for (var i = 0; i < PRODUCTS.length; i++) {
      var p = PRODUCTS[i], s = set[p.name];
      if (!STATUSES[s] || s === p.status) { continue; }
      changed.push(p.name + ": " + p.status + " → " + s);
      p.status = s;
      if (SELECTED[p.id] && !available(p)) { delete SELECTED[p.id]; gone.push(p); }
    }
    window.PYB.stock.source = "cdn"; window.PYB.stock.updated = data.updated || null;
    if (changed.length) {
      log("stock file (" + (data.updated || "no date") + ") changed " + changed.length + " status(es): " + changed.join("; "));
      render(root); update();
      for (var g = 0; g < gone.length; g++) { toast(fill(COPY.goneToast, { title: gone[g].title })); }
      try { document.dispatchEvent(new CustomEvent("pyb:stock", { detail: window.PYB.stock })); } catch (e) {}
    } else { log("stock file (" + (data.updated || "no date") + ") read — statuses match the footer."); }
  }
  function fetchStock(root) {
    if (!OPT.stockUrl || PREVIEW || !window.fetch) { return; }
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) { ctl.abort(); } }, 5000);
    fetch(OPT.stockUrl, ctl ? { signal: ctl.signal } : {}).then(function (r) {
      if (!r.ok) { throw new Error("HTTP " + r.status); } return r.json();
    }).then(function (d) { clearTimeout(timer); applyStock(root, d); }).catch(function (e) {
      clearTimeout(timer); window.PYB.stock.error = String(e && e.message || e);
      warn("stock file not read (" + window.PYB.stock.error + ") — using the footer's statuses.");
    });
  }

  function mount() {
    var root = findMount();
    if (!root) {
      err("no #pyb-root on the page and no oto-accept section to anchor to — nothing rendered.");
      var d = document.createElement("div"); d.className = "pyb"; banner(d, "This step has no #pyb-root element and no hidden oto-accept section. Add a Custom HTML/JS element holding <div id=\"pyb-root\"></div>."); document.body.appendChild(d);
      return;
    }
    root.classList.add("pyb");
    root.setAttribute("data-pyb-skin", OPT.skin || "");
    root.style.setProperty("--pyb-cols", String(parseInt(OPT.columns, 10) || 1));
    window.PYB.ctaMode = ctaMode();
    if (window.PYB.ctaMode === "engine" && !PREVIEW && !/^\d+$/.test(String(BASE.productID || ""))) {
      CTA_BLOCKED = "the base product has no ClickFunnels id (" + JSON.stringify(BASE.productID) + "), so YES can't charge it.";
      problem("engine mode: " + CTA_BLOCKED);
    }
    render(root);
    if (FATAL || ADDON_PRESENT) { return; }
    bindSubmit();
    buildBar();
    fetchStock(root);

    var syncLayout = function () { syncScrollbarWidth(); syncContainerWidth(root); };
    syncLayout(); setTimeout(syncLayout, 1500); setTimeout(syncLayout, 6000);
    var rt = null; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(syncLayout, 100); });

    // CF re-renders the custom-HTML subtree after we run: put the block back
    // with the selection intact, and re-sync the YES state after any change.
    try {
      var mt = null;
      new MutationObserver(function () {
        var r = document.getElementById("pyb-root") || document.querySelector("[data-pyb-root]");
        if (r && !r.querySelector("[data-pyb-grid]")) { warn("block was removed (CF re-render) — restoring with selection intact."); r.classList.add("pyb"); render(r); syncLayout(); }
        clearTimeout(mt); mt = setTimeout(update, 50);
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}

    log("ready — " + PRODUCTS.length + " active product(s) (" + PRODUCTS.filter(available).length + " available, sold-out " + SOLD_OUT_MODE + "), base " + BASE_NAME + " " + money2(BASE_PRICE) +
        ", funnel " + (OPT.funnelId || "?") + " step " + (OPT.stepId || "?") + ", engine ref " + REF + ", CTAs " + window.PYB.ctaMode + " mode" + (PROBLEMS.length ? ", " + PROBLEMS.length + " problem(s)" : ""));
    try { document.dispatchEvent(new CustomEvent("pyb:ready", { detail: window.PYB })); } catch (e) {}
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", mount); } else { mount(); }
})();
