import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ResultsPage from './components/ResultsPage.jsx'
import { registerServiceWorker } from './sw-register'

// Capture beforeinstallprompt BEFORE React mounts — the event fires very early
window.__pwa_deferred_prompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__pwa_deferred_prompt = e;
});

const isResultsPage = window.location.pathname.includes('resultVIIBM8651');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isResultsPage ? <ResultsPage /> : <App />}
  </StrictMode>,
)

registerServiceWorker();

