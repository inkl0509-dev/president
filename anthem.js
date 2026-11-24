/* ============================================================
   ANTHEMS AT OFFICIAL VISITS — as in real state-visit protocol,
   the military band plays the visiting country's anthem first,
   then the host's. Only anthems whose music is in the public
   domain are included as melodies (US, UK, France). For the
   fictional Republic of Veloria an original anthem was composed
   for the game. For other countries the band plays original
   ceremonial music instead.
   Notes: [name, beats]; 'r' = rest.
   ============================================================ */

const ANTHEMS = {
  gb: { name: 'God Save the King', bpm: 76, notes: [
    ['G4', 1], ['G4', 1], ['A4', 1], ['F#4', 1.5], ['G4', .5], ['A4', 1], ['B4', 1], ['B4', 1], ['C5', 1], ['B4', 1.5], ['A4', .5], ['G4', 1], ['A4', 1], ['G4', 1], ['F#4', 1], ['G4', 3],
    ['D5', 1], ['D5', 1], ['D5', 1], ['D5', 1.5], ['C5', .5], ['B4', 1], ['C5', 1], ['C5', 1], ['C5', 1], ['C5', 1.5], ['B4', .5], ['A4', 1],
    ['B4', 1], ['C5', .5], ['B4', .5], ['A4', .5], ['G4', .5], ['B4', 1.5], ['C5', .5], ['D5', 1], ['E5', .5], ['C5', .5], ['B4', 1], ['A4', 1], ['G4', 3]] },
  us: { name: 'The Star-Spangled Banner', bpm: 88, notes: [
    ['G4', .75], ['E4', .25], ['C4', 1], ['E4', 1], ['G4', 1], ['C5', 2], ['E5', .75], ['D5', .25], ['C5', 1], ['E4', 1], ['F#4', 1], ['G4', 2],
    ['G4', .5], ['G4', .5], ['E5', 1.5], ['D5', .5], ['C5', 1], ['B4', 2], ['A4', .75], ['B4', .25], ['C5', 1], ['C5', 1], ['G4', 1], ['E4', 1], ['C4', 2]] },
  fr: { name: 'La Marseillaise', bpm: 104, notes: [
    ['D4', .75], ['D4', .25], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['D5', 1.5], ['B4', .5], ['G4', .75], ['G4', .25], ['B4', .75], ['G4', .25], ['E4', 1], ['C5', 2], ['A4', .75], ['F#4', .25], ['G4', 2], ['r', 1],
    ['G4', .75], ['A4', .25], ['B4', 1], ['B4', 1], ['B4', 1], ['C5', .75], ['B4', .25], ['B4', 1], ['A4', 1], ['r', 1], ['A4', .75], ['B4', .25], ['C5', 1], ['C5', 1], ['C5', 1], ['D5', .75], ['C5', .25], ['B4', 3]] },
  veloria: { name: 'Anthem of Veloria (original, composed for the game)', bpm: 84, notes: [
    ['C4', 1], ['E4', 1], ['G4', 1.5], ['E4', .5], ['F4', 1], ['A4', 1], ['G4', 2], ['E4', 1], ['C4', 1], ['D4', 1], ['E4', .5], ['F4', .5], ['E4', 1], ['D4', 1], ['G4', 2],
    ['G4', 1], ['C5', 1], ['B4', 1], ['A4', 1], ['G4', 1.5], ['F4', .5], ['E4', 2], ['F4', 1], ['D4', 1], ['G4', 1], ['F4', .5], ['D4', .5], ['C4', 3]] },
  ceremonial: { name: 'ceremonial music', bpm: 96, notes: [
    ['C4', .5], ['C4', .5], ['G4', 1], ['E4', .5], ['G4', .5], ['C5', 2], ['A4', .5], ['G4', .5], ['F4', .5], ['A4', .5], ['G4', 2],
    ['E4', .5], ['F4', .5], ['G4', 1], ['C5', 1], ['B4', .5], ['A4', .5], ['G4', 1], ['F4', .5], ['D4', .5], ['E4', .5], ['D4', .5], ['C4', 3]] },
};
const ANTHEM_CODE = { uk: 'gb' };   // game country id → anthem key

const Anthem = (() => {
  const key = c => { const k = ANTHEM_CODE[c] || c; return ANTHEMS[k] ? k : null; };
  const label = (c, nm) => { const k = key(c); return k ? `🎺 ${ANTHEMS[k].name}` : `🎺 ceremonial music for ${nm}`; };
  // returns a stop function
  function visit(hostCode, hostName) {
    const me = COUNTRY.id, a1 = ANTHEMS[key(me) || 'ceremonial'], h = key(hostCode);
    const seqs = [a1];
    if (h && h !== key(me)) seqs.push(ANTHEMS[h]); else if (!h) seqs.push(null);
    const lines = [label(me, S.country), h && h !== key(me) ? `🎺 ${ANTHEMS[h].name} (${hostName})` : null].filter(Boolean);
    return { lines, stop: Sound.anthem(seqs.filter(Boolean)) };
  }
  return { visit, label };
})();
