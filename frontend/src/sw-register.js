export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('[PWA] Service Worker registered successfully: ', registration.scope);
        })
        .catch(err => {
          console.error('[PWA] Service Worker registration failed: ', err);
        });
    });
  }
}
