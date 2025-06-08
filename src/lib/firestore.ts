
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit, FirestoreError, DocumentData, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { DailyPrayers, PrayerName, PrayerStatus, PrayerDetails, UserProfileData } from '@/lib/types';

export const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const convertDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDailyPrayers = async (userId: string, date: string): Promise<DailyPrayers | null> => {
  try {
    const prayerDocRef = doc(db, 'users', userId, 'prayers', date);
    const prayerDocSnap = await getDoc(prayerDocRef);

    if (prayerDocSnap.exists()) {
      const data = prayerDocSnap.data() as any;
      const newSchemaPrayers: DailyPrayers = {
        date: data.date || date,
        Fajr: { status: 'NOT_MARKED', timestamp: null },
        Dhuhr: { status: 'NOT_MARKED', timestamp: null },
        Asr: { status: 'NOT_MARKED', timestamp: null },
        Maghrib: { status: 'NOT_MARKED', timestamp: null },
        Isha: { status: 'NOT_MARKED', timestamp: null },
      };

      PRAYER_NAMES.forEach(name => {
        const prayerData = data[name];
        let currentStatus: PrayerStatus = 'NOT_MARKED';
        let currentTimestamp: Date | null = null;

        // Expecting new schema: { status: PrayerStatus, timestamp?: Date | null }
        if (prayerData && typeof prayerData.status === 'string') {
            currentStatus = prayerData.status as PrayerStatus;
            if (prayerData.timestamp && prayerData.timestamp instanceof Timestamp) {
                currentTimestamp = prayerData.timestamp.toDate();
            }
        }
        newSchemaPrayers[name] = { status: currentStatus, timestamp: currentTimestamp };
      });
      return newSchemaPrayers;
    } else {
      const newDailyPrayers: DailyPrayers = {
        date,
        Fajr: { status: 'NOT_MARKED', timestamp: null },
        Dhuhr: { status: 'NOT_MARKED', timestamp: null },
        Asr: { status: 'NOT_MARKED', timestamp: null },
        Maghrib: { status: 'NOT_MARKED', timestamp: null },
        Isha: { status: 'NOT_MARKED', timestamp: null },
      };
      await setDoc(prayerDocRef, newDailyPrayers);
      return newDailyPrayers;
    }
  } catch (error) {
    console.error("Error fetching daily prayers:", error);
    throw error;
  }
};

export const updatePrayerStatus = async (userId: string, date: string, prayerName: PrayerName, newStatus: PrayerStatus): Promise<void> => {
  try {
    const prayerDocRef = doc(db, 'users', userId, 'prayers', date);
    const prayerUpdate: { [key: string]: any } = {};
    prayerUpdate[`${prayerName}.status`] = newStatus;
    prayerUpdate[`${prayerName}.timestamp`] = newStatus === 'PRAYED' ? serverTimestamp() : null;

    const docSnap = await getDoc(prayerDocRef);
    if (!docSnap.exists()) {
      const newDailyPrayers: DailyPrayers = {
        date,
        Fajr: { status: 'NOT_MARKED', timestamp: null },
        Dhuhr: { status: 'NOT_MARKED', timestamp: null },
        Asr: { status: 'NOT_MARKED', timestamp: null },
        Maghrib: { status: 'NOT_MARKED', timestamp: null },
        Isha: { status: 'NOT_MARKED', timestamp: null },
      };
      (newDailyPrayers[prayerName] as PrayerDetails) = { status: newStatus, timestamp: newStatus === 'PRAYED' ? serverTimestamp() : null };
      await setDoc(prayerDocRef, newDailyPrayers);
    } else {
      await updateDoc(prayerDocRef, prayerUpdate);
    }
  } catch (error) {
    console.error("Error updating prayer status:", error);
    throw error;
  }
};

