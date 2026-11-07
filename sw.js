// Service worker: salva i file dell'app per aprirla anche con poca copertura.
// I dati (allenamenti, scouting) non passano da qui: li gestisce l'app.
try { if (typeof Notification !== 'undefined' && Notification.permission === 'granted') importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js'); } catch (e) { /* senza rete: le notifiche tornano alla prossima attivazione */ }
const VERSIONE = 'grypho-v332';
const FILE = [
  './', 'index.html', 'i18n-dict.js', 'i18n-engine.js', 'tagging.html', 'tagging-under.html', 'config.js', 'manifest.webmanifest', 'logo.svg', 'logo-perugia.png', 'logo-tagup.svg', 'logo-tagup-bianco.svg', 'logo-tagup.png', 'logo-completo.svg', 'icon-192.png', 'icon-512.png',
  'fonts/hanken-grotesk-latin-400-normal.woff2', 'fonts/hanken-grotesk-latin-500-normal.woff2', 'fonts/hanken-grotesk-latin-600-normal.woff2',
  'fonts/hanken-grotesk-latin-700-normal.woff2', 'fonts/hanken-grotesk-latin-800-normal.woff2',
  'fonts/barlow-condensed-latin-700-normal.woff2', 'fonts/barlow-condensed-latin-800-normal.woff2', 'fonts/barlow-condensed-latin-900-normal.woff2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSIONE).then((c) => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((chiavi) => Promise.all(chiavi.filter((k) => k !== VERSIONE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.cache === 'no-store' || req.headers.get('range')) return;   // il controllo versione va sempre in rete
  // pagine e script: prima la rete (cosi dopo un aggiornamento si vede subito la versione nuova), con la copia salvata se manca la copertura
  const pagina = req.mode === 'navigate' || /\.(html|js)$/.test(new URL(req.url).pathname) || new URL(req.url).pathname.endsWith('/');
  if (pagina) {
    /* apertura veloce: si mostra subito la copia salvata e intanto si scarica quella nuova (la vedi alla prossima apertura, o subito con l'avviso di aggiornamento) */
    e.respondWith(
      caches.open(VERSIONE).then((c) => c.match(req, { ignoreSearch: true }).then((salvata) => {
        const rete = fetch(req, { cache: 'no-cache' }).then((res) => { if (res && res.ok && !req.headers.get('range')) c.put(req, res.clone()); return res; });
        if (salvata) { e.waitUntil(rete.catch(() => {})); return salvata; }
        return rete.catch(() => c.match('index.html'));
      }))
    );
    return;
  }
  e.respondWith(
    caches.open(VERSIONE).then((c) => c.match(req).then((salvata) => {
      const rete = fetch(req, { cache: 'no-cache' }).then((res) => { if (res && res.ok) c.put(req, res.clone()); return res; });
      if (salvata) { e.waitUntil(rete.catch(() => {})); return salvata; }
      return rete.catch(() => caches.match('index.html'));
    }))
  );
});
