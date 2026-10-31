# Nikkah of Yashfa & Zain — Blush-Pink Pearl Wedding Invitation

A mobile-first, native-scroll Nikkah wedding invitation website for **Yashfa Ali & Zain Saleem** (**21st November, 2026 at 2:00 PM PKT**, Bahira Town Gul Bahar Block, Lahore).

Built with plain HTML, CSS, and JavaScript, using **100% native scrolling** and a single **`IntersectionObserver`** with **GSAP** one-time `transform`/`opacity` animations.

---

## Features

- **3D Blush Envelope Intro (`100dvh`)**: Blush envelope with a satin ribbon bow, cracking `"Y & Z"` dusty-rose wax seal, pearl strands, and a rising pearl-ivory invitation card (~`2.5s` sequence, removed from DOM after opening).
- **100% Native Scroll Sections (`>= 100dvh` each)**:
  1. **Hero**: Blush background (`#F6DAD6`), scalloped pearl arch frame, dusty-pink roses & satin bow corners, descending crystal chandelier with gentle sway & crystal twinkle, *Bismillah* calligraphy `clip-path` wipe, and `Y & Z` oval sprig monogram.
  2. **Invitation**: Pearl ivory (`#FFF6F1`) card with `"TOGETHER WITH THEIR FAMILIES"`, line-by-line fade-up, and letter-spaced deep-rose **NIKKAH** with a one-time foil shimmer and rose-gold leaf flourishes.
  3. **Couple Names**: Deep dusty-rose `"evening"` section (`#A8606C` to `#8E4A55`) with mini crystal chandelier, warm candlelight radial glow, flanking pillar candle groups, and sliding script names (`Yashfa Ali` with `Zain Saleem`).
  4. **Date & Time**: Editorial 3-column layout (`SATURDAY` | `NOVEMBER / 21 / 2026` | `AT 2:00 PM`) between rose-gold vertical lines, flanked by pillar candle groups and drawing flourishes.
  5. **Countdown**: Live PKT countdown (`2026-11-21T14:00:00+05:00`) inside 4 pearl-bordered oval tiles with `tabular-nums`, visibility pause/resync, and a **"Save the date"** `.ics` calendar download.
  6. **Venue Reveal**: Pearl ivory section with candle groups, parting pearl-lace curtain panels, blush map card with soft rose-gold roads, bouncing rose-gold pin with ripple, **"Open in Google Maps"**, and **"Copy address"**.
  7. **Dress Code**: Deep dusty-rose section with two pearl-framed arch cards (*For Her* / *For Him*), stroke-drawn attire illustrations, and 6 pearl-ringed pastel swatches.
  8. **Closing**: Blush-to-mauve gradient with top chandelier, bottom candle groups with roses, word-by-word blessing quote, family sign-off, dusty-rose wax seal ornament, and 12 drifting rose petals.
- **Guest Personalization**: Append `?guest=Your+Guest+Name` to the URL to display `"Dear {Name},"` via `textContent`.
- **Optional Background Music**: Drop an audio file at `public/assets/music.mp3` to automatically enable the bottom-right speaker toggle (remains hidden if the file is absent).

---

## Local Development & Production Build

```bash
npm install
npm run dev
npm run build
npm run preview
```
