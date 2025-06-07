
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit, FirestoreError, DocumentData, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { DailyPrayers, PrayerName, DailyInspirationContent, UserProfileData } from '@/lib/types';

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


export const fetchDailyInspiration = async (): Promise<DailyInspirationContent> => {
  try {
    const inspirationsColRef = collection(db, 'daily_inspirations');
    let querySnapshot = await getDocs(inspirationsColRef); 

    if (querySnapshot.empty) {
      await seedDailyInspirations(); 
      querySnapshot = await getDocs(inspirationsColRef); 
      if (querySnapshot.empty) {
        console.warn("Daily inspirations collection still empty after seeding.");
        return { 
          id: 'fallback_seed_empty',
          type: 'quote',
          content: "Strive for that which will benefit you, seek help from Allah, and do not give up.",
          source: "Prophet Muhammad (pbuh)"
        };
      }
    }

    const inspirations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyInspirationContent));

    if (inspirations.length === 0) {
        console.warn("No inspirations found in the collection array.");
        return { 
            id: 'fallback_no_inspirations_in_array',
            type: 'quote',
            content: "Patience is a key that opens the door to relief and joy.",
            source: "Islamic Proverb"
        };
    }

    // Make selection deterministic based on the day of the year
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0); // Day 0 of the year
    const diff = today.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay); // dayOfYear is 1-indexed for Jan 1st

    const selectedInspiration = inspirations[ (dayOfYear -1 ) % inspirations.length]; // Use (dayOfYear - 1) for 0-based array index
    return selectedInspiration;

  } catch (error) {
    console.error("Error fetching daily inspiration:", error);
    return { 
      id: 'fallback_error',
      type: 'quote',
      content: "The best of deeds are those that are consistent, even if they are few.",
      source: "Prophet Muhammad (pbuh)"
    };
  }
};

