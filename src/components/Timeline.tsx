import React from 'react';
import type { TripEvent } from '../types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Plane, Hotel, MapPin, Train, StickyNote, Activity, Clock, Navigation, Trash2 } from 'lucide-react';
import { useTripStore } from '../store';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  flight: <Plane className="w-4 h-4" />,
  hotel: <Hotel className="w-4 h-4" />,
  train: <Train className="w-4 h-4" />,
  bus: <MapPin className="w-4 h-4" />,
  activity: <Activity className="w-4 h-4" />,
  note: <StickyNote className="w-4 h-4" />,
};

interface TimelineProps {
  events: TripEvent[];
  readOnly?: boolean;
}

export function Timeline({ events, readOnly = false }: TimelineProps) {
  const deleteEvent = useTripStore(state => state.deleteEvent);

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-zinc-600">
          <Activity className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-display font-medium text-white mb-2">No events yet</h3>
        <p className="text-zinc-500 max-w-sm">Use the Event Builder to add flights, hotels, and activities to your journey.</p>
      </div>
    );
  }

  // Group events by day
  const groupedEvents: Record<string, TripEvent[]> = {};
  let firstDate: Date | null = null;

  events.forEach(event => {
    try {
      const date = parseISO(event.startTime);
      if (!firstDate) firstDate = date;
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!groupedEvents[dateKey]) groupedEvents[dateKey] = [];
      groupedEvents[dateKey].push(event);
    } catch (e) {
      console.error("Invalid date for event", event);
    }
  });

  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <div className="relative pt-8 pb-24">
      {sortedDates.map((dateKey) => {
        const dateObj = parseISO(dateKey);
        const dayNumber = firstDate ? differenceInDays(dateObj, firstDate) + 1 : 1;
        const dayEvents = groupedEvents[dateKey];

        return (
          <div key={dateKey} className="relative mb-16">
            
            {/* Sticky Date Header */}
            <div className="sticky top-0 z-20 pt-4 pb-8 bg-gradient-to-b from-[#050505] via-[#050505] to-transparent">
              <div className="flex items-baseline gap-4">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter">
                  Day {dayNumber}
                </h2>
                <span className="text-lg md:text-xl text-zinc-500 font-light">
                  {format(dateObj, 'EEE, MMM d, yyyy')}
                </span>
              </div>
            </div>

            {/* Day's Timeline Line */}
            <div className="relative pl-8 md:pl-16 ml-4 md:ml-8 border-l border-white/10 space-y-8">
              
              {dayEvents.map((event) => (
                <div key={event.id} className="relative group">
                  
                  {/* Timeline Dot */}
                  <div className="absolute -left-[37px] md:-left-[69px] top-4 w-[11px] h-[11px] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10" />
                  
                  {/* Event Card */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 hover:bg-white/10 transition-colors">
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                          {TYPE_ICONS[event.type] || <Activity className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-1">{event.type}</div>
                          <h3 className="text-xl md:text-2xl font-display font-medium text-white">{event.title}</h3>
                        </div>
                      </div>
                      
                      {!readOnly && (
                        <button 
                          onClick={() => deleteEvent(event.id)}
                          className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-full hover:bg-white/5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-zinc-300">
                          <Clock className="w-4 h-4 text-zinc-500" />
                          <span>
                            {format(parseISO(event.startTime), 'h:mm a')}
                            {event.endTime && ` — ${format(parseISO(event.endTime), 'h:mm a')}`}
                          </span>
                        </div>
                        
                        {(event.locationOrigin || event.locationDest || event.address) && (
                          <div className="flex items-start gap-3 text-zinc-300">
                            <Navigation className="w-4 h-4 text-zinc-500 mt-1" />
                            <div className="flex flex-col">
                              {event.locationOrigin && <span>{event.locationOrigin}</span>}
                              {event.locationDest && <span className="text-zinc-500">to {event.locationDest}</span>}
                              {event.address && <span className="text-sm mt-1">{event.address}</span>}
                              
                              {/* Maps Link */}
                              {(event.address || event.locationOrigin) && (
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address || event.locationOrigin || '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:text-blue-300 mt-2 flex items-center gap-1 font-medium w-fit"
                                >
                                  <MapPin className="w-3 h-3" /> Open in Maps
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {event.bookingRef && (
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Booking Ref</div>
                            <div className="inline-block bg-white/10 border border-white/10 rounded-md px-2 py-1 font-mono text-sm tracking-widest text-white uppercase">
                              {event.bookingRef}
                            </div>
                          </div>
                        )}

                        {event.assignedTo && (
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Assigned To</div>
                            <p className="text-sm text-zinc-300 font-medium">{event.assignedTo}</p>
                          </div>
                        )}
                        
                        {event.notes && (
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Notes</div>
                            <p className="text-sm text-zinc-400 font-light leading-relaxed">{event.notes}</p>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
