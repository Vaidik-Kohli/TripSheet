import Dexie, { type Table } from 'dexie';
import type { Trip, TripEvent } from './types';

export class TripSheetDatabase extends Dexie {
  trips!: Table<Trip, string>;
  events!: Table<TripEvent, string>;

  constructor() {
    super('TripSheetDB');
    this.version(1).stores({
      trips: 'id, createdAt', // Primary key and indexed props
      events: 'id, tripId, startTime' // Primary key and indexed props
    });
  }
}

export const db = new TripSheetDatabase();
