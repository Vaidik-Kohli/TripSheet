export type EventType = 'flight' | 'train' | 'bus' | 'hotel' | 'activity' | 'note';

export interface TripEvent {
  id: string;             // UUID
  tripId: string;
  type: EventType;
  title: string;          // e.g., "Flight BA123 to LHR"
  startTime: string;      // ISO 8601 DateTime
  endTime?: string;       // ISO 8601 DateTime (optional)
  locationOrigin?: string;// e.g., "JFK Terminal 4"
  locationDest?: string;  // e.g., "LHR Terminal 5"
  address?: string;       // Exact address for Maps API
  bookingRef?: string;    // e.g., "XYZ123"
  notes?: string;         // User added context
  assignedTo?: string;    // Person responsible
}

export interface Trip {
  id: string;             // UUID
  title: string;          // e.g., "EuroTrip 2026"
  createdAt: string;      // ISO 8601 DateTime
  coverImage?: string;    // Base64 encoded or default preset
  events: TripEvent[];
}
