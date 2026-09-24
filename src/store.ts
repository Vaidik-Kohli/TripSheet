import { create } from 'zustand';
import { db } from './db';
import type { Trip, TripEvent } from './types';
import { v4 as uuidv4 } from 'uuid';

interface TripStore {
  trips: Trip[];
  activeTrip: Trip | null;
  isLoading: boolean;
  
  // Actions
  loadTrips: () => Promise<void>;
  setActiveTrip: (id: string) => Promise<void>;
  createTrip: (title: string) => Promise<Trip>;
  deleteTrip: (id: string) => Promise<void>;
  addEvent: (tripId: string, event: Omit<TripEvent, 'id' | 'tripId'>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  activeTrip: null,
  isLoading: false,

  loadTrips: async () => {
    set({ isLoading: true });
    try {
      const trips = await db.trips.orderBy('createdAt').reverse().toArray();
      set({ trips, isLoading: false });
    } catch (error) {
      console.error('Failed to load trips', error);
      set({ isLoading: false });
    }
  },

  setActiveTrip: async (id: string) => {
    set({ isLoading: true });
    try {
      const trip = await db.trips.get(id);
      if (trip) {
        // Load events for this trip
        const events = await db.events.where('tripId').equals(id).sortBy('startTime');
        set({ activeTrip: { ...trip, events }, isLoading: false });
      } else {
        set({ activeTrip: null, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to set active trip', error);
      set({ isLoading: false });
    }
  },

  createTrip: async (title: string) => {
    const newTrip: Trip = {
      id: uuidv4(),
      title,
      createdAt: new Date().toISOString(),
      events: [],
    };
    await db.trips.add(newTrip);
    await get().loadTrips();
    return newTrip;
  },

  deleteTrip: async (id: string) => {
    await db.trips.delete(id);
    await db.events.where('tripId').equals(id).delete();
    await get().loadTrips();
    if (get().activeTrip?.id === id) {
      set({ activeTrip: null });
    }
  },

  addEvent: async (tripId: string, eventDetails: Omit<TripEvent, 'id' | 'tripId'>) => {
    const newEvent: TripEvent = {
      id: uuidv4(),
      tripId,
      ...eventDetails,
    };
    await db.events.add(newEvent);
    if (get().activeTrip?.id === tripId) {
      await get().setActiveTrip(tripId);
    }
  },

  deleteEvent: async (eventId: string) => {
    const event = await db.events.get(eventId);
    if (event) {
      await db.events.delete(eventId);
      if (get().activeTrip?.id === event.tripId) {
        await get().setActiveTrip(event.tripId);
      }
    }
  }
}));
