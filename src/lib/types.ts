
import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface User extends FirebaseUser {}

export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface Prayer {
  name: PrayerName;
  completed: boolean;
  timestamp?: Date | null;
}

export interface DailyPrayers {
  date: string; // YYYY-MM-DD
  Fajr: Omit<Prayer, 'name'>;
  Dhuhr: Omit<Prayer, 'name'>;
  Asr: Omit<Prayer, 'name'>;
  Maghrib: Omit<Prayer, 'name'>;
  Isha: Omit<Prayer, 'name'>;
}

export interface DailyInspirationContent {
  id: string;
  type: 'quote' | 'verse';
  content: string;
  source: string;
  category?: string; // Optional category
  dateAdded?: Date | Timestamp; // Date when the inspiration was added
}

export interface PrayerStat {
  date: string; // Or month, week string
  count: number;
  prayerName?: PrayerName; // For filtering
}

export interface UserProfileData {
  phoneNumber?: string;
  // Add other custom fields here if needed in Firestore user document
}
