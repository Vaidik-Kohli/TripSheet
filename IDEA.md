
# TripSheet: Core Product Architecture & Context (IDEA.md)

## 1. Product Vision
**TripSheet** is a zero-login, client-side web utility that transforms chaotic, scattered travel bookings (emails, texts, PDFs) into a single, clean, chronological itinerary. It is designed for instant gratification, high shareability in group chats, and zero server maintenance.

## 2. Core Philosophy & Strict Constraints
* **Zero Backend (Phase 1):** No user accounts, no databases, no server-side APIs. The app must run entirely in the browser to ensure $0 operational cost and maximum privacy.
* **Instant Value:** The user must be able to see a visual timeline within 10 seconds of opening the site. No onboarding hurdles.
* **Mobile-First Output:** The final product (the itinerary) will primarily be viewed on phones via WhatsApp/iMessage links or image exports.
* **Do NOT Build:** Flight tracking, hotel discovery, Gmail API integrations, real-time collaboration (WebSockets), or payment splitting.

## 3. User Flow
1. **Input:** User lands on the page and clicks "New Trip". They paste raw text from booking emails/PDFs into a smart text box, or use a short manual form.
2. **Parsing (Client-Side):** The app extracts key data (Date, Time, Location, Booking Reference, Type) via regex/pattern matching.
3. **Timeline Generation:** The app automatically sorts events chronologically and groups them by day.
4. **Customization:** User can edit details, add notes (e.g., "Meet at Gate 4"), and apply basic color-coding.
5. **Distribution (The Viral Loop):** User exports the itinerary as a clean image (PNG), a PDF, or generates a compressed, shareable URL. 

## 4. Technical Architecture
* **Frontend Framework:** React + Vite (for speed and simplicity).
* **Language:** TypeScript (Strict typing is mandatory for maintainability).
* **Styling:** Tailwind CSS (Focus on clean, modern, high-contrast UI).
* **Local Storage:** `IndexedDB` (using a wrapper like `Dexie.js` for easier async data handling). 
* **State Management:** `Zustand` (lightweight, zero-boilerplate local state).
* **Sharing Mechanism:** `lz-string` or `pako`. (Trip data is stringified to JSON, compressed, and appended to the URL hash to create a shareable link without a database).
* **Exporting:** `html2canvas` (for PNG export) and `jspdf` (for PDF export).
* **Hosting:** Cloudflare Pages or GitHub Pages (Free tier, static hosting).

## 5. Core Data Model (TypeScript Schema)
*This schema is the source of truth for all components.*

```typescript
type EventType = 'flight' | 'train' | 'bus' | 'hotel' | 'activity' | 'note';

interface TripEvent {
  id: string;             // UUID
  tripId: string;
  type: EventType;
  title: string;          // e.g., "Flight BA123 to LHR"
  startTime: string;      // ISO 8601 DateTime
  endTime?: string;       // ISO 8601 DateTime (optional)
  locationOrigin?: string;// e.g., "JFK Terminal 4"
  locationDest?: string;  // e.g., "LHR Terminal 5"
  bookingRef?: string;    // e.g., "XYZ123"
  notes?: string;         // User added context
}

interface Trip {
  id: string;             // UUID
  title: string;          // e.g., "EuroTrip 2026"
  createdAt: string;      // ISO 8601 DateTime
  coverImage?: string;    // Base64 encoded or default preset
  events: TripEvent[];
}

```

## 6. MVP Feature Scope (Weeks 1-4)

* **Trip Management:** Create, edit, and delete trips stored entirely in IndexedDB.
* **Event Builder:** Form to manually add Flights, Accommodations, and Activities.
* **Smart Paste (Basic):** A text area that runs basic regex to auto-fill the Event Builder (looking for dates, times, and alphanumeric booking codes).
* **Chronological View:** The core UI. A beautiful, vertical timeline grouped by day.
* **Stateless URL Sharing:** A function that takes the Trip object, compresses it, and generates a URL (e.g., tripsheet.app/view#compressed_data).
* **Export Engine:** A button that converts the chronological view DOM element into a downloadable PNG or PDF.

## 7. Monetization / Phase 2 Setup (For Year 2)

*All Phase 1 code must be written cleanly so these can be bolted on later without rewriting the app.*

* **Auth & Cloud Sync:** Introduce Supabase Auth & Postgres to save trips across devices.
* **Premium Exports:** High-res printables, custom branding, and interactive offline booklets.
* **Automated Parsing:** Upgrade the "Smart Paste" to use a lightweight serverless LLM to flawlessly extract data from any pasted email.

## 8. AI Assistant Instructions (How to use this file)

*When generating code for this project, AI must:*

1. Strictly adhere to the TypeScript schema provided above.
2. Never suggest adding a backend, Node.js server, or database connection (like MongoDB/Firebase).
3. Default to functional React components and Tailwind CSS for all UI elements.
4. Keep dependencies to an absolute minimum to ensure fast load times.
5. Provide code formatted for direct integration into VS Code, favoring modular files and clear imports.
6. Account for a lean development schedule (5-10 hours/week). Prioritize MVP functionality over over-engineered abstractions, keeping the codebase manageable for a solo developer.