import { useEffect, useState } from 'react';
import { Timeline } from './Timeline';
import LZString from 'lz-string';
import type { Trip } from '../types';
import { Clock, Download, Home } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { db } from '../db';
import { useTripStore } from '../store';

export function SharedTripView() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState(false);
  const [, setLocation] = useLocation();
  const loadTrips = useTripStore(state => state.loadTrips);

  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#data=')) {
        const compressed = hash.substring(6); // remove '#data='
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        if (decompressed) {
          setTrip(JSON.parse(decompressed));
        } else {
          setError(true);
        }
      } else {
        setError(true);
      }
    } catch (e) {
      console.error("Failed to parse shared trip", e);
      setError(true);
    }
  }, []);

  const handleSaveToDevice = async () => {
    if (!trip) return;
    try {
      // Create new trip to avoid ID collisions if they already have it
      const newTripId = crypto.randomUUID();
      const newTrip: Trip = {
        ...trip,
        id: newTripId,
        title: `${trip.title} (Shared)`
      };
      
      const newEvents = trip.events.map(e => ({
        ...e,
        id: crypto.randomUUID(),
        tripId: newTripId
      }));

      await db.trips.add(newTrip);
      await db.events.bulkAdd(newEvents);
      await loadTrips();
      setLocation(`/trip/${newTripId}`);
    } catch (e) {
      console.error("Failed to save shared trip", e);
      alert("Failed to save trip to your device.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-50 p-6">
        <h2 className="text-3xl font-display font-bold mb-4">Invalid Link</h2>
        <p className="text-zinc-400 mb-8">This shared link appears to be broken or malformed.</p>
        <Link href="/" className="bg-white text-black px-6 py-3 rounded-full font-medium">
          Go Home
        </Link>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-50">
        <p className="animate-pulse">Loading shared journey...</p>
      </div>
    );
  }

  const seed = trip.title.replace(/\s+/g, '').toLowerCase() || 'travel';
  const bgImage = trip.coverImage || `https://picsum.photos/seed/${seed}/1920/1080`;

  return (
    <main className="w-full min-h-screen bg-[#050505] text-zinc-50 font-sans pb-32">
      
      {/* Immersive Header */}
      <header className="relative h-[40vh] md:h-[50vh] flex flex-col justify-end p-6 md:p-12 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center grayscale mix-blend-luminosity opacity-40"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 group">
              <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              TripSheet Home
            </Link>
            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-widest text-zinc-300 uppercase mb-4 backdrop-blur-md border border-white/5">
              Read-Only View
            </div>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-2 font-display">
              {trip.title}
            </h1>
            <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {trip.events ? trip.events.length : 0} Events
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Timeline Content */}
      <section className="p-6 md:p-12 max-w-4xl mx-auto">
        <Timeline events={trip.events} readOnly={true} />
      </section>

      {/* Save to Device Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 z-50">
        <div>
          <h4 className="font-semibold text-white">This trip was shared with you</h4>
          <p className="text-sm text-zinc-400 font-light">Save it to your device to edit and add your own events.</p>
        </div>
        <button 
          onClick={handleSaveToDevice}
          className="w-full md:w-auto bg-white text-black px-8 py-3 rounded-full font-medium hover:scale-[0.98] active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <Download className="w-4 h-4" />
          Save to my trips
        </button>
      </div>

    </main>
  );
}
