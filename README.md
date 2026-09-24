<div align="center">
  <img src="public/favicon.svg" alt="TripSheet Logo" width="80" height="80" style="border-radius: 20%; margin-bottom: 20px;" />
  <br/>
  <h1>TripSheet</h1>
  <p><strong>Zero-Backend Travel Itineraries. 100% Client-Side.</strong></p>
</div>

<br/>

TripSheet is a privacy-first web utility designed to distill chaotic, scattered travel bookings (emails, texts, PDFs) into a single, clean, chronological timeline. It is built for instant gratification and zero server maintenance. 

**[Live Demo](https://tripsheet.app)** 

---

## ⚡ Core Philosophy
* **Zero Backend:** No user accounts, no databases, no server-side APIs. Everything runs entirely in your browser using IndexedDB.
* **Instant Value:** See a visual timeline within 10 seconds of opening the site. No onboarding hurdles.
* **Stateless Sharing:** Share itineraries via a massive, compressed URL hash (`lz-string`). The recipient's browser instantly decompresses and renders the timeline. No databases hit.
* **Cinematic UI:** Built with an "Awwwards-tier" aesthetic. Smooth GSAP scroll physics, heavy typography, and deep glassmorphism.

## ✨ Features
- **Smart Paste Engine:** Paste raw booking emails into the builder. The regex engine automatically extracts dates, times, booking references, and infers the event type (e.g. Flight, Hotel, Train).
- **Chronological Sorting:** `date-fns` intelligently groups scattered events by day, rendering a seamless vertical timeline.
- **Image Export:** Need to share it on WhatsApp? Click export to generate a high-res `.png` snapshot of your itinerary using `html-to-image`.
- **Offline Capable:** Your trips are persisted to `IndexedDB` via `Dexie.js`. Close the tab and your data is waiting for you exactly where you left it.

## 🛠️ Tech Stack
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS v4 
- **Animation:** GSAP (ScrollTrigger, ScrollTo)
- **Local Database:** Dexie.js (IndexedDB wrapper)
- **State Management:** Zustand
- **Routing:** Wouter (Ultra-lightweight router)
- **Utilities:** `lz-string`, `html-to-image`, `date-fns`, `lucide-react`

## 🚀 Getting Started

To run the project locally:

```bash
# Clone the repository
git clone https://github.com/your-username/tripsheet.git
cd tripsheet

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Build for Production
```bash
# Typecheck and build the optimized, chunk-split production bundle
npm run build
```

## 🔒 Privacy
Because TripSheet has no backend, **your data never leaves your device** unless you explicitly choose to share it. When you share a trip, the data is compressed into the URL itself. We do not track, store, or sell any of your travel information.

## 📄 License
MIT License. Feel free to fork, modify, and host your own version!
