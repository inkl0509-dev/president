/* Service worker: makes the game installable and playable offline.
   Bump VERSION when you deploy new files so phones pick them up. */
const VERSION = 'president-v14';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'agenda.js', 'assistant.js', 'city.js', 'config.js', 'data.js', 'drafter.js', 'experts.js', 'firebase.js', 'game.js', 'gov.js', 'impact.js', 'loans.js', 'money.js', 'net.js', 'online.js', 'pwa.js', 'realcamp.js', 'scenes.js', 'school.js', 'stage.js', 'style.css', 'tbills.js', 'mega.js', 'resorts.js', 'qual.js', 'targets.js', 'advisers.js', 'qa.js', 'oil.js', 'debateq.js', 'cabtalk.js', 'sound.js', 'anthem.js', 'stars.js', 'guide.js', 'local.js', 'team.js', 'tender.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first for the page and game files (so updates arrive), falling back to the cache offline.
// Fonts and other static assets: cache first.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('firestore') || url.hostname.includes('googleapis.com') && url.pathname.includes('/v1/')) return; // live data
  const isFont = /fonts\.(googleapis|gstatic)\.com/.test(url.hostname);
  if (isFont || url.pathname.match(/\.(png|svg|webmanifest)$/)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; })
    .catch(() => caches.match(req).then(hit => hit || caches.match('index.html'))));
});
