/* ============================================================
   NET — tiny storage adapter for online games.
   1) Inside the published Claude page: the artifact's shared `db`
      + `user` capabilities (people the page is shared with as
      Contributors can play together).
   2) On your own deployment (GitHub + Vercel): Cloud Firestore,
      when config.js has a Firebase apiKey.
   API: ready(), me, mode, get(path), set(path, data), update(path, data),
        add(collPath, data), watch(path, fn), watchColl(collPath, fn, {where, order, limit})
   ============================================================ */
const Net = (() => {
  let mode = null, db = null, fb = null, readyP = null;
  const me = { id: null, name: '' };
  const uidLocal = () => { let u = localStorage.getItem('president.uid'); if (!u) { u = 'u' + Math.random().toString(36).slice(2, 12); localStorage.setItem('president.uid', u); } return u; };

  async function init() {
    // 1) Claude artifact capabilities
    try {
      if (window.claude && typeof window.claude.use === 'function') {
        const [d, u] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
        if (d && u) {
          const id = await u.id();
          if (id) {
            db = d; mode = 'artifact'; me.id = id;
            try { const ps = await u.profiles([id]); me.name = (ps && ps[id] && ps[id].name) || ''; } catch (e) { /* no profile scope */ }
            return true;
          }
        }
      }
    } catch (e) { /* fall through */ }
    // 2) Firebase
    try {
      if (window.FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey) {
        fb = await import('./firebase.js'); fb.init(FIREBASE_CONFIG);
        mode = 'firebase'; me.id = uidLocal(); return true;
      }
    } catch (e) { console.warn('Firebase unavailable', e); }
    return false;
  }
  const ready = () => readyP || (readyP = Promise.race([init(), new Promise(r => setTimeout(() => r(false), 12000))]));

  const snapData = s => (s && s.exists ? { id: s.id, ...s.data() } : null);
  async function get(path) { return mode === 'artifact' ? snapData(await db.doc(path).get()) : fb.getDocData(path); }
  async function set(path, data) { return mode === 'artifact' ? db.doc(path).set(JSON.parse(JSON.stringify(data))) : fb.setDocData(path, data); }
  async function update(path, data) { return mode === 'artifact' ? db.doc(path).update(JSON.parse(JSON.stringify(data))) : fb.updateDocData(path, data); }
  async function add(coll, data) { return mode === 'artifact' ? (await db.collection(coll).add(JSON.parse(JSON.stringify(data)))).id : fb.addDocData(coll, data); }
  function watch(path, fn) {
    if (mode === 'artifact') return db.doc(path).onSnapshot(s => fn(snapData(s)), e => console.warn('watch', path, e));
    return fb.watchDoc(path, fn);
  }
  function watchColl(coll, fn, o = {}) {
    if (mode === 'artifact') {
      let q = db.collection(coll);
      (o.where || []).forEach(w => { q = q.where(...w); });
      if (o.order) q = q.orderBy(...o.order);
      if (o.limit) q = q.limit(o.limit);
      return q.onSnapshot(s => fn(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => console.warn('watchColl', coll, e));
    }
    return fb.watchColl(coll, fn, o);
  }
  // serialise writes per document ("one write at a time per doc")
  const chains = {};
  function queued(path, fnc) { const p = (chains[path] || Promise.resolve()).catch(() => {}).then(fnc); chains[path] = p; return p; }
  return {
    ready, me, get mode() { return mode; }, get,
    set: (p, d) => queued(p, () => set(p, d)), update: (p, d) => queued(p, () => update(p, d)), add, watch, watchColl,
  };
})();
