
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit, FirestoreError, DocumentData, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { DailyPrayers, PrayerName, UserProfileData } from '@/lib/types'; // DailyInspirationContent removed

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
      const data = prayerDocSnap.data() as DailyPrayers;
      // Convert Firestore Timestamps to JS Dates
      PRAYER_NAMES.forEach(name => {
        if (data[name]?.timestamp && data[name].timestamp instanceof Timestamp) {
          // @ts-ignore
          data[name].timestamp = (data[name].timestamp as Timestamp).toDate();
        }
      });
      return data;
    } else {
      // Create a new document for the day if it doesn't exist
      const newDailyPrayers: DailyPrayers = {
        date,
        Fajr: { completed: false, timestamp: null },
        Dhuhr: { completed: false, timestamp: null },
        Asr: { completed: false, timestamp: null },
        Maghrib: { completed: false, timestamp: null },
        Isha: { completed: false, timestamp: null },
      };
      await setDoc(prayerDocRef, newDailyPrayers);
      return newDailyPrayers;
    }
  } catch (error) {
    console.error("Error fetching daily prayers:", error);
    throw error; // Re-throw to be handled by caller
  }
};

export const updatePrayerStatus = async (userId: string, date: string, prayerName: PrayerName, completed: boolean): Promise<void> => {
  try {
    const prayerDocRef = doc(db, 'users', userId, 'prayers', date);
    const prayerUpdate: { [key: string]: any } = {};
    prayerUpdate[`${prayerName}.completed`] = completed;
    prayerUpdate[`${prayerName}.timestamp`] = completed ? serverTimestamp() : null;
    
    const docSnap = await getDoc(prayerDocRef);
    if (!docSnap.exists()) {
      const newDailyPrayers: DailyPrayers = {
        date,
        Fajr: { completed: false, timestamp: null },
        Dhuhr: { completed: false, timestamp: null },
        Asr: { completed: false, timestamp: null },
        Maghrib: { completed: false, timestamp: null },
        Isha: { completed: false, timestamp: null },
      };
      // @ts-ignore
      newDailyPrayers[prayerName] = { completed, timestamp: completed ? serverTimestamp() : null }; 
      await setDoc(prayerDocRef, newDailyPrayers);
    } else {
      await updateDoc(prayerDocRef, prayerUpdate);
    }
  } catch (error) {
    console.error("Error updating prayer status:", error);
    throw error;
  }
};

// fetchDailyInspiration function removed
// seedDailyInspirations function removed

export const getPrayerStats = async (userId: string, period: 'daily' | 'weekly' | 'monthly', filter?: PrayerName | 'all'): Promise<DocumentData[]> => {
  const prayerData: DocumentData[] = [];
  const today = new Date();

  if (period === 'daily') { 
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = convertDateToYYYYMMDD(date);
      
      const dailyPrayersDoc = await getDoc(doc(db, 'users', userId, 'prayers', dateString));
      let completedCount = 0;
      if (dailyPrayersDoc.exists()) {
        const data = dailyPrayersDoc.data() as DailyPrayers;
        PRAYER_NAMES.forEach(name => {
          if (filter === 'all' || filter === name) {
            if (data[name]?.completed) {
              completedCount++;
            }
          }
        });
      }
      prayerData.push({ date: dateString, count: completedCount });
    }
  } 
  else if (period === 'monthly' && filter) {
     let totalPrayers = 0;
     let completedPrayers = 0;
     for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = convertDateToYYYYMMDD(date);
        const dailyPrayersDoc = await getDoc(doc(db, 'users', userId, 'prayers', dateString));
        if (dailyPrayersDoc.exists()) {
            const data = dailyPrayersDoc.data() as DailyPrayers;
            if (filter === 'all') {
                PRAYER_NAMES.forEach(name => {
                    totalPrayers++;
                    if (data[name]?.completed) completedPrayers++;
                });
            } else {
                totalPrayers++;
                 if (data[filter as PrayerName]?.completed) completedPrayers++;
            }
        } else {
          if (filter === 'all') totalPrayers += PRAYER_NAMES.length;
          else totalPrayers++;
        }
     }
     if (totalPrayers > 0) {
      prayerData.push({ name: 'Completed', value: completedPrayers });
      prayerData.push({ name: 'Missed', value: totalPrayers - completedPrayers });
     } else {
      prayerData.push({ name: 'No Data', value: 1 }); // Represents 100% "No Data" segment
     }

  } else if (period === 'weekly') {
    for (let week = 3; week >= 0; week--) {
      let weeklyCompletedCount = 0;
      for(let day = 6; day >=0; day--) {
        const date = new Date(today);
        date.setDate(today.getDate() - (week * 7 + day));
        const dateString = convertDateToYYYYMMDD(date);
        const dailyPrayersDoc = await getDoc(doc(db, 'users', userId, 'prayers', dateString));
        if (dailyPrayersDoc.exists()) {
          const data = dailyPrayersDoc.data() as DailyPrayers;
          PRAYER_NAMES.forEach(name => {
            if (filter === 'all' || filter === name) {
              if (data[name]?.completed) weeklyCompletedCount++;
            }
          });
        }
      }
      prayerData.push({ week: `Week ${4-week}`, count: weeklyCompletedCount });
    }
  }
  return prayerData;
};


// User Profile Data Functions
export const getUserProfileData = async (userId: string): Promise<UserProfileData | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      return {
        displayName: data.displayName || '', // Ensure displayName is fetched
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
