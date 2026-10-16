# cdn/protocols/ — 1st Hour Protocols Upsell

The engine for the 15-book **1st Hour Protocols** one-time offer (ClickFunnels Classic).
Source, build, tests and SOP live in acelib: `Upsells/1st Hour/Protocols Upsell/`.
Published by `Upsells/1st Hour/Protocols Upsell/Scripts/publish_protocols_cdn_v1.mjs`.

## How a step uses it

1. **Page:** one Custom HTML element holding the fixed mount (`div[data-p3-root]`). It's the same on every funnel.
2. **Footer Code:** generated per step by the Team Hub Protocols workbench. Select all and replace with it:

```html
<script>
  window.P3_CONFIG = {
    version: "3.1.0",
    funnel: "<funnel id>", step: "<step id>",
    library: "<Complete Library product id>",
    books: [ "<book 1 id>", "...", "<book 15 id>" ]   // 15 ids, in the catalog's book order
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/protocols/1st-hour-protocols-v3.1.0.js"></script>
```

The file carries the engine, the catalog (card copy, covers, prices) and the CSS. It draws the whole ordering
section into the mount and orders through ClickFunnels' own upsell handler: one main product plus extras, `upsell=1`.
It refuses YES while a `cdn.cfptaddons.com` script is on the page, and shows a **Setup needed** panel when
`P3_CONFIG` doesn't hold 16 valid ids.

## Rules

- **Versioned files are never edited, renamed or deleted.** A change is a new version (`-v3.1.1.js`, ...), and
  existing steps stay on the version they pin until someone upgrades them.
- New versions are proven on the `protocols-dev` branch (a live test purchase) before they go to `main`.
- `cdn/INDEX.md` lists every version and marks the current one.
