import type { Trip } from '../types';

function formatDateToICS(dateStr: string) {
  // Convert ISO string to YYYYMMDDTHHMMSSZ (UTC)
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICS(str: string) {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function generateICS(trip: Trip) {
  const events = trip.events;
  if (!events || events.length === 0) return '';

  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TripSheet//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach(event => {
    const startStr = formatDateToICS(event.startTime);
    // If no end time, default to 1 hour after start
    const endStr = event.endTime 
      ? formatDateToICS(event.endTime) 
      : formatDateToICS(new Date(new Date(event.startTime).getTime() + 60 * 60 * 1000).toISOString());

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:${event.id}@tripsheet.app`);
    icsLines.push(`DTSTAMP:${formatDateToICS(new Date().toISOString())}`);
    icsLines.push(`DTSTART:${startStr}`);
    icsLines.push(`DTEND:${endStr}`);
    
    icsLines.push(`SUMMARY:${escapeICS(event.title)}`);
    
    let description = '';
    if (event.notes) description += `${event.notes}\\n\\n`;
    if (event.bookingRef) description += `Booking Ref: ${event.bookingRef}\\n`;
    if (event.assignedTo) description += `Assigned To: ${event.assignedTo}\\n`;
    
    // Add map link to description if location exists
    const locationForMap = event.address || event.locationDest || event.locationOrigin;
    if (locationForMap) {
      description += `\\nMap: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationForMap)}\\n`;
    }
    
    if (description) {
      icsLines.push(`DESCRIPTION:${escapeICS(description)}`);
    }

    if (locationForMap) {
      icsLines.push(`LOCATION:${escapeICS(locationForMap)}`);
    }

    // Alarms (Reminders) - 2 hours and 24 hours before
    icsLines.push('BEGIN:VALARM');
    icsLines.push('TRIGGER:-PT2H'); // 2 hours before
    icsLines.push('ACTION:DISPLAY');
    icsLines.push('DESCRIPTION:Reminder');
    icsLines.push('END:VALARM');

    icsLines.push('BEGIN:VALARM');
    icsLines.push('TRIGGER:-P1D'); // 1 day before
    icsLines.push('ACTION:DISPLAY');
    icsLines.push('DESCRIPTION:Reminder');
    icsLines.push('END:VALARM');

    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');
  
  // ICS files use CRLF
  return icsLines.join('\r\n');
}

export function downloadICS(trip: Trip) {
  const icsData = generateICS(trip);
  if (!icsData) {
    alert("No events to export!");
    return;
  }

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  // Clean filename
  const safeTitle = trip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.setAttribute('download', `${safeTitle}_itinerary.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
