/* ============================================================================
   FILE: cc-exp-formatter-v1.0.0.js
   PATH: cdn/cc-exp-formatter-v1.0.0.js  (repo Entremaxmedia/cfaddins; source + tests: acelib Snippets/cc-exp-formatter/)
   ----------------------------------------------------------------------------
   Card EXPIRY auto-format for ClickFunnels Classic order forms on gateways
   that CF doesn't format for (EasyPayDirect, NMI-style "card fields" forms).

   WHY (found 2026-11-23 on Mini Molly Pouch 13714093, an EasyPayDirect form):
     CF's lander.js only formats the expiry box when the gateway is Recurly:
       function formatRecurlyExpirationDate(){ "undefined"!=typeof recurly && ... }
     -- that is the function that inserts the "/" (".match(/.{1,2}/g).join('/')").
     On EasyPayDirect `recurly` is undefined, so nothing formats the box, but CF
     still splits the value on "/" to get month and year. A customer who types
     "630" or "0630" (no slash) is declined. Stripe forms use Stripe Elements
     (their own expiry box) and Recurly forms have CF's formatter: both are left
     alone by this script.

   WHAT IT DOES (only the visible input[name="purchase[credit_card_exp_date_month_year]"]):
     - while typing: digits only, slash inserted automatically -> "MM/YY";
       a first digit 2-9 becomes "0d/"; "1" waits for the second digit
       ("13" -> "01/3"); backspace over the slash works normally; a 4-digit
       year is kept while typing ("12/2030") and shortened on blur -- never
       truncated mid-typing, which would make a wrong but valid-looking date.
     - on blur / change / before submit: normalizes what was typed or pasted:
       "630" "0630" "6/30" "06/2030" "062030" "6-30" "06 / 30" -> "06/30".
       Anything it can't read (e.g. month 13) is left as typed for CF to reject.
     - mobile: numeric keypad (inputmode=numeric), autocomplete=cc-exp, maxlength 7 (room for a pasted "06/2030").
   Never touches card number / CVC, never submits, no network calls.
   Safe to load twice (guard). Works with or without jQuery.

   USE: in the order step's Footer Code, after Phone-Validation:
     <!-- Card expiry auto-format (EasyPayDirect) -->
     <script src="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/cc-exp-formatter-v1.0.0.js"></script>
   (served by jsdelivr from Entremaxmedia/cfaddins @main since 2026-11-23)

   REVISION HISTORY
     v1.0.0  2026-11-23  Claude (Keith's session) -- first version.
============================================================================ */
(function () {
  'use strict';
  if (window.__ccExpFormatter) return;
  window.__ccExpFormatter = '1.0.0';

  var SEL = 'input[name="purchase[credit_card_exp_date_month_year]"]';

  function cfFormatsItself() { return typeof window.recurly !== 'undefined'; }

  // Live format from the digits typed so far.
  function live(raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.length === 1) return /[2-9]/.test(d) ? '0' + d + '/' : d;
    var mm = d.slice(0, 2), rest = d.slice(2);
    if (+mm > 12) { mm = '0' + d[0]; rest = d.slice(1); }   // "13" -> "01/3"
    if (mm === '00') return '0';
    // Keep up to 4 year digits while typing: a customer typing "2030" must not be cut to "20"
    // (a valid-looking WRONG date). Blur turns a 4-digit year into 2 digits.
    return mm + '/' + rest.slice(0, 4);
  }

  // Full normalization of a finished value (typed or pasted). Returns null if unreadable.
  function normalize(raw) {
    var s = String(raw || '').trim();
    if (!s) return '';
    var m = s.match(/^(\d{1,2})\s*[\/\-. ]\s*(\d{2}|\d{4})$/);           // 6/30  06-2030  06 / 30
    if (!m) {
      // A separator was typed but the value isn't a clean MM/YY or MM/YYYY (e.g. "12/203", half
      // a year): never reinterpret it -- leave it as typed for CF to reject.
      if (/[\/\-. ]/.test(s)) return null;
      var d = s.replace(/\D/g, '');
      if (d.length === 3) m = [s, d.slice(0, 1), d.slice(1)];                            // 630
      else if (d.length === 4) m = [s, d.slice(0, 2), d.slice(2)];                       // 0630
      else if (d.length === 5 && d.slice(1, 3) === '20') m = [s, d.slice(0, 1), d.slice(1)];  // 62030
      else if (d.length === 6 && d.slice(2, 4) === '20') m = [s, d.slice(0, 2), d.slice(2)];  // 062030
      else return null;
    }
    var mm = +m[1], yy = m[2].length === 4 ? m[2].slice(2) : m[2];
    if (mm < 1 || mm > 12) return null;
    return (mm < 10 ? '0' : '') + mm + '/' + yy;
  }

  function fire(el, type) {
    try { el.dispatchEvent(new Event(type, { bubbles: true })); } catch (e) {}
  }

  function wire(el) {
    if (!el || el.__ccExpWired) return;
    el.__ccExpWired = true;
    el.setAttribute('inputmode', 'numeric');
    el.setAttribute('autocomplete', 'cc-exp');
    el.setAttribute('maxlength', '7');   // room for a pasted "06/2030" until blur shortens it

    el.addEventListener('keydown', function (e) {
      if (cfFormatsItself()) return;
      // Backspace right after an auto-inserted slash removes the digit before it too.
      if (e.key === 'Backspace' && el.selectionStart === el.selectionEnd && el.selectionStart === el.value.length && /\/$/.test(el.value)) {
        e.preventDefault();
        el.value = el.value.slice(0, -2);
      }
    });

    el.addEventListener('input', function (e) {
      if (cfFormatsItself()) return;
      if (e.inputType && e.inputType.indexOf('delete') === 0) return;   // let deletions through untouched
      var v = el.value;
      var f = live(v);
      if (f !== v) { el.value = f; try { el.setSelectionRange(f.length, f.length); } catch (x) {} }
    });

    var finish = function () {
      if (cfFormatsItself()) return;
      var n = normalize(el.value);
      if (n !== null && n !== el.value) { el.value = n; fire(el, 'change'); }
    };
    el.addEventListener('blur', finish);
    el.addEventListener('change', finish);
    var form = el.form || document.getElementById('cfAR');
    if (form) form.addEventListener('submit', finish, true);
    // CF's 2-Step "Complete Order" button is a link that submits #cfAR from JS: normalize on press too.
    document.addEventListener('mousedown', function (e) {
      if (e.target && e.target.closest && e.target.closest('a[href="#submit-form"], a[href="#submit-form-2step-order"], .elButton')) finish();
    }, true);
    document.addEventListener('touchstart', function (e) {
      if (e.target && e.target.closest && e.target.closest('a[href="#submit-form"], a[href="#submit-form-2step-order"], .elButton')) finish();
    }, { capture: true, passive: true });
  }

  function scan() { var l = document.querySelectorAll(SEL); for (var i = 0; i < l.length; i++) wire(l[i]); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  setTimeout(scan, 1500); setTimeout(scan, 4000);

  window.__ccExpFormatterFns = { live: live, normalize: normalize };   // for tests
})();
