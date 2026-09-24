import React, { useState } from 'react';
import { useTripStore } from '../store';
import { parseSmartPaste } from '../lib/parser';
import { X, Wand2, Plane, Hotel, MapPin, Train, StickyNote, Activity } from 'lucide-react';
import type { EventType } from '../types';

interface EventBuilderProps {
  tripId: string;
  onClose: () => void;
}

const TYPE_ICONS: Record<EventType, React.ReactNode> = {
  flight: <Plane className="w-4 h-4" />,
  hotel: <Hotel className="w-4 h-4" />,
  train: <Train className="w-4 h-4" />,
  bus: <MapPin className="w-4 h-4" />,
  activity: <Activity className="w-4 h-4" />,
  note: <StickyNote className="w-4 h-4" />,
};

export function EventBuilder({ tripId, onClose }: EventBuilderProps) {
  const addEvent = useTripStore(state => state.addEvent);
  const [smartPaste, setSmartPaste] = useState('');
  
  const [type, setType] = useState<EventType>('note');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [locationOrigin, setLocationOrigin] = useState('');
  const [locationDest, setLocationDest] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [notes, setNotes] = useState('');

  const handleSmartPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setSmartPaste(text);
    const parsed = parseSmartPaste(text);
    
    if (parsed.type) setType(parsed.type);
    if (parsed.title) setTitle(parsed.title);
    if (parsed.startTime) setStartTime(parsed.startTime);
    if (parsed.bookingRef) setBookingRef(parsed.bookingRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime) return;

    await addEvent(tripId, {
      type,
      title,
      startTime,
      endTime: endTime || undefined,
      locationOrigin: locationOrigin || undefined,
      locationDest: locationDest || undefined,
      bookingRef: bookingRef || undefined,
      notes: notes || undefined,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-2xl font-display font-semibold flex items-center gap-2 text-white">
            Add Event
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Smart Paste Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-purple-400 uppercase tracking-wider">
              <Wand2 className="w-4 h-4" /> Smart Paste
            </label>
            <textarea 
              value={smartPaste}
              onChange={handleSmartPaste}
              placeholder="Paste raw email, flight confirmation, or ticket details here..."
              className="w-full h-24 bg-purple-900/10 border border-purple-500/30 rounded-2xl p-4 text-zinc-300 placeholder-purple-300/30 focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm font-mono"
            />
            <p className="text-xs text-zinc-500">Auto-extracts dates, times, booking refs, and event type.</p>
          </div>

          <form id="event-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl overflow-x-auto custom-scrollbar">
              {(Object.keys(TYPE_ICONS) as EventType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${type === t ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  {TYPE_ICONS[t]} <span className="capitalize">{t}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-zinc-500 font-semibold tracking-wider mb-2">Event Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Flight BA123 to London"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-500 font-semibold tracking-wider mb-2">Start Time</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-500 font-semibold tracking-wider mb-2">End Time (Optional)</label>
                  <input 
                    type="datetime-local" 
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-zinc-500 font-semibold tracking-wider mb-2">Origin / Location</label>
                  <input 
                    type="text" 
                    value={locationOrigin}
                    onChange={e => setLocationOrigin(e.target.value)}
                    placeholder="Terminal 4, JFK"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-500 font-semibold tracking-wider mb-2">Destination (Optional)</label>
                  <input 
                    type="text" 
                    value={locationDest}
                    onChange={e => setLocationDest(e.target.value)}
                    placeholder="Terminal 5, LHR"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-500 font-semibold tracking-wider mb-2">Booking Reference</label>
                <input 
                  type="text" 
                  value={bookingRef}
                  onChange={e => setBookingRef(e.target.value)}
                  placeholder="e.g. XYZ123"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-500 font-semibold tracking-wider mb-2">Notes</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Seat 14A, Check-in desk closes at 13:00"
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 transition-colors resize-none"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-full font-medium text-zinc-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button type="submit" form="event-form" className="bg-white text-black px-8 py-3 rounded-full font-medium hover:scale-[0.98] active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Add to Timeline
          </button>
        </div>

      </div>
    </div>
  );
}
