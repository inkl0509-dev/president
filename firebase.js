/* Online Hall of Fame using Cloud Firestore.
   Loaded only when config.js has a Firebase apiKey. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

let db = null;

export function init(config) {
  const app = initializeApp(config);
  db = getFirestore(app);
}

export async function submitScore(entry) {
  await addDoc(collection(db, 'leaderboard'), { ...entry, createdAt: serverTimestamp() });
}

export async function topScores(n = 20) {
  const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}
