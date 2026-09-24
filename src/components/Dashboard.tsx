import { useState } from 'react';
import { useTripStore } from '../store';
import { TripCard } from './TripCard';
import { CreateTripModal } from './CreateTripModal';
import { Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export function Dashboard() {
  const { trips } = useTripStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <main className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#050505] text-zinc-50 px-6 md:px-12 font-sans">
      {/* Header / Hero */}
      <header className="pt-24 pb-24 md:pt-32 md:pb-32 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 relative">
        <div className="absolute top-8 left-0">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group text-sm font-medium">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
        <div className="max-w-3xl mt-12 md:mt-0">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[1.05]">
            Your<br />Journeys.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-zinc-500 max-w-md leading-relaxed">
            All your chaotic bookings distilled into single, clean timelines.
          </p>
        </div>
        <div className="mt-12 md:mt-0 flex-shrink-0">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="group relative inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-full text-sm font-medium tracking-wide hover:scale-[0.98] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          >
            <span className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center">
                <Plus className="w-3 h-3" />
              </span>
              New Trip
            </span>
          </button>
        </div>
      </header>

      {/* Trips Grid */}
      <section className="py-24">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/10 rounded-[2rem] bg-white/[0.02]">
            <div className="w-20 h-20 mb-8 rounded-full bg-white/5 flex items-center justify-center">
              <Plus className="w-8 h-8 text-zinc-500" />
            </div>
            <h2 className="text-3xl font-medium tracking-tight">No trips yet</h2>
            <p className="text-zinc-500 mt-4 text-lg">Create your first trip to start organizing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-dense gap-6">
            {trips.map((trip, index) => (
              <TripCard key={trip.id} trip={trip} index={index} />
            ))}
          </div>
        )}
      </section>

      {isCreateModalOpen && (
        <CreateTripModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </main>
  );
}
