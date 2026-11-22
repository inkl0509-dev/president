/* Cloud Firestore for your own deployment (GitHub + Vercel):
   - the online Hall of Fame
   - online multiplayer games (games/{id}, games/{id}/players, games/{id}/acts)
   Loaded only when config.js has a Firebase apiKey. */
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, getDoc, setDoc, updateDoc, doc, onSnapshot, query, where, orderBy, limit, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

let db = null;

export function init(config) {
  if (db) return;
  const app = getApps().length ? getApps()[0] : initializeApp(config);
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

// ---- generic helpers used by net.js ----
const clean = d => JSON.parse(JSON.stringify(d));
export async function getDocData(path) { const s = await getDoc(doc(db, path)); return s.exists() ? { id: s.id, ...s.data() } : null; }
export async function setDocData(path, data) { await setDoc(doc(db, path), clean(data)); }
export async function updateDocData(path, data) { await updateDoc(doc(db, path), clean(data)); }
export async function addDocData(coll, data) { return (await addDoc(collection(db, coll), clean(data))).id; }
export function watchDoc(path, fn) { return onSnapshot(doc(db, path), s => fn(s.exists() ? { id: s.id, ...s.data() } : null)); }
export function watchColl(coll, fn, o = {}) {
  const parts = [];
  (o.where || []).forEach(w => parts.push(where(...w)));
  if (o.order) parts.push(orderBy(...o.order));
  if (o.limit) parts.push(limit(o.limit));
  return onSnapshot(query(collection(db, coll), ...parts), s => fn(s.docs.map(d => ({ id: d.id, ...d.data() }))));
}
