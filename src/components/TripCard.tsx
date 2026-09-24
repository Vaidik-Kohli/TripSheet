import { useRef } from 'react';
import { useLocation } from 'wouter';
import type { Trip } from '../types';
import { useTripStore } from '../store';
import { Trash2, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface TripCardProps {
  trip: Trip;
  index: number;
}

export function TripCard({ trip, index }: TripCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { deleteTrip } = useTripStore();
  const [, setLocation] = useLocation();
  
  useGSAP(() => {
    gsap.from(cardRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: index * 0.1,
      clearProps: "all"
    });
  }, { scope: cardRef });

  const seed = trip.title.replace(/\s+/g, '').toLowerCase() || 'travel';
  const bgImage = trip.coverImage || `https://picsum.photos/seed/${seed}/800/600`;

  // Make some cards span 2 columns randomly to break the grid based on ID length parity
  const isWide = trip.id.length % 3 === 0;

  return (
    <div 
      ref={cardRef}
      onClick={() => setLocation(`/trip/${trip.id}`)}
      className={`group relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 cursor-pointer ${isWide ? 'md:col-span-2 aspect-[16/9] md:aspect-[8/3]' : 'aspect-[4/3]'}`}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 grayscale mix-blend-luminosity opacity-60 dark:opacity-40"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Dark gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
      
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
        <div className="flex justify-end">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete ${trip.title}?`)) {
                deleteTrip(trip.id);
              }
            }}
            className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-500/80"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-white transform transition-transform duration-500 group-hover:-translate-y-2">
          <p className="text-xs font-medium tracking-widest text-zinc-300 uppercase mb-2">
            {new Date(trip.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric'})}
          </p>
          <h3 className="text-3xl font-medium tracking-tight mb-2">
            {trip.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
            <span>{trip.events ? trip.events.length : 0} Events</span>
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
