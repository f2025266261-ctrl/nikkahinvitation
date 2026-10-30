# Nikkah of Yashfa & Zain — Interactive Wedding Invitation

A mobile-first, scroll-animated Nikkah wedding invitation website for **Yashfa Ali & Zain Saleem** (**21st November, 2026 at 2:00 PM PKT**, Bahira Town Gul Bahar Block, Lahore).

Built with plain HTML, CSS, and JavaScript, powered by **GSAP + ScrollTrigger** and **Lenis** smooth scrolling.

---

## Features

- **1–2s Royal Arch Preloader**: SVG `stroke-dashoffset` arch reveal with Arabic *Bismillah* fade.
- **3D Interactive Envelope Intro (`100dvh`)**: Layered ivory/gold envelope with inner burgundy damask lining, a two-piece cracking `"Y & Z"` wax seal, `<canvas>` drifting gold dust particles, swaying lanterns with device-tilt/mouse parallax, and a sparkle/petal burst on open.
- **Full-Screen Scroll-Triggered Sections (`>= 100dvh` each)**:
  1. **Hero**: Mosque arch stroke draw, *Bismillah* calligraphy `clip-path` wipe, bouncing lanterns, and corner roses.
  2. **Invitation**: Split-line masked slide-up and gold-foil shimmer on **NIKKAH** with center-expanding ornaments.
  3. **Couple Names**: Pinned scene (`~150%` scroll length) with ink write-on script reveal, gold heart divider, and parallax rose petals.
  4. **Date & Time**: 3D flipping cards, slot-counter digit reels, and a drawing gold connector line.
  5. **Countdown**: Live PKT countdown (`2026-11-21T14:00:00+05:00`) with `tabular-nums`, visibility pause/resync, and a **"Save the date"** `.ics` calendar download.
  6. **Venue Reveal**: Parting gold-bordered curtain, bouncing location pin with ripple rings, **"Open in Google Maps"** primary CTA, and **"Copy address"** secondary button.
  7. **Dress Code**: Tall arch-shaped *For Her* & *For Him* cards with stroke-drawn attire illustrations and 6 popping color swatches.
  8. **Closing**: Word-by-word blessing quote, falling rose petals, and **"RSVP on WhatsApp"** CTA.
- **Guest Personalization**: Append `?guest=Your+Guest+Name` to the URL (e.g. `https://your-domain.vercel.app/?guest=Amina+%26+Family`) to display a sanitized `"Dear Amina & Family,"` greeting.
- **Optional Background Music**: Drop an audio file at `public/assets/music.mp3` to automatically enable the bottom-right gold speaker toggle (remains hidden if the file is absent).

---

## Local Development & Production Build

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
npm run dev

# 3. Build for production (outputs to dist/)
npm run build

# 4. Preview production build locally
npm run preview
```

---

## Deploying to Vercel

### Option A: Deploy via Git (Recommended)
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Vercel will automatically detect **Vite** (`npm run build`, output directory `dist`) and apply the caching headers from `vercel.json`.
4. Click **Deploy**.

### Option B: Deploy via Vercel CLI
```bash
npx vercel --prod
```

---

## Customization Checklist Before Sharing

- **WhatsApp RSVP Phone Number**: Replace the placeholder `923000000000` in `js/main.js` (`RSVP_WHATSAPP_NUMBER`) and `index.html` (`#rsvpWhatsappBtn`) with the family's real WhatsApp number.
- **Optional Audio**: Place an `.mp3` file at `public/assets/music.mp3` if background audio is desired.