const seedDailyInspirations = async () => {
  const inspirationsData: Omit<DailyInspirationContent, 'id'>[] = [
    // Existing 7
    { type: 'verse', content: "Indeed, with hardship [will be] ease.", source: "Quran 94:6" },
    { type: 'quote', content: "The world is a prison for the believer and a paradise for the disbeliever.", source: "Hadith - Muslim" },
    { type: 'verse', content: "And seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive [to Allah].", source: "Quran 2:45" },
    { type: 'quote', content: "Do not lose hope, nor be sad.", source: "Quran 3:139 (paraphrased)" },
    { type: 'verse', content: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.", source: "Quran 2:152" },
    { type: 'quote', content: "He who desires the world, and its riches, should learn Ilm (knowledge). He who desires the Aakhirah (Hereafter), should learn Ilm.", source: "Imam Shafi'i" },
    { type: 'verse', content: "And whoever fears Allah - He will make for him a way out and will provide for him from where he does not expect.", source: "Quran 65:2-3" },
    // Adding more (aiming for substantial additions)
    { type: 'quote', content: "The strongest among you is the one who controls his anger.", source: "Prophet Muhammad (pbuh) - Bukhari" },
    { type: 'verse', content: "Allah does not burden a soul beyond that it can bear.", source: "Quran 2:286" },
    { type: 'quote', content: "Kindness is a mark of faith, and whoever has not kindness has not faith.", source: "Prophet Muhammad (pbuh) - Muslim" },
    { type: 'verse', content: "Verily, in the remembrance of Allah do hearts find rest.", source: "Quran 13:28" },
    { type: 'quote', content: "Speak good or remain silent.", source: "Prophet Muhammad (pbuh) - Bukhari, Muslim" },
    { type: 'verse', content: "And We will surely test you with something of fear and hunger and a loss of wealth and lives and fruits, but give good tidings to the patient.", source: "Quran 2:155" },
    { type: 'quote', content: "The best richness is the richness of the soul.", source: "Prophet Muhammad (pbuh) - Bukhari" },
    { type: 'verse', content: "Is there any reward for good other than good?", source: "Quran 55:60" },
    { type: 'quote', content: "A man's true wealth is the good he does in this world.", source: "Prophet Muhammad (pbuh)" },
    { type: 'verse', content: "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.", source: "Quran 2:153" },
    { type: 'quote', content: "Patience is a pillar of faith.", source: "Umar ibn Al-Khattab (R.A)" },
    { type: 'verse', content: "And hold firmly to the rope of Allah all together and do not become divided.", source: "Quran 3:103" },
    { type: 'quote', content: "The believer is like a brick for another believer, the one supporting the other.", source: "Prophet Muhammad (pbuh) - Bukhari" },
    { type: 'verse', content: "Call upon Me; I will respond to you.", source: "Quran 40:60" },
    { type: 'quote', content: "Dua (supplication) is the weapon of the believer.", source: "Prophet Muhammad (pbuh) - Al-Hakim" },
    { type: 'verse', content: "He is with you wherever you are.", source: "Quran 57:4" },
    { type: 'quote', content: "Knowledge from which no benefit is derived is like a treasure out of which nothing is spent in the cause of God.", source: "Prophet Muhammad (pbuh) - Tirmidhi" },
    { type: 'verse', content: "And say, 'My Lord, increase me in knowledge.'", source: "Quran 20:114" },
    { type: 'quote', content: "The seeking of knowledge is obligatory for every Muslim.", source: "Prophet Muhammad (pbuh) - Ibn Majah" },
    { type: 'verse', content: "So flee to Allah.", source: "Quran 51:50" },
    { type: 'quote', content: "Forgive others as you would like Allah to forgive you.", source: "Islamic Saying" },
    { type: 'verse', content: "And cooperate in righteousness and piety, but do not cooperate in sin and aggression.", source: "Quran 5:2" },
    { type: 'quote', content: "The best of people are those that bring most benefit to the rest of mankind.", source: "Prophet Muhammad (pbuh) - Daraqutni" },
    { type: 'verse', content: "Indeed, the most noble of you in the sight of Allah is the most righteous of you.", source: "Quran 49:13" },
    { type: 'quote', content: "Do not belittle any good deed, even meeting your brother with a cheerful face.", source: "Prophet Muhammad (pbuh) - Muslim" },
    { type: 'verse', content: "And worship your Lord until there comes to you the certainty (death).", source: "Quran 15:99" },
    { type: 'quote', content: "Be in this world as if you were a stranger or a traveler.", source: "Prophet Muhammad (pbuh) - Bukhari" },
    { type: 'verse', content: "And if you should count the favors of Allah, you could not enumerate them.", source: "Quran 14:34" },
    { type: 'quote', content: "Gratitude for the abundance you have received is the best insurance that the abundance will continue.", source: "Prophet Muhammad (pbuh)" },
    { type: 'verse', content: "My mercy encompasses all things.", source: "Quran 7:156" },
    { type: 'quote', content: "The ink of the scholar is more sacred than the blood of the martyr.", source: "Prophet Muhammad (pbuh)" },
    { type: 'verse', content: "Read! In the Name of your Lord Who has created (all that exists).", source: "Quran 96:1" },
    { type: 'quote', content: "Silence is a source of dignity.", source: "Umar ibn Al-Khattab (R.A)" },
    { type: 'verse', content: "And whoever relies upon Allah – then He is sufficient for him.", source: "Quran 65:3" },
    { type: 'quote', content: "Trust in Allah but tie your camel.", source: "Prophet Muhammad (pbuh) - Tirmidhi" },
    { type: 'verse', content: "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.", source: "Quran 2:201" },
    { type: 'quote', content: "When deeds are done for the sake of God, they are accepted.", source: "Ali ibn Abi Talib (R.A)" },
    { type: 'verse', content: "Indeed, Allah loves those who are constantly repentant and loves those who purify themselves.", source: "Quran 2:222" },
    { type: 'quote', content: "Every son of Adam sins, and the best of sinners are those who repent.", source: "Prophet Muhammad (pbuh) - Tirmidhi" },
    { type: 'verse', content: "And do not walk on the earth arrogantly. Indeed, you will never tear the earth [apart], and you will never reach the mountains in height.", source: "Quran 17:37" },
    { type: 'quote', content: "Humility raises one’s rank.", source: "Prophet Muhammad (pbuh)" },
    { type: 'verse', content: "So which of the favors of your Lord would you deny?", source: "Quran 55:13 (repeated)" },
    { type: 'quote', content: "Reflection is the lamp of the heart. If it departs, the heart will have no light.", source: "Abdullah ibn Al-Mubarak" },
    { type: 'verse', content: "And do not despair of relief from Allah. Indeed, no one despairs of relief from Allah except the disbelieving people.", source: "Quran 12:87" },
    { type: 'quote', content: "The cure for ignorance is to ask.", source: "Prophet Muhammad (pbuh)" },
    { type: 'verse', content: "To Allah belongs the east and the west. So wherever you [might] turn, there is the Face of Allah.", source: "Quran 2:115" },
    { type: 'quote', content: "Practice what you preach.", source: "Islamic Saying" },
    { type: 'verse', content: "And [He revealed] the Book with truth, confirming that which preceded it of the Scripture and as a criterion over it.", source: "Quran 5:48" },
    { type: 'quote', content: "Charity does not decrease wealth.", source: "Prophet Muhammad (pbuh) - Muslim" },
    { type: 'verse', content: "Indeed, prayers prohibit immorality and wrongdoing.", source: "Quran 29:45" },
    { type: 'quote', content: "The closest a servant is to his Lord is when he is in prostration.", source: "Prophet Muhammad (pbuh) - Muslim" },
    { type: 'verse', content: "And it is He who accepts repentance from his servants and pardons misdeeds, and He knows what you do.", source: "Quran 42:25" },
    { type: 'quote', content: "Modesty is part of faith.", source: "Prophet Muhammad (pbuh) - Bukhari" },
    { type: 'verse', content: "If Allah helps you, none can overcome you; and if He forsakes you, who is there after Him that can help you? And in Allah (Alone) let believers put their trust.", source: "Quran 3:160" },
    { type: 'quote', content: "The deeds are considered by the intentions, and a person will get the reward according to his intention.", source: "Prophet Muhammad (pbuh) - Bukhari, Muslim" },
    { type: 'verse', content: "And speak to people good [words].", source: "Quran 2:83" },
    { type: 'quote', content: "A true Muslim is one from whose tongue and hands mankind is safe.", source: "Prophet Muhammad (pbuh) - Bukhari, Muslim" },
    { type: 'verse', content: "And [remember] when your Lord proclaimed, 'If you are grateful, I will surely increase you [in favor]; but if you deny, indeed, My punishment is severe.'", source: "Quran 14:7" },
    { type: 'quote', content: "Contentment is a treasure that is never exhausted.", source: "Ali ibn Abi Talib (R.A)" },
    { type: 'verse', content: "Allah wishes to lighten (the burden) for you; and man was created weak.", source: "Quran 4:28" },
    { type: 'quote', content: "The Parable of the Believers in their mutual love, mercy and sympathy is like that of a body; if one of the organs is afflicted, the whole body responds to it with wakefulness and fever.", source: "Prophet Muhammad (pbuh) - Bukhari, Muslim" },
    { type: 'verse', content: "Indeed, my prayer, my rites of sacrifice, my living and my dying are for Allah, Lord of the worlds.", source: "Quran 6:162" },
    { type: 'quote', content: "Take benefit of five before five: Your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before you are preoccupied, and your life before your death.", source: "Prophet Muhammad (pbuh) - Al-Hakim" },
    { type: 'verse', content: "And it may be that you dislike a thing which is good for you and that you like a thing which is bad for you. Allah knows but you do not know.", source: "Quran 2:216" },
    { type: 'quote', content: "The most beloved of deeds to Allah are those that are most consistent, even if it is small.", source: "Prophet Muhammad (pbuh) - Bukhari, Muslim" },
    { type: 'verse', content: "Say, 'He is Allah, [who is] One.'", source: "Quran 112:1" },
    { type: 'quote', content: "Leave that which makes you doubt for that which does not make you doubt.", source: "Prophet Muhammad (pbuh) - Tirmidhi" },
    { type: 'verse', content: "The Night of Decree is better than a thousand months.", source: "Quran 97:3" },
    { type: 'quote', content: "Whoever fasts Ramadan out of faith and in the hope of reward, his previous sins will be forgiven.", source: "Prophet Muhammad (pbuh) - Bukhari, Muslim" },
    { type: 'verse', content: "And We have already created man and know what his soul whispers to him, and We are closer to him than [his] jugular vein.", source: "Quran 50:16" },
    { type: 'quote', content: "The true believer is not someone who is without sin, but someone who sins and repents.", source: "Islamic Saying" },
    { type: 'verse', content: "Verily, with the remembrance of God, hearts are reassured.", source: "Quran 13:28" },
    { type: 'quote', content: "The one who guides to something good has a reward similar to that of its doer.", source: "Prophet Muhammad (pbuh) - Muslim" },
    { type: 'verse', content: "O mankind, indeed We have created you from male and female and made you peoples and tribes that you may know one another.", source: "Quran 49:13" },
    { type: 'quote', content: "He is not a believer who eats his fill while his neighbor beside him is hungry.", source: "Prophet Muhammad (pbuh) - Bayhaqi" },
    { type: 'verse', content: "And do not let your Bounteous Lord deceive you.", source: "Quran 82:6" },
    { type: 'quote', content: "The value of a person is in what he is good at.", source: "Ali ibn Abi Talib (R.A)" },
    { type: 'verse', content: "And establish prayer and give zakah and bow with those who bow [in worship and obedience].", source: "Quran 2:43" },
    { type: 'quote', content: "Zakat is a bridge of Islam.", source: "Prophet Muhammad (pbuh)" },
    { type: 'verse', content: "To whoever, male or female, does good deeds and has faith, We shall give a good life and reward them according to the best of their actions.", source: "Quran 16:97" },
    { type: 'quote', content: "Cleanliness is half of faith.", source: "Prophet Muhammad (pbuh) - Muslim" },
    { type: 'verse', content: "And those who strive for Us - We will surely guide them to Our ways. And indeed, Allah is with the doers of good.", source: "Quran 29:69" },
    { type: 'quote', content: "The pen is the tongue of the mind.", source: "Ali ibn Abi Talib (R.A)" },
    { type: 'verse', content: "And obey Allah and the Messenger that you may obtain mercy.", source: "Quran 3:132" },
    { type: 'quote', content: "Whoever loves to meet Allah, Allah loves to meet him.", source: "Prophet Muhammad (pbuh) - Bukhari" }
  ];

  const inspirationsColRef = collection(db, 'daily_inspirations');
  for (const insp of inspirationsData) {
    // Use a more unique ID, e.g., hash of content or a dedicated ID field if managing externally
    const docId = insp.content.substring(0, 20).replace(/\s+/g, '_').replace(/[^\w]/gi, '') || `insp_${Math.random().toString(36).substring(7)}`; 
    const docRef = doc(inspirationsColRef, docId); 
    try {
        // Using setDoc will create or overwrite. 
        // If you only want to add new ones and skip existing, you'd need a getDoc check first.
        await setDoc(docRef, insp);
    } catch (e) {
        console.error("Error seeding inspiration: ", insp.content, e);
    }
  }
  console.log("Daily inspirations seeded or updated with a larger list.");
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
        phoneNumber: data.phoneNumber || '', // Default to empty string if not present
      };
    }
    return null; // Or return default empty profile data
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    throw error;
  }
};

export const updateUserProfileData = async (userId: string, data: Partial<UserProfileData>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    // Use setDoc with merge: true to create the document if it doesn't exist, or update it if it does.
    await setDoc(userDocRef, data, { merge: true }); 
  } catch (error) {
    console.error("Error updating user profile data:", error);
    throw error;
  }
};

