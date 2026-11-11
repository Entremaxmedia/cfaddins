# cfaddins: ClickFunnels add-ins (Ace Media / Entremax)

Scripts and styles that our **ClickFunnels Classic** order forms and upsell pages load from this repo through jsDelivr:

```
https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/<file>
```

**`main` is production.** Every push to `main` reaches live order forms (jsDelivr caches `@main` for up to 12 hours;
purge with `https://purge.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/<file>`). Read [the rules](#rules) before changing anything.

> **Which version is current?** [`cdn/INDEX.md`](cdn/INDEX.md) is the only place that says. This README describes the
> modules; it doesn't repeat version numbers, so it can't go stale.

## Modules

Each module reads its settings from a `window.*` object that the page's **Footer Code** sets *before* loading the script.

| Module | Files (`cdn/`) | What it does | Settings | Docs |
|---|---|---|---|---|
| **Phone validation** | `Phone-Validation.js` | On the 2-Step order form, blocks the step-1 button until the phone number is a plausible 10-digit US number (no letters, an area code that doesn't start with 0 or 1, and none of the obvious fakes such as `1234567890` or one digit ten times), then saves it as `+1XXXXXXXXXX`. **Load it first in every order-form Footer Code.** | none | the file's comments |
| **Bump selector** | `bump-selector-v<version>.js` + `bump-selector-base.css` + `bump-selector-fx.css` | Adds a quantity/variant dropdown to an order bump: one checkbox, several products behind it. Hides the variant rows, keeps exactly one variant checked, and keeps the order summary in sync through ClickFunnels and CF Pro Tools re-renders. Each version fixes a duplicate-charge race in the one before, so use the current one for new builds. | `window.BUMP_CONFIG` | [QUICK_START](cdn/QUICK_START.md) · [reference](cdn/BUMP_SELECTOR_README.md) · [INDEX](cdn/INDEX.md) |
| **Product row hider** | `product-row-hider.js` | Keeps listed products hidden on the order form, even when ClickFunnels or CF Pro Tools redraws the form. | `window.FORCE_HIDE_PRODS` (product ids) | the file's comments |
| **Hidden product upsell popup** | `hidden-product-upsell-popup.js` + `hidden-product-upsell-popup.css` | When the buyer selects a trigger product on the order form, a popup offers an upgrade (a hidden product). Accepting swaps the selection to the upgrade and highlights its row; clicking that row switches back. `alsoHideOnUpsell` hides more products while the upgrade is chosen. The popup's content is designed in the ClickFunnels editor. | `window.UPSELL_CONFIG` | [docs/hidden-product-upsell-popup.md](docs/hidden-product-upsell-popup.md) |
| **1st Hour Protocols upsell** | `protocols/1st-hour-protocols-v<version>.js` | The 15-book Protocols one-time offer: draws the whole ordering section into a fixed mount on the page and orders through ClickFunnels' own upsell handler. Footer Code is generated per step by the Team Hub Protocols workbench. | `window.P3_CONFIG` | [cdn/protocols/README.md](cdn/protocols/README.md) |

### A typical order-form Footer Code

```html
<!-- Load Phone-Validation.js -->
<script src="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/Phone-Validation.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/bump-selector-base.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/bump-selector-fx.css">
<script>
  window.BUMP_CONFIG = [
    { mainProductId: '5013847', associatedIds: ['5016509', '5016511'], defaultIndex: 0, featuredText: '*BEST VALUE!*' }
  ];
</script>
<!-- File name of the current bump selector: cdn/INDEX.md -->
<script src="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/bump-selector-v<current>.js"></script>
```

### Kept for funnels that already use them (don't use in new builds)

Live pages still point at these, so they stay. New work uses the modules above.

| Files (`cdn/`) | What it is |
|---|---|
| `bump-selector-v<older>.js` | Earlier bump selector versions. [INDEX](cdn/INDEX.md) lists them and what each later version fixed. Move a funnel to the current one when you're already working on it. |
| `bump-selector-core.js` + `bump-selector-styles.css` | An earlier bump selector line (the "v1.3.0" refactor). |
| `bump-selector-complete-core.js`, `bump-selector-complete-core-v2.js` | Bump selector and product hiding in one file. `-v2` is what [`TrumpMysteryGift2.0_FooterCode_MODULARIZED.html`](cdn/TrumpMysteryGift2.0_FooterCode_MODULARIZED.html) loads. |

### Do not use

| File | Why |
|---|---|
| `cdn/testimonial-listing.js` | Since its v1.0.2 it **makes up** testimonials: random reviewer names, 4–5 star ratings and recent dates. Shown to buyers as reviews, that's a fabricated review. Kept only because removing a CDN file can break a page that loads it. |

## Also in this repo

| Path | What it is |
|---|---|
| `cdn/*.md` | Bump selector documentation: [INDEX](cdn/INDEX.md) (start here), QUICK_START, BUMP_SELECTOR_README, ARCHITECTURE and the refactor notes. |
| `docs/` | Longer write-ups of the bump selector and the upsell popup. |
| `orderforms/` | Test order forms and example Footer Code (`navy-bar/`) for trying modules outside a live funnel. |
| `cdn/TrumpMysteryGift2.0_FooterCode_MODULARIZED.html` | A complete example footer that loads several modules. |
| `Clickfunnels Stats Extractor V14` | Not a CDN file: a DevTools console script for a funnel's stats page (units per order form, revenue, opt-ins per sale). |

Some older file headers and docs still name the repo's previous home, `kratner/ace-media-cfaddins`. Pages must load from
**`entremaxmedia/cfaddins`**: the old repo stops at an early bump selector version and doesn't have the newer files.

## Rules

Live order forms load these files by name, so:

1. **Never delete or rename a file under `cdn/`.** Some funnel somewhere still loads it.
2. **A change is a new versioned file** (e.g. the next `bump-selector-v…js`), never an edit to a version that pages already load.
3. **Test on one funnel first.** Develop in the funnel's acelib folder, then copy the finished file here.
4. **Update [`cdn/INDEX.md`](cdn/INDEX.md)** in the same change: the new version, what it fixes, and that it's current.
5. **Go through a pull request** and tell the team before merging. Merging to `main` is what makes it live.
6. **Multi-file modules get their own folder** under `cdn/` (like `cdn/protocols/`).

Source, SOPs and per-funnel setups live in the team's acelib workspace (`cdn/`, `Snippets/CDN/`, and each funnel's folder).
