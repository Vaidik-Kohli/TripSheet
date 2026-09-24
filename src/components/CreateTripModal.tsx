import { useState, useRef, useEffect } from 'react';
import { useTripStore } from '../store';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface CreateTripModalProps {
  onClose: () => void;
}

export function CreateTripModal({ onClose }: CreateTripModalProps) {
  const [title, setTitle] = useState('');
  const { createTrip } = useTripStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(overlayRef.current, { opacity: 0, duration: 0.3 });
    gsap.from(modalRef.current, { 
      y: 20, 
      opacity: 0, 
      duration: 0.5, 
      ease: "power3.out",
      delay: 0.1 
    });
  }, []);

  const handleClose = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
    gsap.to(modalRef.current, { 
      y: 10, 
      opacity: 0, 
      duration: 0.3, 
      onComplete: onClose 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      await createTrip(title);
      handleClose();
    }
  };

  // Close on esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div 
      ref={overlayRef} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]/80 backdrop-blur-xl p-6"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-[#050505] border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-[0_0_100px_rgba(255,255,255,0.05)] relative"
      >
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500 hover:text-white" />
        </button>

        <h2 className="text-3xl font-medium tracking-tight mb-8 text-zinc-50">New Journey</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-zinc-500 mb-2">
              Where to?
            </label>
            <input
              id="title"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., EuroTrip 2026"
              className="w-full bg-transparent border-b-2 border-white/10 text-3xl font-medium py-2 focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700 text-zinc-50"
            />
          </div>
          
          <button 
            type="submit"
            disabled={!title.trim()}
            className="self-start px-8 py-4 rounded-full bg-white text-black font-medium tracking-wide hover:scale-[0.98] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] disabled:opacity-50 disabled:pointer-events-none"
          >
            Create Trip
          </button>
        </form>
      </div>
    </div>
  );
}
