import type { TripEvent } from '../types';

export function parseSmartPaste(rawText: string): Partial<Omit<TripEvent, 'id' | 'tripId'>> {
  const result: Partial<Omit<TripEvent, 'id' | 'tripId'>> = {};
  if (!rawText) return result;

  // Find Booking Ref: usually 6 alphanumeric characters
  const pnrMatch = rawText.match(/(?:pnr|ref|reference|booking|confirmation|record locator)[\s#:-]*([A-Z0-9]{5,6})\b/i);
  if (pnrMatch && pnrMatch[1]) {
    result.bookingRef = pnrMatch[1].toUpperCase();
  }

  // Basic Type Inference
  const textLower = rawText.toLowerCase();
  if (textLower.includes('flight') || textLower.includes('air') || textLower.match(/\b(ba|aa|ua|dl|af)\s*\d{2,4}\b/)) {
    result.type = 'flight';
  } else if (textLower.includes('hotel') || textLower.includes('room') || textLower.includes('check-in') || textLower.includes('airbnb')) {
    result.type = 'hotel';
  } else if (textLower.includes('train') || textLower.includes('rail') || textLower.includes('eurostar')) {
    result.type = 'train';
  } else if (textLower.includes('tour') || textLower.includes('ticket') || textLower.includes('admission')) {
    result.type = 'activity';
  }

  // Dates: Try to find YYYY-MM-DD
  let parsedDate = '';
  const isoMatch = rawText.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (isoMatch) {
    parsedDate = `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
  } else {
    // Try DD MMM YYYY (e.g. 12 Nov 2026, or Nov 12 2026)
    const textMatch = rawText.match(/\b(?:(\d{1,2})\s+)?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})?,?\s*(20\d{2})\b/i);
    if (textMatch) {
      const dayRaw = textMatch[1] || textMatch[3];
      if (dayRaw) {
        const day = dayRaw.padStart(2, '0');
        const monthStr = textMatch[2].substring(0, 3).toLowerCase();
        const monthMap: Record<string, string> = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
        const month = monthMap[monthStr];
        const year = textMatch[4];
        parsedDate = `${year}-${month}-${day}`;
      }
    }
  }

  // Times: Try to find HH:MM or HH:MM AM/PM
  let parsedTime = '12:00';
  const timeMatch = rawText.match(/\b([0-1]?[0-9]|2[0-3]):([0-5][0-9])\s*(am|pm|a|p)?\b/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const mins = timeMatch[2];
    const ampm = timeMatch[3]?.toLowerCase();
    
    if (ampm && ampm.startsWith('p') && hours < 12) hours += 12;
    if (ampm && ampm.startsWith('a') && hours === 12) hours = 0;
    
    parsedTime = `${hours.toString().padStart(2, '0')}:${mins}`;
  }

  if (parsedDate) {
    result.startTime = `${parsedDate}T${parsedTime}`;
  }

  // Very basic title inference based on first line
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0 && !result.title) {
    // If the first line is short, assume it's a title
    if (lines[0].length < 50) {
      result.title = lines[0];
    }
  }

  return result;
}