export const getPrayerStats = async (userId: string, period: 'daily' | 'weekly' | 'monthly', filter?: PrayerName | 'all'): Promise<DocumentData[]> => {
  const prayerData: DocumentData[] = [];
  const today = new Date();

  if (period === 'daily') {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = convertDateToYYYYMMDD(date);

      const dailyPrayersDocSnap = await getDoc(doc(db, 'users', userId, 'prayers', dateString));
      let prayedCount = 0;
      if (dailyPrayersDocSnap.exists()) {
        const data = dailyPrayersDocSnap.data() as DailyPrayers;
        PRAYER_NAMES.forEach(name => {
          if (filter === 'all' || filter === name) {
            if (data[name]?.status === 'PRAYED') {
              prayedCount++;
            }
          }
        });
      }
      prayerData.push({ date: dateString, count: prayedCount });
    }
  } else if (period === 'monthly' && filter) {
    let prayedCount = 0;
    let notPrayedCount = 0;
    let notMarkedCount = 0;

    for (let i = 29; i >= 0; i--) { // Iterate over the last 30 days
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = convertDateToYYYYMMDD(date);
      const dailyPrayersDocSnap = await getDoc(doc(db, 'users', userId, 'prayers', dateString));

      if (dailyPrayersDocSnap.exists()) {
        const data = dailyPrayersDocSnap.data() as DailyPrayers;
        if (filter === 'all') {
          PRAYER_NAMES.forEach(name => {
            const prayerDetails = data[name];
            if (prayerDetails?.status === 'PRAYED') {
              prayedCount++;
            } else if (prayerDetails?.status === 'NOT_PRAYED') {
              notPrayedCount++;
            } else { // Includes NOT_MARKED and cases where status might be missing
              notMarkedCount++;
            }
          });
        } else { // Specific prayer filter
          const prayerDetails = data[filter as PrayerName];
          if (prayerDetails?.status === 'PRAYED') {
            prayedCount++;
          } else if (prayerDetails?.status === 'NOT_PRAYED') {
            notPrayedCount++;
          } else {
            notMarkedCount++;
          }
        }
      } else { // Document for the day does not exist
        if (filter === 'all') {
          notMarkedCount += PRAYER_NAMES.length; // All 5 prayers are 'Not Marked'
        } else {
          notMarkedCount++; // The specific prayer is 'Not Marked'
        }
      }
    }

    prayerData.push({ name: 'Prayed', value: prayedCount });
    prayerData.push({ name: 'Not Prayed', value: notPrayedCount });
    prayerData.push({ name: 'Not Marked', value: notMarkedCount });

  } else if (period === 'weekly') {
    for (let week = 3; week >= 0; week--) {
      let weeklyPrayedCount = 0;
      for(let day = 6; day >=0; day--) {
        const date = new Date(today);
        date.setDate(today.getDate() - (week * 7 + day));
        const dateString = convertDateToYYYYMMDD(date);
        const dailyPrayersDocSnap = await getDoc(doc(db, 'users', userId, 'prayers', dateString));
        if (dailyPrayersDocSnap.exists()) {
          const data = dailyPrayersDocSnap.data() as DailyPrayers;
          PRAYER_NAMES.forEach(name => {
            if (filter === 'all' || filter === name) {
              if (data[name]?.status === 'PRAYED') weeklyPrayedCount++;
            }
          });
        }
      }
      const weekEndDate = new Date(today);
      weekEndDate.setDate(today.getDate() - (week * 7));
      const weekLabel = `Week ${4-week}`;
      prayerData.push({ week: weekLabel, count: weeklyPrayedCount });
    }
  }
  return prayerData;
};


export const getUserProfileData = async (userId: string): Promise<UserProfileData | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      return {
        displayName: data.displayName || '',
        email: data.email || '', // Fetch email
        phoneNumber: data.phoneNumber || '',
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    throw error;
  }
};

export const updateUserProfileData = async (userId: string, data: Partial<UserProfileData>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, data, { merge: true });
  } catch (error) {
    console.error("Error updating user profile data:", error);
    throw error;
  }
};
