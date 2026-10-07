# Pack Your Box 3.0 — `cdn/pyb/`

Files for the Pack Your Box post-purchase upsell (the buyer builds a box; each
product has a +ADD button; the chosen products are added to the order).
Published from acelib `Upsells/Pack Your Box/Pack Your Box 3.0/Engine/` by
`Scripts/publish_pyb_v1.mjs`. **Don't edit these files here.** Edit the acelib
sources and publish them again.

| File | What it is | Who reads it |
|---|---|---|
| `pack-your-box.js` | the engine: renders the box into `<div id="pyb-root">` and appends the chosen products at submit | the live page (Footer Code) |
| `pack-your-box.css` | structure; brand values are CSS variables | the live page |
| `pack-your-box-skin-<brand>.css` | a brand's fonts and colours | the live page |
| `pack-your-box-stock.json` | one status per product: in-stock / low-stock / sold-out / discontinued | the live page, on every load (it can only change a status) |
| `pack-your-box-catalog.json` | the master catalog: products and the versions that sell them | the Catalog Workbench (never a live page) |

## Footer Code (made by the Catalog Workbench, never by hand)

```html
<script>
window.PYB_CONFIG  = [ /* one line per product on this page, with this step's CF product ids */ ];
window.PYB_OPTIONS = { schema: 1, funnelId: '…', stepId: '…', catalog: 'standard', release: 'pyb-v3.0.0', skin: 'standard',
                       base: { productID: '…', productName: 'Shipping', productPrice: 10 },
                       stockUrl: 'https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@main/cdn/pyb/pack-your-box-stock.json', … };
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@pyb-v3.0.0/cdn/pyb/pack-your-box.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@pyb-v3.0.0/cdn/pyb/pack-your-box-skin-standard.css">
<script src="https://cdn.jsdelivr.net/gh/entremaxmedia/cfaddins@pyb-v3.0.0/cdn/pyb/pack-your-box.js"></script>
```

## Versioning

- **A release is a git tag `pyb-vX.Y.Z`.** Filenames carry no version. A footer pins a tag, so a page only
  changes when someone edits its footer. A pushed tag is never moved or deleted; a fix gets a new patch tag.
- **Branches (`@pyb3-dev`, `@main`) are for development and test steps.** The engine logs a warning when
  it's loaded from something other than a release tag.
- **The stock and catalog files are live data.** They are read from a branch, not a tag, so a status
  change reaches every page without re-pasting footers.
- `cdn/INDEX.md` names the current release.

Status (2026-10-02): first publish on branch `pyb3-dev`. The `pyb-v3.0.0` tag follows the first live
test purchase.
