/* ============================================================
   INSTALL AS AN APP (PWA)
   - registers the service worker (offline play)
   - Android / desktop Chrome & Edge: real "Install" prompt
   - iPhone / iPad: shows how to use Share → Add to Home Screen
   ============================================================ */
const PWA = (() => {
  let deferred = null;
  const inFrame = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /android/i.test(navigator.userAgent);

  if ('serviceWorker' in navigator && !inFrame && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(e => console.warn('Service worker not registered', e)));
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; if (typeof render === 'function' && UI.screen === 'title') render(); });
  window.addEventListener('appinstalled', () => { deferred = null; if (typeof toast === 'function') toast('🎉 Installed! Find “President” on your home screen.', 'good'); });

  const canShow = () => !standalone();
  async function install() {
    if (deferred) {
      deferred.prompt();
      const r = await deferred.userChoice.catch(() => null);
      deferred = null;
      if (r && r.outcome === 'accepted') toast('Installing…', 'good');
      render(); return;
    }
    let html;
    if (inFrame) html = `<p>This page is shown inside Claude, where apps can't be installed.</p>
      <p>Open the game on its own website (for example your Vercel address) on your phone, then install it from there.</p>`;
    else if (ios) html = `<ol class="inst"><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button <span class="ico">⬆︎</span> at the bottom of the screen.</li>
      <li>Scroll down and tap <b>Add to Home Screen</b> <span class="ico">➕</span>.</li><li>Tap <b>Add</b>. The 🏛️ President icon appears on your home screen.</li></ol>`;
    else if (android) html = `<ol class="inst"><li>Open this page in <b>Chrome</b>.</li><li>Tap the <b>⋮</b> menu at the top right.</li>
      <li>Tap <b>Install app</b> (or <b>Add to Home screen</b>).</li><li>Tap <b>Install</b>.</li></ol>`;
    else html = `<ol class="inst"><li>In Chrome or Edge, click the <b>install icon</b> ⊕ at the right end of the address bar,</li><li>or open the browser menu and choose <b>Install President</b>.</li></ol>`;
    await infoModal('📲', 'Install the game', html + '<p class="muted small">Once installed it opens full-screen like an app and also works offline (online multiplayer needs internet).</p>', 'Got it');
  }
  return { install, canShow, hasPrompt: () => !!deferred, standalone };
})();
