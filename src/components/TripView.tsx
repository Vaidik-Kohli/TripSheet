import { useState, useRef, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useTripStore } from '../store';
import { ArrowLeft, Clock, Plus, Share2, Download, Check } from 'lucide-react';
import { Timeline } from './Timeline';
import { EventBuilder } from './EventBuilder';
import { toPng } from 'html-to-image';
import LZString from 'lz-string';

export function TripView() {
  const [, params] = useRoute('/trip/:id');
  const id = params?.id;
  const { activeTrip, setActiveTrip } = useTripStore();
  const [showBuilder, setShowBuilder] = useState(false);
  const [copied, setCopied] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      setActiveTrip(id);
    }
  }, [id, setActiveTrip]);

  if (!activeTrip) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-50">
        <p className="animate-pulse">Loading journey...</p>
      </div>
    );
  }

  const seed = activeTrip.title.replace(/\s+/g, '').toLowerCase() || 'travel';
  const bgImage = activeTrip.coverImage || `https://picsum.photos/seed/${seed}/1920/1080`;

  const handleShare = async () => {
    // Compress the trip object to a URL safe base64 string
    const tripData = JSON.stringify(activeTrip);
    const compressed = LZString.compressToEncodedURIComponent(tripData);
    const shareUrl = `${window.location.origin}/shared#data=${compressed}`;
    
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    if (!timelineRef.current) return;
    
    try {
      const dataUrl = await toPng(timelineRef.current, {
        backgroundColor: '#050505',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${activeTrip.title.replace(/\s+/g, '_')}_Itinerary.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    }
  };

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
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-2 font-display">
              {activeTrip.title}
            </h1>
            <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
              <span className="uppercase tracking-widest text-xs">
                {new Date(activeTrip.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric'})}
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {activeTrip.events ? activeTrip.events.length : 0} Events
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full font-medium transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied Link' : 'Share'}
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full font-medium transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Timeline Content */}
      <section className="p-6 md:p-12 max-w-4xl mx-auto" ref={timelineRef}>
        <Timeline events={activeTrip.events} />
      </section>

      {/* Floating Action Button for adding events */}
      <button 
        onClick={() => setShowBuilder(true)}
        className="fixed bottom-8 right-8 z-40 bg-white text-black p-4 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus className="w-8 h-8" />
      </button>

      {showBuilder && id && (
        <EventBuilder tripId={id} onClose={() => setShowBuilder(false)} />
      )}

    </main>
  );
}
