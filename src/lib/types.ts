
import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface User extends FirebaseUser {}

export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export type PrayerStatus = 'NOT_MARKED' | 'PRAYED' | 'NOT_PRAYED';

export interface PrayerDetails {
  status: PrayerStatus;
  timestamp?: Date | null; // Timestamp primarily for PRAYED status
}

export interface DailyPrayers {
  date: string; // YYYY-MM-DD
  Fajr: PrayerDetails;
  Dhuhr: PrayerDetails;
  Asr: PrayerDetails;
  Maghrib: PrayerDetails;
  Isha: PrayerDetails;
}

export interface PrayerStat {
  date: string; // Or month, week string
  count: number;
  prayerName?: PrayerName; // For filtering
}

export interface UserProfileData {
  displayName?: string;
  email?: string; 
  phoneNumber?: string;
}

export interface SalahTip {
  id: string;
  title: string;
  summary: string;
  content: string;
  category?: 'quantity' | 'quality' | 'general'; // Optional category
}
