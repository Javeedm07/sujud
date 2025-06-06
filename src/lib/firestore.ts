
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit, FirestoreError, DocumentData, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { DailyPrayers, PrayerName, DailyInspirationContent } from '@/lib/types';

export const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const getTodayDateString = (): string => {
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
      newDailyPrayers[prayerName] = { completed, timestamp: completed ? new Date() : null }; 
      await setDoc(prayerDocRef, newDailyPrayers);
    } else {
      await updateDoc(prayerDocRef, prayerUpdate);
    }
  } catch (error) {
    console.error("Error updating prayer status:", error);
    throw error;
  }
};


export const fetchDailyInspiration = async (): Promise<DailyInspirationContent | null> => {
  try {
    const inspirationsColRef = collection(db, 'daily_inspirations');
    const q = query(inspirationsColRef); 
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      await seedDailyInspirations();
      const seededSnapshot = await getDocs(q);
      if (seededSnapshot.empty) return null;
      
      const inspirations = seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyInspirationContent));
      return inspirations[Math.floor(Math.random() * inspirations.length)];
    }

    const inspirations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyInspirationContent));
    return inspirations[Math.floor(Math.random() * inspirations.length)];
  } catch (error) {
    console.error("Error fetching daily inspiration:", error);
    return {
      id: 'fallback',
      type: 'quote',
      content: "The best of deeds are those that are consistent, even if they are few.",
      source: "Prophet Muhammad (peace be upon him)"
    };
  }
};

const seedDailyInspirations = async () => {
  const inspirations = [
    { type: 'verse', content: "Indeed, with hardship [will be] ease.", source: "Quran 94:6" },
    { type: 'quote', content: "The world is a prison for the believer and a paradise for the disbeliever.", source: "Hadith Muslim" },
    { type: 'verse', content: "And seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive [to Allah].", source: "Quran 2:45" },
    { type: 'quote', content: "Do not lose hope, nor be sad.", source: "Quran 3:139 (paraphrased)" },
    { type: 'verse', content: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.", source: "Quran 2:152" },
  ];

  const inspirationsColRef = collection(db, 'daily_inspirations');
  for (const insp of inspirations) {
    const docRef = doc(inspirationsColRef, insp.content.substring(0,20).replace(/ /g, '_')); 
    await setDoc(docRef, insp);
  }
  console.log("Daily inspirations seeded.");
};

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
      prayerData.push({ name: 'No Data', value: 1 });
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

export { getTodayDateString };
