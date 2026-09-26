import { useState, useEffect } from 'react';
import { X, MessageSquare, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

export function FeedbackPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAnnoyance, setSelectedAnnoyance] = useState<string>('');
  const [customText, setCustomText] = useState('');

  // Show prompt after 15 seconds if it hasn't been shown before
  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('tripsheet_feedback_seen');
    if (!hasSeenPrompt) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        gsap.fromTo('.feedback-modal', 
          { y: 50, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
        );
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    gsap.to('.feedback-modal', {
      y: 50,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setIsVisible(false);
        localStorage.setItem('tripsheet_feedback_seen', 'true');
      }
    });
  };

  const handleSubmit = () => {
    const bodyText = `Annoyance: ${selectedAnnoyance}\nAdditional Notes: ${customText}`;
    window.location.href = `mailto:hello@example.com?subject=TripSheet Feedback&body=${encodeURIComponent(bodyText)}`;
    handleClose();
  };

  if (!isVisible) return null;

  const annoyances = [
    "Entering details took too long",
    "I needed to share it with my group",
    "I needed it offline during travel",
    "I wanted reminders",
    "I needed packing/documents in one place",
    "I needed expenses split"
  ];

  return (
    <div className="feedback-modal fixed bottom-6 right-6 z-[999] w-[340px] bg-white text-black p-6 rounded-3xl shadow-2xl border border-black/5 font-sans">
      <button onClick={handleClose} className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors">
        <X className="w-4 h-4" />
      </button>
      
      <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-5 h-5" />
      </div>

      {step === 1 ? (
        <>
          <h3 className="font-display font-semibold text-xl mb-2 leading-tight">What was still annoying after you made this itinerary?</h3>
          <p className="text-zinc-500 text-sm mb-4">Help us build what you actually need.</p>
          
          <div className="flex flex-col gap-2">
            {annoyances.map((text) => (
              <button 
                key={text}
                onClick={() => {
                  setSelectedAnnoyance(text);
                  setStep(2);
                }}
                className="text-left px-4 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 text-sm font-medium transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h3 className="font-display font-semibold text-xl mb-2 leading-tight">What should TripSheet do next?</h3>
          <p className="text-zinc-500 text-sm mb-4">Optional context about why this was annoying.</p>
          
          <textarea 
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="I wish it could..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm min-h-[100px] mb-4 outline-none focus:border-black"
          />
          
          <button 
            onClick={handleSubmit}
            className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
          >
            Send Feedback <ArrowRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
