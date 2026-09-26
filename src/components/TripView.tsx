import { useState, useRef, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useTripStore } from '../store';
import { ArrowLeft, Clock, Plus, Share2, Download, Check, Calendar, Printer, X } from 'lucide-react';
import { Timeline } from './Timeline';
import { EventBuilder } from './EventBuilder';
import { toPng } from 'html-to-image';
import LZString from 'lz-string';
import { downloadICS } from '../lib/ics';

export function TripView() {
  const [, params] = useRoute('/trip/:id');
  const id = params?.id;
  const { activeTrip, setActiveTrip } = useTripStore();
  const [showBuilder, setShowBuilder] = useState(false);
  const [copied, setCopied] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareIncludesRefs, setShareIncludesRefs] = useState(false);
  const [shareIncludesNotes, setShareIncludesNotes] = useState(true);

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

  const handleShareSubmit = async () => {
    // Clone and filter trip data
    const safeTrip = JSON.parse(JSON.stringify(activeTrip));
    if (!shareIncludesRefs || !shareIncludesNotes) {
      safeTrip.events = safeTrip.events.map((e: any) => {
        const ne = { ...e };
        if (!shareIncludesRefs) delete ne.bookingRef;
        if (!shareIncludesNotes) delete ne.notes;
        return ne;
      });
    }

    const tripData = JSON.stringify(safeTrip);
    const compressed = LZString.compressToEncodedURIComponent(tripData);
    const shareUrl = `${window.location.origin}/shared#data=${compressed}`;
    
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowShareModal(false);
    }, 2000);
  };

  const handleExport = async () => {
    if (!timelineRef.current) return;
    try {
      const dataUrl = await toPng(timelineRef.current, { backgroundColor: '#050505', pixelRatio: 2 });
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
      <header className="relative h-[40vh] md:h-[50vh] flex flex-col justify-end p-6 md:p-12 overflow-hidden print:hidden">
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
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full font-medium transition-all"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button 
              onClick={() => downloadICS(activeTrip)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full font-medium transition-all"
            >
              <Calendar className="w-4 h-4" /> Calendar
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full font-medium transition-all"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full font-medium transition-all"
            >
              <Download className="w-4 h-4" /> Image
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl p-6">
            <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-display font-semibold mb-2">Share Itinerary</h3>
            <p className="text-zinc-400 text-sm mb-6">Choose what to include in the public link.</p>
            
            <div className="space-y-4 mb-8">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${shareIncludesRefs ? 'bg-white border-white text-black' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                  {shareIncludesRefs && <Check className="w-3 h-3" />}
                </div>
                <input type="checkbox" className="hidden" checked={shareIncludesRefs} onChange={e => setShareIncludesRefs(e.target.checked)} />
                <span className="text-sm">Include Booking References</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${shareIncludesNotes ? 'bg-white border-white text-black' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                  {shareIncludesNotes && <Check className="w-3 h-3" />}
                </div>
                <input type="checkbox" className="hidden" checked={shareIncludesNotes} onChange={e => setShareIncludesNotes(e.target.checked)} />
                <span className="text-sm">Include Notes</span>
              </label>
            </div>

            <button 
              onClick={handleShareSubmit}
              className="w-full bg-white text-black px-6 py-3 rounded-full font-medium hover:scale-[0.98] active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard!' : 'Generate Link'}
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
