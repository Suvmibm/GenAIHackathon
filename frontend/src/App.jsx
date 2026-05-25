import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SelectionCard from './components/SelectionCard';
import CriteriaList from './components/CriteriaList';
import Leaderboard from './components/Leaderboard';
import OfflineBanner from './components/OfflineBanner';
import SubmissionsView from './components/SubmissionsView';

// Offline-only fallback — used ONLY when API is unreachable AND device is offline
const OFFLINE_FALLBACK = {
  houses: [],
  teams: [],
  juries: [],
  criteria: []
};

const API_BASE = import.meta.env.VITE_API_URL;

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('evaluate'); // 'evaluate' or 'leaderboard'

  // Application Data Lists — empty until DB responds
  const [houses, setHouses] = useState([]);
  const [teams, setTeams] = useState([]);
  const [juries, setJuries] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [standings, setStandings] = useState([]);
  const [metadataLoading, setMetadataLoading] = useState(true);

  // Form State
  const [selectedHouse, setSelectedHouse] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedJury, setSelectedJury] = useState('');
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState('');

  // Status indicators
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success'|'error'|'info', message: '' }
  const [syncToast, setSyncToast] = useState(null); // String toast message

  // PWA & Connection Queue
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);

  // PWA installation states
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [activeInstallTab, setActiveInstallTab] = useState('ios');

  // 1. Initial Load & Listeners
  useEffect(() => {
    // Check initial network connectivity
    setIsOffline(!navigator.onLine);

    // Event listeners for offline/online switches
    const handleOnline = () => {
      setIsOffline(false);
      triggerSyncToast('Back online! Reconnecting to scoring database...');
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA beforeinstallprompt handler
    // main.jsx captures the event early (before React mounts), so check that first
    if (window.__pwa_deferred_prompt) {
      setDeferredPrompt(window.__pwa_deferred_prompt);
      setShowInstallBtn(true);
    }
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.__pwa_deferred_prompt = e;
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
      setShowInstallBtn(false);
    }

    // Load data from localStorage queue
    const savedQueue = localStorage.getItem('offline_scores_queue');
    if (savedQueue) {
      setOfflineQueue(JSON.parse(savedQueue));
    }

    // Fetch initial metadata
    fetchMetadata();
    fetchLeaderboard();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    // Already installed as standalone — do nothing
    if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
      setAlert({ type: 'info', message: 'App is already installed on this device!' });
      return;
    }

    const prompt = deferredPrompt || window.__pwa_deferred_prompt;
    if (prompt) {
      // Native browser install prompt available — use it directly
      try {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') {
          setAlert({ type: 'success', message: 'App installed successfully! Launch it from your home screen.' });
        }
        window.__pwa_deferred_prompt = null;
        setDeferredPrompt(null);
        setShowInstallBtn(false);
      } catch (err) {
        console.warn('[PWA] Install prompt failed:', err);
        setShowInstallModal(true);
      }
    } else {
      // No native prompt — show manual guide with auto-detected platform tab
      const ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        setActiveInstallTab('ios');
      } else if (/android/.test(ua)) {
        setActiveInstallTab('android');
      } else {
        setActiveInstallTab('desktop');
      }
      setShowInstallModal(true);
    }
  };

  // 2. Sync Offline Queue when network restores
  useEffect(() => {
    if (!isOffline && offlineQueue.length > 0) {
      syncOfflineSubmissions();
    }
  }, [isOffline, offlineQueue]);

  // Toast auto-clear
  useEffect(() => {
    if (syncToast) {
      const timer = setTimeout(() => setSyncToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [syncToast]);



  const triggerSyncToast = (msg) => {
    setSyncToast(msg);
  };

  // API Call: Fetch Metadata — always use DB values, never fall back to hardcoded
  const fetchMetadata = async () => {
    setMetadataLoading(true);
    try {
      const res = await fetch(`${API_BASE}/metadata`);
      if (res.ok) {
        const data = await res.json();
        setHouses(data.houses || []);
        setTeams(data.teams || []);
        setJuries(data.juries || []);
        setCriteria(data.criteria || []);
      } else {
        console.warn('[DB] Metadata endpoint returned', res.status);
      }
    } catch (e) {
      console.warn('[DB] Cannot reach backend:', e);
    } finally {
      setMetadataLoading(false);
    }
  };

  // API Call: Fetch Leaderboard Standings
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setStandings(data);
      }
    } catch (e) {
      console.warn('Unable to load real-time standings:', e);
    } finally {
      setLoading(false);
    }
  };

  // Score handlers
  const handleScoreChange = (criterionId, scoreVal) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: scoreVal
    }));
  };

  const resetFormFields = () => {
    setSelectedHouse('');
    setSelectedTeam('');
    setScores({});
    setComments('');
  };

  const handleResetForm = () => {
    setScores({});
    setAlert(null);
  };

  // Sync Indexed Offline Queue with Server
  const syncOfflineSubmissions = async () => {
    console.log('[Sync] Restored network. Uploading queue...', offlineQueue);
    let successfullyUploaded = 0;
    const currentQueue = [...offlineQueue];

    for (let i = 0; i < currentQueue.length; i++) {
      const submission = currentQueue[i];
      try {
        const res = await fetch(`${API_BASE}/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission)
        });

        if (res.ok || res.status === 400) {
          // 400 means either validation error or Duplicate Submission (already exists in DB)
          // We remove it from queue to prevent looping blocks
          successfullyUploaded++;
        }
      } catch (err) {
        console.error('[Sync] Upload failed for item:', submission, err);
        // Break loop and keep remaining in queue
        break;
      }
    }

    if (successfullyUploaded > 0) {
      const remainingQueue = currentQueue.slice(successfullyUploaded);
      setOfflineQueue(remainingQueue);
      localStorage.setItem('offline_scores_queue', JSON.stringify(remainingQueue));
      triggerSyncToast(`Sync completed! ${successfullyUploaded} offline evaluations uploaded.`);
      fetchLeaderboard();
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation check
    if (!selectedJury) {
      setAlert({ type: 'error', message: 'Evaluation failed: Please select your Jury Profile before submitting.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!selectedTeam) {
      setAlert({ type: 'error', message: 'Evaluation failed: Please select the Team you are scoring.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (Object.keys(scores).length < criteria.length) {
      setAlert({ type: 'error', message: `Evaluation failed: Please provide scores for all ${criteria.length} criteria questions.` });
      return;
    }

    // Auto-detect house_id if not selected manually
    let targetHouseId = selectedHouse;
    if (!targetHouseId) {
      const matchedTeam = teams.find(t => t.id === parseInt(selectedTeam));
      if (matchedTeam) targetHouseId = matchedTeam.house_id;
    }

    const submissionPayload = {
      jury_id: parseInt(selectedJury),
      team_id: parseInt(selectedTeam),
      house_id: parseInt(targetHouseId),
      comments: comments,
      scores: scores
    };

    // 2. Offline routing
    if (isOffline) {
      const updatedQueue = [...offlineQueue, submissionPayload];
      setOfflineQueue(updatedQueue);
      localStorage.setItem('offline_scores_queue', JSON.stringify(updatedQueue));
      
      setAlert({ 
        type: 'success', 
        message: 'Saved Offline! Evaluation queued securely. It will be uploaded automatically once connection is active.' 
      });
      resetFormFields();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 3. Online routing
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload)
      });

      const data = await res.json();

      if (res.ok) {
        setAlert({ type: 'success', message: 'Success! Evaluation uploaded and registered instantly.' });
        resetFormFields();
        fetchLeaderboard();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Validation/Duplicate submission warning
        setAlert({ type: 'error', message: data.message || data.error || 'Submission rejected by server.' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Submission failed, queuing locally:', err);
      // Fallback: network glitch, save to queue
      const updatedQueue = [...offlineQueue, submissionPayload];
      setOfflineQueue(updatedQueue);
      localStorage.setItem('offline_scores_queue', JSON.stringify(updatedQueue));
      setAlert({ type: 'info', message: 'Connection interrupted. Saved evaluation in local queue for auto-sync.' });
      resetFormFields();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Brand Header */}
      <Header onInstall={handleInstallApp} showInstall={true} />

      {/* 2. Sync / Offline Warning banners */}
      <OfflineBanner isOffline={isOffline} queueLength={offlineQueue.length} />
      
      {syncToast && (
        <div className="sync-toast">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 2s linear infinite' }}>
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>{syncToast}</span>
        </div>
      )}

      {/* 3. Main Body Context */}
      <main className="app-container" style={{ flex: 1 }}>



        {metadataLoading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
            </svg>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Loading data from database...</p>
          </div>
        )}

        {!metadataLoading && (
          <form onSubmit={handleSubmit}>
            {/* PWA Install Banner — desktop only, hidden on mobile */}
            <div
              className="card pwa-banner pwa-install-banner pwa-form-banner"
              style={{
                background: 'linear-gradient(135deg, #1c1c1e 0%, #2a2a2e 100%)',
                color: '#ffffff',
                padding: '1.25rem 1.75rem',
                borderRadius: '16px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                borderLeft: '5px solid var(--brand-red)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    backgroundColor: 'rgba(230, 0, 0, 0.15)',
                    borderRadius: '10px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid rgba(230, 0, 0, 0.3)'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red)" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, margin: 0, letterSpacing: '0.2px' }}>
                    Download Official Evaluation App
                  </h3>
                  <p className="pwa-banner-desc" style={{ fontSize: '0.82rem', color: '#a0a0a5', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                    Install as a PWA for offline scoring and faster load times.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleInstallApp}
                className="btn pwa-install-btn"
                style={{
                  backgroundColor: 'var(--brand-red)',
                  color: '#ffffff',
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  borderRadius: '10px',
                  boxShadow: '0 4px 10px rgba(230, 0, 0, 0.3)',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  width: 'auto'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-red-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-red)'}
              >
                Install App
              </button>
            </div>

            {/* Top Selector dropdown card */}
            <SelectionCard
              houses={houses}
              selectedHouse={selectedHouse}
              setSelectedHouse={setSelectedHouse}
              teams={teams}
              selectedTeam={selectedTeam}
              setSelectedTeam={setSelectedTeam}
              juries={juries}
              selectedJury={selectedJury}
              setSelectedJury={setSelectedJury}
            />

            <CriteriaList
              criteria={criteria}
              selectedScores={scores}
              onScoreChange={handleScoreChange}
            />

            {/* Submission triggers */}
            <div className="button-row">
              <button
                type="button"
                className="btn btn-dark"
                onClick={handleResetForm}
                disabled={loading}
              >
                Clear
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Styled Footer */}
      <footer style={{ backgroundColor: 'var(--brand-dark)', color: '#8e8e93', padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
        <p>© 2026 GenAI Hackathon. Authorized Jury Scoring Platform. Powered by IBM Consulting Advantage (ICA).</p>
      </footer>

      {/* Popup Modal */}
      {alert && (
        <div className="modal-overlay" onClick={() => setAlert(null)}>
          <div className={`modal-card modal-card--${alert.type}`} onClick={(e) => e.stopPropagation()}>

            {/* Confetti dots — success only */}
            {alert.type === 'success' && (
              <div className="modal-confetti" aria-hidden="true">
                {[...Array(12)].map((_, i) => (
                  <span key={i} className={`confetti-dot confetti-dot--${i}`} />
                ))}
              </div>
            )}

            {/* Animated ring + icon */}
            <div className={`modal-ring modal-ring--${alert.type}`}>
              <div className="modal-ring-inner">
                {alert.type === 'success' ? (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : alert.type === 'error' ? (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="modal-title">
              {alert.type === 'success' ? 'Score Submitted!' : alert.type === 'error' ? 'Submission Failed' : 'Note'}
            </h3>

            {/* Message */}
            <p className="modal-message">{alert.message}</p>

            {/* Success detail chips */}
            {alert.type === 'success' && (
              <div className="modal-chips">
                <span className="modal-chip modal-chip--green">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Recorded in DB
                </span>
                <span className="modal-chip modal-chip--blue">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Score saved
                </span>
              </div>
            )}

            {/* Action button */}
            <button className={`modal-action modal-action--${alert.type}`} onClick={() => setAlert(null)}>
              {alert.type === 'success' ? 'Done' : 'Dismiss'}
            </button>

          </div>
        </div>
      )}

      {/* 📥 Custom Visual PWA Installation Guide Modal */}
      {showInstallModal && (
        <div className="modal-overlay" onClick={() => setShowInstallModal(false)}>
          <div 
            className="modal-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '480px', 
              padding: '2.25rem 2rem',
              borderRadius: '24px',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="modal-title" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                Install Scoring App
              </h3>
              <button 
                onClick={() => setShowInstallModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  fontWeight: '500',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>

            {/* Platform Selection Tabs */}
            <div style={{ display: 'flex', backgroundColor: '#f2f2f7', borderRadius: '12px', padding: '3px', marginBottom: '1.5rem', gap: '2px' }}>
              {[
                { key: 'desktop', label: 'Laptop / PC' },
                { key: 'ios', label: 'iPhone (Safari)' },
                { key: 'android', label: 'Android' },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveInstallTab(tab.key)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.25rem',
                    borderRadius: '10px',
                    border: 'none',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    backgroundColor: activeInstallTab === tab.key ? '#ffffff' : 'transparent',
                    color: activeInstallTab === tab.key ? 'var(--brand-blue)' : 'var(--text-secondary)',
                    boxShadow: activeInstallTab === tab.key ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeInstallTab === 'desktop' && (
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Install on your laptop or desktop using Chrome or Edge in two ways:
                </p>
                <div style={{ background: '#f0f4ff', border: '1px solid #b8d4ff', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-blue)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Method 1 — Address Bar (Fastest)</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    Look for the <strong>install icon</strong> <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 5px', background: '#e8f0fe', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-blue)' }}>⊕</span> in the browser address bar (far right). Click it, then click <strong>Install</strong>.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { n: 1, text: <>Open this page in <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.</> },
                    { n: 2, text: <>Click the <strong>three-dot menu</strong> (⋮) at the top-right of the browser.</> },
                    { n: 3, text: <>Select <strong>"Install GenAI Hackathon…"</strong> or <strong>"Install App"</strong> from the menu.</> },
                    { n: 4, text: <>Click <strong>Install</strong> in the dialog. The app opens as a standalone window.</> },
                  ].map(({ n, text }) => (
                    <div key={n} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ backgroundColor: 'var(--blue-tint-bg)', color: 'var(--brand-blue)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8rem', fontWeight: 800 }}>{n}</div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeInstallTab === 'ios' && (
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Apple iOS requires manual installation via Safari:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { n: 1, text: <>Open this portal in <strong>Safari</strong> (not Chrome or Firefox).</> },
                    { n: 2, text: <>Tap the <strong>Share button</strong> <span style={{ display: 'inline-flex', padding: '2px 4px', backgroundColor: '#f2f2f7', borderRadius: '4px', verticalAlign: 'middle' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg></span> in Safari's bottom toolbar.</> },
                    { n: 3, text: <>Scroll down and choose <strong>Add to Home Screen</strong>.</> },
                    { n: 4, text: <>Tap <strong>Add</strong> in the top-right corner.</> },
                  ].map(({ n, text }) => (
                    <div key={n} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ backgroundColor: 'var(--blue-tint-bg)', color: 'var(--brand-blue)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8rem', fontWeight: 800 }}>{n}</div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeInstallTab === 'android' && (
              <div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  Install using Chrome on your Android device:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { n: 1, text: <>Open this website in <strong>Google Chrome</strong>.</> },
                    { n: 2, text: <>Tap the <strong>options menu</strong> <span style={{ display: 'inline-flex', padding: '2px 4px', backgroundColor: '#f2f2f7', borderRadius: '4px', verticalAlign: 'middle' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></span> at the top-right.</> },
                    { n: 3, text: <>Select <strong>Add to Home Screen</strong> or <strong>Install App</strong>.</> },
                    { n: 4, text: <>Tap <strong>Install</strong> to confirm.</> },
                  ].map(({ n, text }) => (
                    <div key={n} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ backgroundColor: 'var(--blue-tint-bg)', color: 'var(--brand-blue)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8rem', fontWeight: 800 }}>{n}</div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              className="modal-btn success" 
              onClick={() => setShowInstallModal(false)}
              style={{ marginTop: '1.75rem', width: '100%' }}
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline HSL translation helper
function varColor(cssVarName) {
  if (cssVarName === '--success') return '#24a148';
  if (cssVarName === '--error') return '#da1e28';
  if (cssVarName === '--brand-blue') return '#0f62fe';
  return '#1c1c1e';
}
