/* 1st Hour Protocols Upsell v3.1.0 -- engine + catalog + CSS. Built 2026-10-16 from Upsells/1st Hour/Protocols Upsell/Staging/v3.1/ (acelib). Loaded by a step's Footer Code, which sets window.P3_CONFIG. Versioned file: never edit once published; a change is a new version. */
/* ============================================================================
   FILE: protocols-engine_v3.1-draft_v1.js
   PATH: Upsells/1st Hour/Protocols Upsell/Staging/v3.1/protocols-engine_v3.1-draft_v1.js (STAGING)
   ----------------------------------------------------------------------------
   1st Hour Protocols Upsell v3.1 -- the CDN engine. Built (with catalog.json
   and the CSS) into ONE versioned file, 1st-hour-protocols-v3.1.0.js, that a
   step's Footer Code loads. Edit THIS file, catalog.json or the CSS, then
   rebuild with build_v3.1-draft_v1.mjs.

   WHAT CHANGES FROM v3 (the page architecture, Keith 2026-10-15):
     v3   one Custom HTML element held the markup, the ids and the engine
          (Base64), replaced per funnel.
     v3.1 the page holds ONE FIXED mount element, the same on every funnel and
          never edited: <div class="p3-root" data-p3-root data-p3-mount>.
          The step's FOOTER CODE (generated per funnel by the Team Hub
          Protocols workbench) sets window.P3_CONFIG (the 16 product ids) and
          loads this file from the CDN, pinned to an exact version. The engine
          draws the whole ordering section from the catalog into the mount.
   WHAT DOES NOT CHANGE: selection, the summary, and how YES / No thanks
   order -- the code below the RENDER section is v3's, released 2026-10-15
   after live test purchases:
     YES  -> a hidden <a href="<step>#yes-link-multi-<main>" data-upsell="1"
             data-purchase='{"product_id":"<main>"}'> is clicked; CF's own
             [data-upsell] handler adds purchase[product_id] + upsell=1 and its
             #yes-link handler submits #cfAR; the submit hook adds the other
             chosen books as purchase[product_ids][] extras. Main = the
             Complete Library, or the first chosen book. $1 Fulfillment: never.
     NO   -> #cfAR's action + upsell=0&purchase[product_id]=<book 1>#no-link.
   SETUP NEEDED: with no P3_CONFIG, or ids that aren't 16 product ids (the page
   template's placeholder footer sends "SET-ME"), it draws the layout plus a
   yellow "Setup needed" panel and YES stays off.
   TIMING: CF injects the page's custom elements itself, so this file can run
   before the mount exists; it watches the page for up to 20 s.

   window.P3_CONFIG (set by the footer, before this file loads):
     { library: "<id>", books: ["<id>" x15, the catalog's order], version: "3.1.0" }
   Debug: window.P3; console lines start with [P3].

   REVISION HISTORY
   - v3.1 draft 1 (2026-10-15, Keith + Claude): mount + footer architecture;
     catalog-driven rendering; setup panel; v3's ordering code unchanged.
============================================================================ */
(function () {
  "use strict";
  if (window.__p3Ran) { return; }
  window.__p3Ran = 1;

  var CATALOG = {"library":{"title":"ALL 1ST HOUR PROTOCOLS \u2014 Complete Library (15 Protocols)","sub":"Get the entire library - a $450 Value","subRed":"for only $79.99","image":"https://mtp-images.com/pr-photo-6694.webp","imageAlt":"All 15 1st Hour Protocols books: $450 retail, only $79 today. 252 pages, 201 topics.","add":"ADD THE COMPLETE LIBRARY","added":"COMPLETE LIBRARY ADDED","price":"79.99","value":"450"},"heading":"Build Your Protocol Library","quick":{"all":"Unlock All 15 \u2014 Complete Library $79.99","allNote":"($450 Value)","a":"Track A \u2014 8 Trauma-Response Guides","b":"Track B \u2014 7 Emergency-Prep Guides","clear":"Clear Selections"},"cta":{"yes":"ADD THESE TO MY ORDER!","yesSubEmpty":"Choose your protocols above","no":"No Thanks, Show Me My Next Bonus","cardsImage":"https://www.shop.1sthour.com/hosted/images/images/credit-only.png","barEmpty":"Select Protocols Above","barFull":"Add To My Order"},"books":[{"slug":"severe-bleeding","track":"A","title":"Severe Bleeding & Hemorrhage Control","cover":"https://mtp-images.com/pr-photo-6689.webp","copy":"Uncontrolled bleeding kills faster than almost anything else you'll face in an emergency, sometimes in under five minutes. This book walks you through tourniquet placement and wound packing step by step, the same two skills that stop the clock on blood loss. Master this one first. Every other protocol in this library builds on it.","retail":"30","price":"9.99"},{"slug":"gunshot-wound-response","track":"A","title":"Gunshot Wound Response","cover":"https://mtp-images.com/pr-photo-6685.webp","copy":"A gunshot wound isn't one injury, it's a fast-moving assessment problem. You'll learn to check entry and exit points, spot the internal bleeding red flags that don't show on the surface, and secure the scene before you even touch the wound. Clear steps for a situation where hesitation costs the most.","retail":"30","price":"9.99"},{"slug":"burn-injury","track":"A","title":"Burn Injury Response","cover":"https://mtp-images.com/pr-photo-6681.webp","copy":"Thermal, chemical, and electrical burns each demand a different first move, and using the wrong one can make the injury worse. This book separates the three, giving you a clear response for each so you're never guessing under pressure. Know which burn you're looking at, and you'll know exactly what to do next.","retail":"30","price":"9.99"},{"slug":"stroke-response","track":"A","title":"Stroke Recognition & Response","cover":"https://mtp-images.com/pr-photo-6691.webp","copy":"Time is brain. That's not a slogan, it's the reality of stroke response, where minutes decide how much function a person keeps. This book breaks down the FAST test until it's second nature, so you can spot the signs and act before the ambulance arrives.","retail":"30","price":"9.99"},{"slug":"car-accident-trauma","track":"A","title":"Car Accident Trauma","cover":"https://mtp-images.com/pr-photo-6682.webp","copy":"A crash scene is chaos: multiple people hurt, unknown injuries, and a narrow window to act safely. This book covers scene safety, spinal precautions, and how to triage when more than one person needs help at once. Everything you need to be the calm one when the wreckage is still smoking.","retail":"30","price":"9.99"},{"slug":"choking-airway","track":"A","title":"Choking / Airway Obstruction","cover":"https://mtp-images.com/pr-photo-6683.webp","copy":"A blocked airway gives you minutes, sometimes seconds. This book covers the abdominal thrust technique for adults, the modified approach for infants, and how to clear your own airway if you're choking alone. Simple, physical, and something you can do without a second person in the room.","retail":"30","price":"9.99"},{"slug":"broken-bones-splinting","track":"A","title":"Broken Bones & Splinting","cover":"https://mtp-images.com/pr-photo-6680.webp","copy":"A break in the field isn't the end of a trip, it's a problem you can manage with the right technique. This book shows you how to splint arms, legs, and joints using kit supplies or whatever's on hand, plus how to rig a sling that actually holds. Improvise with confidence instead of guessing.","retail":"30","price":"9.99"},{"slug":"shock-management","track":"A","title":"Shock Management","cover":"https://mtp-images.com/pr-photo-6690.webp","copy":"Shock can follow blood loss, a severe allergic reaction, a cardiac event, or heat exposure, and it kills quietly while everyone's focused on the obvious injury. This book teaches you to recognize the early signs across all four causes and the steps to stabilize someone before it spirals. Don't let the second problem become the fatal one.","retail":"30","price":"9.99"},{"slug":"grid-down","track":"B","title":"Grid-Down / Extended Power Outage","cover":"https://mtp-images.com/pr-photo-6684.webp","copy":"The first 24 hours without power decide how the rest of the outage goes. This book covers food safety as your fridge warms, water backup plans, safe generator setup, and the carbon monoxide risks that send more people to the ER than the outage itself. Practical steps for the hours that matter most.","retail":"30","price":"9.99"},{"slug":"nuclear-threat","track":"B","title":"Nuclear Threat & Fallout Sheltering","cover":"https://mtp-images.com/pr-photo-6688.webp","copy":"A nuclear threat sounds like the end of options, but it isn't. This book lays out the calm, procedural framework: get inside, stay inside, stay tuned, and exactly what each of those steps actually looks like in your home. Clear guidance built to cut through panic when panic is the biggest threat.","retail":"30","price":"9.99"},{"slug":"tornado-response","track":"B","title":"Tornado Response & Aftermath","cover":"https://mtp-images.com/pr-photo-6692.webp","copy":"Knowing the difference between a watch and a warning is the first decision that matters, and this book makes sure you never confuse the two. It covers the best shelter option for your specific home type and the hazards that show up after the storm passes, when people let their guard down. Preparation before, and vigilance after.","retail":"30","price":"9.99"},{"slug":"iceover-event","track":"B","title":"Ice Storm / Winter Grid Failure","cover":"https://mtp-images.com/pr-photo-6687.webp","copy":"An ice storm brings two separate threats: the cold itself, and the mistakes people make trying to stay warm without power. This book covers hypothermia and frostbite care alongside safe indoor heating methods that won't put carbon monoxide in the air you're breathing. Stay warm without trading one danger for another.","retail":"30","price":"9.99"},{"slug":"active-shooter","track":"B","title":"Active Shooter \u2014 Civilian Response","cover":"https://mtp-images.com/pr-photo-6679.webp","copy":"There's no good option in an active shooter situation, only the option that gives you the best odds. This book explains the Run-Hide-Fight framework in plain terms, calmly and procedurally, so the decision tree is already in your head before you ever need it. Preparation here isn't paranoia, it's respect for the moment.","retail":"30","price":"9.99"},{"slug":"home-invasion","track":"B","title":"Home Invasion / Intruder Response","cover":"https://mtp-images.com/pr-photo-6686.webp","copy":"A home invasion is won or lost in the first thirty seconds. This book covers how to secure your space, signal for help, and de-escalate when possible, plus the prevention steps that keep most intruders from getting that far in the first place. Response and prevention, built for the home you actually live in.","retail":"30","price":"9.99"},{"slug":"wildfire-evacuation","track":"B","title":"Wildfire Evacuation","cover":"https://mtp-images.com/pr-photo-6693.webp","copy":"Wildfire evacuation decisions get made fast, often with smoke already in the air. This book breaks down the evacuation-level triggers you shouldn't ignore, what actually belongs in a go-bag versus what's just weight, and first aid for smoke inhalation on the way out. Know your triggers before the fire sets them for you.","retail":"30","price":"9.99"}]};
  var CSS = ".p3-root {\n    --p3-red: #e21c13; --p3-red-dark: #9e120c; --p3-ink: #ffffff; --p3-soft: #cfcfcf; --p3-line: #4a4a4a; --p3-panel: #0b0b0b;\n    --p3-display: \"Fjalla One\", Anton, Oswald, Impact, \"Arial Narrow Bold\", sans-serif;\n    --p3-sans: Inter, Roboto, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Arial, sans-serif;\n    box-sizing: border-box !important;\n    width: 100vw !important; max-width: 100vw !important;\n    margin-left: calc(-50vw + 50%) !important; margin-right: calc(-50vw + 50%) !important;\n    background: #000000 !important; color: var(--p3-ink) !important;\n    font-family: var(--p3-sans) !important; font-size: clamp(16px, 1.5vw, 18px) !important; line-height: 1.55 !important;\n    padding: clamp(28px, 4vw, 48px) 0 120px 0 !important;\n    -webkit-text-size-adjust: 100% !important; text-size-adjust: 100% !important;\n  }\n  .p3-root *, .p3-root *::before, .p3-root *::after { box-sizing: border-box !important; }\n  .p3-wrap { width: 100% !important; max-width: 1140px !important; margin: 0 auto !important; padding: 0 clamp(14px, 3vw, 28px) !important; }\n  .p3-root img { display: block !important; max-width: 100% !important; height: auto !important; border: 0 !important; }\n  .p3-root p { margin: 0 !important; }\n  .p3-root button { font: inherit; cursor: pointer !important; -webkit-appearance: none !important; appearance: none !important; }\n\n  /* ---- Complete Library block ---- */\n  .p3-library { border: 1px solid var(--p3-line) !important; background: var(--p3-panel) !important; max-width: 880px !important; margin: 0 auto !important; transition: box-shadow .2s ease !important; }\n  .p3-library.is-added { border-color: var(--p3-red) !important; box-shadow: 0 0 0 3px var(--p3-red) inset !important; }\n  .p3-library-art img { width: 100% !important; aspect-ratio: 1024 / 1536 !important; object-fit: cover !important; }\n  .p3-library-body { padding: 18px clamp(14px, 3vw, 28px) 0 clamp(14px, 3vw, 28px) !important; text-align: center !important; }\n  .p3-root .p3-library-title { font-family: var(--p3-display) !important; font-weight: 400 !important; font-size: clamp(24px, 3vw, 34px) !important; line-height: 1.15 !important; color: #ffffff !important; margin: 0 0 6px 0 !important; text-transform: none !important; letter-spacing: 0 !important; }\n  .p3-root .p3-library-sub { font-size: clamp(18px, 2.2vw, 26px) !important; color: #ffffff !important; margin-bottom: 14px !important; }\n  .p3-red { color: var(--p3-red) !important; font-weight: 700 !important; }\n\n  /* ---- ADD / ADDED buttons ---- */\n  .p3-root .p3-add {\n    display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important;\n    width: 100% !important; min-height: 52px !important; margin: 0 !important; padding: 12px 16px !important;\n    background: #e9e9e9 !important; color: #111111 !important; border: 1px solid #bdbdbd !important; border-radius: 0 !important;\n    font-family: var(--p3-display) !important; font-size: clamp(18px, 1.8vw, 20px) !important; letter-spacing: 0.02em !important; line-height: 1 !important;\n  }\n  .p3-root .p3-add:hover { background: #ffffff !important; }\n  .p3-root .p3-add:focus-visible { outline: 3px solid var(--p3-red) !important; outline-offset: 2px !important; }\n  .p3-root .p3-add::before { content: \"+\" !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 20px !important; height: 20px !important; border-radius: 50% !important; background: #111111 !important; color: #ffffff !important; font-family: Arial, sans-serif !important; font-weight: 700 !important; font-size: 17px !important; line-height: 1 !important; }\n  .p3-root .is-added .p3-add { background: var(--p3-red) !important; color: #ffffff !important; border-color: var(--p3-red-dark) !important; }\n  .p3-root .is-added .p3-add::before { content: \"\\2713\" !important; background: #ffffff !important; color: var(--p3-red) !important; font-size: 13px !important; }\n\n  /* ---- heading + quick select ---- */\n  .p3-root .p3-h2 { font-family: var(--p3-display) !important; font-weight: 400 !important; font-size: clamp(30px, 4.4vw, 48px) !important; line-height: 1.1 !important; text-align: center !important; text-transform: uppercase !important; color: #ffffff !important; margin: clamp(34px, 5vw, 56px) 0 18px 0 !important; letter-spacing: 0 !important; }\n  .p3-quick { display: flex !important; flex-wrap: wrap !important; justify-content: center !important; gap: 10px !important; margin: 0 auto 28px auto !important; max-width: 900px !important; }\n  .p3-root .p3-qbtn {\n    min-height: 44px !important; padding: 10px 18px !important; margin: 0 !important; border-radius: 999px !important;\n    background: #111111 !important; color: #ffffff !important; border: 1px solid #3a3a3a !important;\n    font-family: var(--p3-sans) !important; font-weight: 700 !important; font-size: 15px !important; line-height: 1.25 !important; text-align: center !important;\n  }\n  .p3-root .p3-qbtn:hover { border-color: #777777 !important; }\n  .p3-root .p3-qbtn.is-active, .p3-root .p3-qbtn.p3-qbtn-primary { background: var(--p3-red) !important; border-color: var(--p3-red) !important; }\n  .p3-root .p3-qbtn.p3-qbtn-primary.is-active { box-shadow: 0 0 0 3px #ffffff inset !important; }\n  .p3-root .p3-qbtn .p3-qnote { font-weight: 400 !important; opacity: .9 !important; }\n\n  /* ---- book grid ---- */\n  .p3-grid { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: clamp(14px, 2vw, 24px) !important; }\n  .p3-card { display: flex !important; flex-direction: column !important; border: 1px solid var(--p3-line) !important; background: var(--p3-panel) !important; padding: 8px !important; transition: box-shadow .2s ease !important; }\n  .p3-card.is-added { border-color: var(--p3-red) !important; box-shadow: 0 0 0 2px var(--p3-red) inset !important; }\n  .p3-card img { width: 100% !important; aspect-ratio: 1080 / 1720 !important; object-fit: cover !important; background: #111111 !important; }\n  .p3-root .p3-card-title { font-family: var(--p3-display) !important; font-weight: 400 !important; font-size: clamp(19px, 1.8vw, 21px) !important; line-height: 1.2 !important; text-transform: uppercase !important; color: #ffffff !important; margin: 14px 0 8px 0 !important; letter-spacing: 0 !important; }\n  .p3-root .p3-card-copy { color: var(--p3-soft) !important; font-size: clamp(16px, 1.4vw, 17px) !important; line-height: 1.5 !important; flex: 1 1 auto !important; }\n  .p3-root .p3-price { display: flex !important; justify-content: center !important; align-items: baseline !important; gap: 10px !important; flex-wrap: wrap !important; margin: 14px 0 12px 0 !important; font-weight: 700 !important; font-size: clamp(18px, 1.7vw, 20px) !important; }\n  .p3-root .p3-price s { color: #ffffff !important; font-weight: 400 !important; }\n  .p3-root .p3-price .p3-now { color: var(--p3-red) !important; }\n\n  /* ---- order CTA ---- */\n  .p3-cta { max-width: 1100px !important; margin: clamp(34px, 5vw, 56px) auto 0 auto !important; text-align: center !important; }\n  .p3-root .p3-yes {\n    display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; gap: 4px !important;\n    width: 100% !important; min-height: 92px !important; margin: 0 !important; padding: 14px 18px !important;\n    background: var(--p3-red) !important; color: #ffffff !important; border: 2px solid #ff4b3e !important; border-radius: 0 !important;\n    box-shadow: 0 4px 0 var(--p3-red-dark) !important;\n  }\n  .p3-root .p3-yes:hover { filter: brightness(1.06) !important; }\n  .p3-root .p3-yes:focus-visible { outline: 3px solid #ffffff !important; outline-offset: 3px !important; }\n  .p3-root .p3-yes-main { font-family: var(--p3-display) !important; font-size: clamp(28px, 4.6vw, 52px) !important; line-height: 1.05 !important; text-transform: uppercase !important; }\n  .p3-root .p3-yes-sub { font-family: var(--p3-sans) !important; font-weight: 600 !important; font-size: clamp(15px, 1.5vw, 17px) !important; opacity: .95 !important; }\n  .p3-root .p3-msg { display: none; margin: 12px 0 0 0 !important; padding: 10px 12px !important; border: 2px solid #ff6b61 !important; background: #2a0b09 !important; color: #ffd9d6 !important; font-weight: 700 !important; font-size: 16px !important; text-align: center !important; }\n  .p3-root .p3-no {\n    display: flex !important; align-items: center !important; justify-content: center !important; gap: 12px !important;\n    width: 100% !important; min-height: 64px !important; margin: 22px 0 0 0 !important; padding: 12px 18px !important;\n    background: #111111 !important; color: #ffffff !important; border: 2px solid #3a3a3a !important; border-radius: 0 !important;\n    font-family: var(--p3-display) !important; font-size: clamp(20px, 2.8vw, 32px) !important; line-height: 1.1 !important;\n  }\n  .p3-root .p3-no::after { content: \"\\203A\" !important; font-family: Arial, sans-serif !important; font-weight: 700 !important; font-size: 1.1em !important; }\n  .p3-root .p3-no:hover { border-color: #777777 !important; }\n  .p3-cards-img { margin: 22px auto 0 auto !important; width: 150px !important; }\n\n  /* ---- fixed summary bar ---- */\n  .p3-bar {\n    position: fixed !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 2147483000 !important;\n    background: #111111 !important; border-top: 2px solid var(--p3-red) !important; box-shadow: 0 -6px 18px rgba(0,0,0,.5) !important;\n    padding: 12px clamp(12px, 2vw, 28px) !important; padding-bottom: calc(12px + env(safe-area-inset-bottom)) !important;\n    display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 12px !important;\n    font-family: var(--p3-sans) !important; color: #ffffff !important;\n  }\n  .p3-root .p3-bar-count { font-weight: 700 !important; font-size: 16px !important; flex: 1 1 0 !important; min-width: 0 !important; }\n  .p3-root .p3-bar-total { display: flex !important; align-items: baseline !important; gap: 10px !important; flex: 0 0 auto !important; }\n  .p3-root .p3-bar-total small { font-size: 12px !important; letter-spacing: .12em !important; text-transform: uppercase !important; color: #9a9a9a !important; }\n  .p3-root .p3-bar-total b { font-family: var(--p3-display) !important; font-weight: 400 !important; font-size: 26px !important; }\n  .p3-root .p3-bar-yes {\n    flex: 1 1 0 !important; display: flex !important; justify-content: flex-end !important;\n  }\n  .p3-root .p3-bar-btn {\n    min-height: 48px !important; padding: 10px 22px !important; margin: 0 !important; border-radius: 6px !important;\n    background: var(--p3-red) !important; color: #ffffff !important; border: 0 !important;\n    font-family: var(--p3-sans) !important; font-weight: 800 !important; font-size: 16px !important; text-transform: uppercase !important; letter-spacing: .02em !important;\n  }\n  .p3-root .p3-bar-btn.is-empty { background: #6a1410 !important; color: #e8a8a4 !important; }\n  .p3-toast { position: fixed !important; left: 50% !important; bottom: 96px !important; transform: translateX(-50%) !important; z-index: 2147483001 !important; max-width: 92vw !important; padding: 12px 16px !important; background: #111111 !important; color: #ffffff !important; border: 2px solid #e21c13 !important; border-radius: 8px !important; font: 600 15px/1.4 Arial, sans-serif !important; }\n\n  @media (max-width: 968px) { .p3-grid { grid-template-columns: repeat(2, 1fr) !important; } }\n  @media (max-width: 600px) {\n    .p3-grid { grid-template-columns: 1fr !important; }\n    .p3-card img { aspect-ratio: 1080 / 1300 !important; object-position: 50% 0 !important; }\n    .p3-bar { flex-wrap: wrap !important; gap: 6px 12px !important; }\n    .p3-root .p3-bar-count { flex: 1 1 auto !important; font-size: 15px !important; }\n    .p3-root .p3-bar-yes { flex: 1 1 100% !important; }\n    .p3-root .p3-bar-btn { width: 100% !important; }\n  }\n  @media (prefers-reduced-motion: reduce) { .p3-card, .p3-library { transition: none !important; } }\n\n  /* ---- Setup needed panel (engine-drawn when the footer has no valid ids) ---- */\n  .p3-root .p3-setup { border: 3px dashed #ffc400 !important; background: #1c1600 !important; color: #ffffff !important; padding: clamp(18px, 3vw, 30px) !important; margin: 0 auto 32px auto !important; max-width: 980px !important; font-family: var(--p3-sans) !important; font-size: 16px !important; line-height: 1.55 !important; text-align: left !important; }\n  .p3-root .p3-setup p { margin: 0 0 12px 0 !important; color: #f2f2f2 !important; font-size: 16px !important; }\n  .p3-root .p3-setup .p3-setup-kicker { color: #ffc400 !important; font-weight: 800 !important; letter-spacing: .1em !important; text-transform: uppercase !important; font-size: 14px !important; }\n  .p3-root .p3-setup .p3-setup-h { font-family: var(--p3-display) !important; font-weight: 400 !important; font-size: clamp(24px, 3vw, 32px) !important; line-height: 1.15 !important; color: #ffffff !important; margin: 0 0 10px 0 !important; text-transform: none !important; }\n  .p3-root .p3-setup-grid { display: grid !important; grid-template-columns: 1.3fr 1fr !important; gap: 18px !important; margin: 16px 0 !important; }\n  .p3-root .p3-setup-col { background: #0b0b0b !important; border: 1px solid #4a3d00 !important; padding: 14px 16px !important; }\n  .p3-root .p3-setup h3 { margin: 0 0 8px 0 !important; color: #ffc400 !important; font-family: var(--p3-sans) !important; font-weight: 800 !important; font-size: 17px !important; }\n  .p3-root .p3-setup ol { margin: 0 !important; padding-left: 22px !important; }\n  .p3-root .p3-setup li { margin: 0 0 7px 0 !important; color: #f2f2f2 !important; font-size: 15px !important; }\n  .p3-root .p3-setup pre { margin: 0 0 10px 0 !important; padding: 10px !important; background: #000000 !important; border: 1px solid #333333 !important; color: #d8f5a2 !important; font: 12px/1.5 Consolas, ui-monospace, monospace !important; white-space: pre-wrap !important; word-break: break-all !important; }\n  .p3-root .p3-setup code { background: #2a2300 !important; color: #ffe27a !important; padding: 1px 5px !important; font: 13px Consolas, ui-monospace, monospace !important; }\n  .p3-root .p3-setup b { color: #ffffff !important; }\n  @media (max-width: 768px) { .p3-root .p3-setup-grid { grid-template-columns: 1fr !important; } }\n";
  var VERSION = "3.1.0";

  var TAG = "[P3]";
  var log = function () { try { console.log.apply(console, [TAG].concat([].slice.call(arguments))); } catch (e) {} };
  var warn = function () { try { console.warn.apply(console, [TAG].concat([].slice.call(arguments))); } catch (e) {} };
  var isId = function (s) { return /^\d{5,9}$/.test(String(s || "").trim()); };
  var money = function (n) { return "$" + (Math.round(n * 100) / 100).toFixed(2); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var P3 = window.P3 = { roots: [], lastSubmit: null, version: VERSION };

  // ---------------------------------------------------------------- RENDER (v3.1)
  function injectCss() {
    if (!CSS || document.querySelector("style[data-p3-css]")) { return; }
    var s = document.createElement("style"); s.setAttribute("data-p3-css", VERSION); s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  function setupPanel() {
    return '<section class="p3-setup" role="note" aria-label="Setup needed">' +
      '<p class="p3-setup-kicker">&#9881; Setup needed &middot; 1st Hour Protocols Upsell v3.1</p>' +
      '<h2 class="p3-setup-h">Replace this step\'s Footer Code with the code built for this step</h2>' +
      "<p>The footer on this step doesn't carry this step's 16 product ids yet, so <b>YES is disabled</b>. Don't send traffic to a page that still shows this panel.</p>" +
      '<div class="p3-setup-grid"><div class="p3-setup-col"><h3>Team Hub (recommended)</h3><ol>' +
      "<li><b>Builds</b> &rarr; <b>1st Hour Protocols Upsell</b> &rarr; enter this funnel and step id &rarr; <b>Open the Protocols workbench</b>.</li>" +
      "<li><b>1 &middot; Listing script</b>: run it on this step's Products page.</li>" +
      "<li><b>2 &middot; Product IDs</b>: paste the listing, then <b>Apply</b>.</li>" +
      "<li><b>3 &middot; Provisioner</b>: audit, then fix the fulfillment emails (a cloned step's are empty).</li>" +
      "<li><b>4 &middot; Footer code</b>: <b>Copy</b>, then Settings &rarr; Tracking Code &rarr; <b>Footer Code</b>: select all, paste, save.</li>" +
      '</ol></div><div class="p3-setup-col"><h3>Or the build script</h3>' +
      '<pre>node "Upsells/1st Hour/Protocols Upsell/v3.1/build_v3.1.mjs" --ids "Funnels/&lt;funnel&gt;/Upsells/Protocols/&lt;Abbrev&gt;_ProtocolsUpsell_ProductIDs_v1.md" --out "Funnels/&lt;funnel&gt;/Upsells/Protocols/&lt;Abbrev&gt;_ProtocolsUpsell_Footer_v3.1.html"</pre>' +
      "<p>Then paste the output file into the step's Footer Code (select all, replace).</p></div></div>" +
      "<p><b>Then:</b> publish &middot; run <b>5 &middot; Live check</b> &middot; place a test purchase (one book, the Complete Library).</p></section>";
  }
  function bookCard(b, i) {
    return '<article class="p3-card" data-p3-item="' + (i + 1) + '">' +
      '<img src="' + esc(b.cover) + '" width="1080" height="1720" loading="lazy" decoding="async" alt="' + esc("Cover of the 1st Hour Protocols book " + b.title) + '">' +
      '<h3 class="p3-card-title">' + esc(b.title) + "</h3>" +
      '<p class="p3-card-copy">' + esc(b.copy) + "</p>" +
      '<p class="p3-price"><s>Retail $' + esc(b.retail) + '</s> <span class="p3-now">Your Price: $' + esc(b.price) + "</span></p>" +
      '<button type="button" class="p3-add" data-p3-toggle aria-pressed="false"><span data-p3-label>ADD</span></button></article>';
  }
  function render(root, setup) {
    var C = CATALOG, L = C.library, Q = C.quick, T = C.cta;
    root.innerHTML =
      '<div class="p3-wrap">' + (setup ? setupPanel() : "") +
      '<section class="p3-library" data-p3-item="library"><div class="p3-library-art">' +
      '<img src="' + esc(L.image) + '" width="1024" height="1536" loading="eager" decoding="async" alt="' + esc(L.imageAlt) + '"></div>' +
      '<div class="p3-library-body"><h2 class="p3-library-title">' + esc(L.title) + "</h2>" +
      '<p class="p3-library-sub">' + esc(L.sub) + ' <span class="p3-red">' + esc(L.subRed) + "</span></p></div>" +
      '<button type="button" class="p3-add" data-p3-toggle aria-pressed="false" data-p3-off="' + esc(L.add) + '" data-p3-on="' + esc(L.added) + '"><span data-p3-label>' + esc(L.add) + "</span></button></section>" +
      '<h2 class="p3-h2">' + esc(C.heading) + "</h2>" +
      '<div class="p3-quick">' +
      '<button type="button" class="p3-qbtn p3-qbtn-primary" data-p3-quick="all">' + esc(Q.all) + ' <span class="p3-qnote">' + esc(Q.allNote) + "</span></button>" +
      '<button type="button" class="p3-qbtn" data-p3-quick="a">' + esc(Q.a) + "</button>" +
      '<button type="button" class="p3-qbtn" data-p3-quick="b">' + esc(Q.b) + "</button>" +
      '<button type="button" class="p3-qbtn" data-p3-quick="clear">' + esc(Q.clear) + "</button></div>" +
      '<div class="p3-grid">' + C.books.map(bookCard).join("") + "</div>" +
      '<div class="p3-cta"><button type="button" class="p3-yes" data-p3-yes data-p3-empty="' + esc(T.yes) + '" data-p3-full="' + esc(T.yes) + '">' +
      '<span class="p3-yes-main" data-p3-yes-label>' + esc(T.yes) + '</span><span class="p3-yes-sub" data-p3-sub data-p3-empty="' + esc(T.yesSubEmpty) + '">' + esc(T.yesSubEmpty) + "</span></button>" +
      '<p class="p3-msg" data-p3-msg role="alert"></p>' +
      '<button type="button" class="p3-no" data-p3-no>' + esc(T.no) + "</button>" +
      '<img class="p3-cards-img" src="' + esc(T.cardsImage) + '" width="150" height="24" loading="lazy" alt="Visa, Mastercard, American Express and Discover accepted"></div>' +
      "</div>" +
      '<div class="p3-bar" role="region" aria-label="Your protocol selection"><span class="p3-bar-count" data-p3-count>0 Protocols Selected</span>' +
      '<span class="p3-bar-total"><small>Total</small><b data-p3-total>$0.00</b></span>' +
      '<span class="p3-bar-yes"><button type="button" class="p3-bar-btn is-empty" data-p3-yes data-p3-empty="' + esc(T.barEmpty) + '" data-p3-full="' + esc(T.barFull) + '"><span data-p3-yes-label>' + esc(T.barEmpty) + "</span></button></span></div>";
    root.removeAttribute("data-p3-mount");
    root.removeAttribute("style");          // the mount element's inline "loading" look; the CSS takes over
    root.classList.add("p3-root");
    root.setAttribute("data-p3-rendered", VERSION);
  }

  // ---------------------------------------------------------------- roots (config from the footer)
  function readConfig() {
    var c = window.P3_CONFIG || {}, books = Array.isArray(c.books) ? c.books.map(function (s) { return String(s).trim(); }) : String(c.books || "").split(",").map(function (s) { return s.trim(); });
    var cfg = {
      library: String(c.library || "").trim(), books: books,
      bookPrice: parseFloat(CATALOG.books[0].price) || 9.99, libraryPrice: parseFloat(CATALOG.library.price) || 79.99,
      problems: []
    };
    if (!window.P3_CONFIG) { cfg.problems.push("no window.P3_CONFIG: the step's Footer Code isn't the Protocols v3.1 footer"); }
    if (!isId(cfg.library)) { cfg.problems.push("P3_CONFIG.library is not a product id"); }
    if (books.length !== 15 || !books.every(isId)) { cfg.problems.push("P3_CONFIG.books must hold 15 product ids (found " + books.filter(isId).length + ")"); }
    return cfg;
  }
  function chosenIds(cfg) {
    if (cfg.sel.library) { return [cfg.library]; }
    return Object.keys(cfg.sel).map(Number).sort(function (a, b) { return a - b; }).map(function (n) { return cfg.books[n - 1]; });
  }
  function total(cfg) {
    if (cfg.sel.library) { return cfg.libraryPrice; }
    return Object.keys(cfg.sel).length * cfg.bookPrice;
  }

  // ---------------------------------------------------------------- state (v3)
  function toggle(cfg, item) {
    if (item === "library") { cfg.sel = cfg.sel.library ? {} : { library: 1 }; return; }
    delete cfg.sel.library;
    if (cfg.sel[item]) { delete cfg.sel[item]; } else { cfg.sel[item] = 1; }
  }
  function quick(cfg, mode) {
    var s = {}, i;
    if (mode === "all") { s.library = 1; }
    else if (mode === "a") { for (i = 1; i <= 8; i++) { s[i] = 1; } }
    else if (mode === "b") { for (i = 9; i <= 15; i++) { s[i] = 1; } }
    cfg.sel = s;
  }

  // ---------------------------------------------------------------- paint (v3)
  function setText(el, t) { if (el && el.textContent !== t) { el.textContent = t; } }
  function paint(cfg) {
    var root = cfg.root, i, n = Object.keys(cfg.sel).length, lib = !!cfg.sel.library, empty = n === 0;
    var cards = root.querySelectorAll("[data-p3-item]");
    for (i = 0; i < cards.length; i++) {
      var item = cards[i].getAttribute("data-p3-item"), on = !!cfg.sel[item];
      cards[i].classList.toggle("is-added", on);
      var b = cards[i].querySelector("[data-p3-toggle]");
      if (b) {
        b.setAttribute("aria-pressed", on ? "true" : "false");
        setText(b.querySelector("[data-p3-label]") || b, on ? (b.getAttribute("data-p3-on") || "ADDED") : (b.getAttribute("data-p3-off") || "ADD"));
      }
    }
    var q = root.querySelectorAll("[data-p3-quick]");
    for (i = 0; i < q.length; i++) {
      var m = q[i].getAttribute("data-p3-quick"), active = false;
      if (m === "all") { active = lib; }
      if (m === "a") { active = !lib && n === 8 && [1, 2, 3, 4, 5, 6, 7, 8].every(function (k) { return cfg.sel[k]; }); }
      if (m === "b") { active = !lib && n === 7 && [9, 10, 11, 12, 13, 14, 15].every(function (k) { return cfg.sel[k]; }); }
      q[i].classList.toggle("is-active", active);
    }
    var label = lib ? "Complete Library (15 Protocols)" : (n === 1 ? "1 Protocol Selected" : n + " Protocols Selected");
    var cnt = root.querySelectorAll("[data-p3-count]"); for (i = 0; i < cnt.length; i++) { setText(cnt[i], label); }
    var tot = root.querySelectorAll("[data-p3-total]"); for (i = 0; i < tot.length; i++) { setText(tot[i], money(total(cfg))); }
    var yes = root.querySelectorAll("[data-p3-yes]");
    for (i = 0; i < yes.length; i++) {
      yes[i].classList.toggle("is-empty", empty);
      yes[i].setAttribute("aria-disabled", empty ? "true" : "false");
      var lab = yes[i].querySelector("[data-p3-yes-label]");
      if (lab) { setText(lab, empty ? (yes[i].getAttribute("data-p3-empty") || "Select Protocols Above") : (yes[i].getAttribute("data-p3-full") || "Add To My Order")); }
    }
    var sub = root.querySelectorAll("[data-p3-sub]");
    for (i = 0; i < sub.length; i++) { setText(sub[i], empty ? (sub[i].getAttribute("data-p3-empty") || "Choose your protocols above") : label + " \u00b7 " + money(total(cfg))); }
    root.classList.toggle("p3-has-selection", !empty);
  }

  // ---------------------------------------------------------------- CTA plumbing (v3)
  function cfptPresent() { return !!document.querySelector('script[src*="cfptaddons.com"]'); }
  function cfYesHandlerBound() {
    try {
      var $ = window.jQuery, ev = $ && $._data && $._data(document, "events"), clicks = (ev && ev.click) || [];
      for (var i = 0; i < clicks.length; i++) { if (String(clicks[i].selector || "").indexOf("#yes-link") >= 0) { return true; } }
    } catch (e) {}
    return false;
  }
  function engineProblem() {
    if (cfptPresent()) { return "a CF Pro Tools script (cdn.cfptaddons.com) is still on this page; remove it from the step's Footer Code (its add-in would add products of its own at submit)."; }
    if (!window.jQuery) { return "jQuery isn't on this page, so ClickFunnels can't submit the order."; }
    if (!document.querySelector("#cfAR")) { return "this page has no ClickFunnels order form (#cfAR)."; }
    if (!cfYesHandlerBound()) { return "ClickFunnels' order button handler isn't on this page yet."; }
    return null;
  }
  function loading(show) {
    try {
      var ls = window.ClickFunnels && window.ClickFunnels.OrderPage && window.ClickFunnels.OrderPage.LoadingScreen;
      if (ls) { if (show && ls.show) { ls.show(); } else if (!show && ls.hide) { ls.hide(); } }
    } catch (e) {}
    if (!show) { try { var o = document.querySelectorAll(".otoloading"); for (var i = 0; i < o.length; i++) { o[i].style.display = "none"; } } catch (e) {} }
  }
  function message(cfg, text) {
    var boxes = cfg.root.querySelectorAll("[data-p3-msg]");
    for (var i = 0; i < boxes.length; i++) { boxes[i].textContent = text; boxes[i].style.display = text ? "block" : "none"; }
  }
  function toast(text) {
    var t = document.createElement("div"); t.className = "p3-toast"; t.textContent = text;
    document.body.appendChild(t); setTimeout(function () { try { t.parentNode.removeChild(t); } catch (e) {} }, 4000);
  }
  function stepUrl() { return String(location.href).split("#")[0]; }

  // ---------------------------------------------------------------- submit hook (v3; the only part that touches money)
  var TEMPLATE_HTML = null, PENDING = null, SUBMIT_BOUND = false;
  function captureTemplate() {
    var node = document.querySelector('[data-cf-product-template="true"]');
    if (!node) { return false; }
    TEMPLATE_HTML = node.outerHTML;
    var inp = node.querySelector('[name="purchase[product_ids][]"]'); if (inp) { inp.disabled = true; }
    return true;
  }
  function fromTemplate(id, main) {
    if (TEMPLATE_HTML) {
      var wrap = document.createElement("div"); wrap.innerHTML = TEMPLATE_HTML;
      var node = wrap.firstElementChild, i;
      if (main) {
        var radio = node.querySelector('[name="purchase[product_id]"]');
        if (radio) {
          var ex = node.querySelectorAll('[name="purchase[product_ids][]"]'); for (i = 0; i < ex.length; i++) { ex[i].parentNode.removeChild(ex[i]); }
          radio.value = id; radio.checked = true; radio.disabled = false; radio.setAttribute("checked", "checked");
          node.setAttribute("data-p3-appended", "main"); node.removeAttribute("data-cf-product-template");
          return node;
        }
      } else {
        var inp = node.querySelector('[name="purchase[product_ids][]"]');
        if (inp) {
          var r = node.querySelectorAll('[name="purchase[product_id]"]'); for (i = 0; i < r.length; i++) { r[i].parentNode.removeChild(r[i]); }
          inp.value = id; inp.checked = true; inp.disabled = false; inp.setAttribute("checked", "checked");
          node.setAttribute("data-p3-appended", "extra"); node.removeAttribute("data-cf-product-template");
          return node;
        }
      }
    }
    var h = document.createElement("input"); h.type = "hidden";
    h.name = main ? "purchase[product_id]" : "purchase[product_ids][]"; h.value = id; h.setAttribute("data-p3-appended", main ? "main" : "extra");
    return h;
  }
  function formMain(form) {
    var els = form.querySelectorAll('[name="purchase[product_id]"]');
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.disabled || (e.closest && e.closest("[data-p3-appended]"))) { continue; }
      if ((e.type === "checkbox" || e.type === "radio") && !e.checked) { continue; }
      if (String(e.value)) { return String(e.value); }
    }
    return "";
  }
  function onSubmit(form) {
    if (!PENDING) { return; }
    if (cfptPresent()) { warn("refusing to add products: a CF Pro Tools script is on the page."); return; }
    var old = form.querySelectorAll("[data-p3-appended]"), i;
    for (i = 0; i < old.length; i++) { old[i].parentNode.removeChild(old[i]); }
    var notes = [];
    for (i = 0; i < PENDING.extras.length; i++) { form.appendChild(fromTemplate(PENDING.extras[i], false)); }
    var main = formMain(form);
    if (main === PENDING.main) { notes.push("main " + main + " (added by ClickFunnels)"); }
    else {
      if (main) { warn("CF's form named " + main + " as the main product; " + PENDING.main + " replaces it."); }
      form.appendChild(fromTemplate(PENDING.main, true)); notes.push("main " + PENDING.main + " (added by the page; CF's [data-upsell] handler didn't)");
    }
    if (!form.querySelector('[name="upsell"]')) { var u = document.createElement("input"); u.type = "hidden"; u.name = "upsell"; u.value = "1"; u.setAttribute("data-p3-appended", "upsell"); form.appendChild(u); notes.push("upsell=1 (added by the page)"); }
    else { notes.push("upsell=1"); }
    P3.lastSubmit = { main: PENDING.main, extras: PENDING.extras.slice(), at: new Date().toISOString() };
    PENDING.submitted = true;
    log("submit: " + notes.join(", ") + "; extras " + (PENDING.extras.join(", ") || "(none)"));
  }
  function bindSubmit() {
    if (SUBMIT_BOUND) { return true; }
    var form = document.querySelector("#cfAR");
    if (!form) { return false; }
    if (!captureTemplate()) { warn('no [data-cf-product-template="true"] on the page: extras go in as plain hidden inputs. Confirm with a test purchase.'); }
    form.addEventListener("submit", function () { onSubmit(form); }, true);
    if (window.jQuery) { try { window.jQuery(form).on("submit", function () { onSubmit(form); }); } catch (e) {} }
    SUBMIT_BOUND = true;
    return true;
  }
  function clearUpsellFields() {
    var form = document.querySelector("#cfAR"); if (!form) { return; }
    var els = form.querySelectorAll('input[type="hidden"][name="upsell"], input[type="hidden"][name="purchase[product_id]"]');
    for (var i = 0; i < els.length; i++) { if (els[i].parentNode === form) { els[i].parentNode.removeChild(els[i]); } }
  }

  function accept(cfg) {
    var ids = chosenIds(cfg);
    if (!ids.length) {
      var lib = cfg.root.querySelector('[data-p3-item="library"]');
      if (lib && lib.scrollIntoView) { lib.scrollIntoView({ behavior: "smooth", block: "center" }); }
      return;
    }
    var main = ids[0], extras = ids.slice(1);
    if (!document.querySelector("#cfAR")) {
      toast("Preview: YES would order " + main + " (main)" + (extras.length ? " + " + extras.join(", ") : "") + ".");
      log("preview YES", main, extras);
      return;
    }
    bindSubmit();
    var why = engineProblem();
    if (why) { warn("YES can't submit: " + why); message(cfg, "Sorry, this offer can't be added right now. Please use the link below to continue to your order."); return; }
    if (PENDING && !PENDING.done) { return; }
    message(cfg, "");
    PENDING = { main: main, extras: extras, submitted: false, done: false };
    clearUpsellFields();
    var a = document.createElement("a");
    a.href = stepUrl() + "#yes-link-multi-" + main;
    a.setAttribute("data-upsell", "1"); a.setAttribute("data-purchase", JSON.stringify({ product_id: main }));
    a.setAttribute("data-p3-native", "yes"); a.setAttribute("aria-hidden", "true"); a.style.display = "none"; a.textContent = "yes";
    cfg.root.appendChild(a);
    loading(true);
    log("YES: main " + main + (extras.length ? ", extras " + extras.join(", ") : "") + ", via ClickFunnels' [data-upsell] + #yes-link handlers.");
    a.click();
    setTimeout(function () { try { a.parentNode.removeChild(a); } catch (e) {} }, 10000);
    var mine = PENDING;
    setTimeout(function () {
      if (mine.submitted) { return; }
      mine.done = true; loading(false);
      warn("YES: ClickFunnels didn't submit the order within 6 s.");
      message(cfg, "Sorry, your order didn't go through. Please try again, or use the link below to continue.");
    }, 6000);
  }
  function decline(cfg) {
    var form = document.querySelector("#cfAR"), id = isId(cfg.books[0]) ? cfg.books[0] : cfg.library, u;
    try { u = new URL((form && form.action) || stepUrl(), location.href); } catch (e) { u = new URL(stepUrl()); }
    u.searchParams.set("upsell", "0");
    if (isId(id)) { u.searchParams.set("purchase[product_id]", id); }
    u.hash = "no-link";
    if (!form) { toast("Preview: No thanks would go to " + u.pathname + "?upsell=0 (nothing charged)."); log("preview NO", u.toString()); return; }
    loading(true);
    log("No thanks ->", u.toString());
    location.href = u.toString();
  }

  // ---------------------------------------------------------------- clicks (v3; delegated)
  function cfgFor(el) { for (var i = 0; i < P3.roots.length; i++) { if (P3.roots[i].root.contains(el)) { return P3.roots[i]; } } return null; }
  document.addEventListener("click", function (ev) {
    var t = ev.target; if (!t || !t.closest) { return; }
    var hit = t.closest("[data-p3-toggle],[data-p3-quick],[data-p3-yes],[data-p3-no]"); if (!hit) { return; }
    var cfg = cfgFor(hit); if (!cfg) { return; }
    ev.preventDefault();
    if (hit.hasAttribute("data-p3-toggle")) {
      var card = hit.closest("[data-p3-item]"); if (!card) { return; }
      toggle(cfg, card.getAttribute("data-p3-item")); paint(cfg); return;
    }
    if (hit.hasAttribute("data-p3-quick")) { quick(cfg, hit.getAttribute("data-p3-quick")); paint(cfg); return; }
    if (hit.hasAttribute("data-p3-yes")) { if (cfg.problems.length) { warn("YES blocked: " + cfg.problems.join("; ")); message(cfg, "Sorry, this offer can't be added right now. Please use the link below to continue to your order."); return; } accept(cfg); return; }
    if (hit.hasAttribute("data-p3-no")) { decline(cfg); }
  }, false);

  // ---------------------------------------------------------------- init (v3.1: wait for the mount)
  function mountAll() {
    var roots = document.querySelectorAll("[data-p3-root]"), n = 0;
    for (var i = 0; i < roots.length; i++) {
      if (roots[i].__p3) { continue; }
      roots[i].__p3 = 1;
      var cfg = readConfig();
      cfg.root = roots[i]; cfg.sel = {};
      injectCss();
      render(roots[i], cfg.problems.length > 0);
      P3.roots.push(cfg); n++;
      if (cfg.problems.length) { warn("config: " + cfg.problems.join("; ")); }
      paint(cfg);
    }
    return n;
  }
  function finish() {
    var bound = bindSubmit();
    var native = document.querySelector('[data-title*="oto-accept"], [data-title*="cf-add-product-"]');
    if (native) { warn("this page still has native v2 elements (oto-accept / cf-add-product-*); v3.1 ignores them. Delete them from the step."); }
    if (cfptPresent()) { warn("a CF Pro Tools script is on the page: YES is blocked until it's removed from the step's Footer Code."); }
    log("ready v" + VERSION + " (" + P3.roots.length + " block(s), " + (bound ? "#cfAR found" : "no #cfAR yet") + ").");
  }
  function start() {
    if (!CATALOG) { warn("built without a catalog: nothing to draw."); return; }
    if (mountAll()) { finish(); return; }
    var done = false, obs = null;
    var stop = function () { if (obs) { obs.disconnect(); } done = true; };
    try {
      obs = new MutationObserver(function () { if (!done && mountAll()) { stop(); finish(); } });
      obs.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
    var tries = 0, poll = setInterval(function () {
      if (done) { clearInterval(poll); return; }
      if (mountAll()) { stop(); clearInterval(poll); finish(); return; }
      if (++tries > 40) { stop(); clearInterval(poll); warn("no Protocols mount element (div[data-p3-root]) on this page after 20 s: is this the Protocols step, and is the mount element in place?"); }
    }, 500);
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); } else { start(); }
})();
