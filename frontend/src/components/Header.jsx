import React from 'react';

export default function Header({ onInstall, showInstall }) {
  return (
    <header className="app-header">

      {/* Vi logo from public/vi.ico */}
      <div className="brand-logo-container vi-logo-wrapper">
        <img src="/vi.ico" alt="Vi" style={{ height: '48px', width: 'auto', display: 'block' }} />
      </div>

      {/* Center Hackathon Branding */}
      <div className="brand-text">
        <h1 className="tech-center-title">
          <span className="text-red">GenAI</span>
          <span className="text-dark">HACKATHON</span>
          {/* Small decorative circuit icon after the title */}
          <svg width="16" height="26" viewBox="0 0 16 26" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '3px', flexShrink: 0 }}>
            <line x1="8" y1="0" x2="8" y2="26" stroke="#e21a22" strokeWidth="2" strokeLinecap="round"/>
            <line x1="2" y1="7" x2="14" y2="7" stroke="#e21a22" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="2" cy="7" r="2" fill="#e21a22"/>
            <circle cx="14" cy="7" r="2" fill="#e21a22"/>
            <circle cx="8" cy="0" r="2" fill="#e21a22"/>
            <circle cx="8" cy="26" r="2" fill="#e21a22"/>
          </svg>
        </h1>
        <p className="tech-subtitle">Powered by <strong>IBM Consulting Advantage</strong></p>
      </div>

      {/* Action triggers like PWA Download */}
      {showInstall && (
        <button 
          onClick={onInstall}
          className="download-app-btn"
          style={{
            background: 'linear-gradient(135deg, var(--brand-red) 0%, #ff5252 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            padding: '0.45rem 1.1rem',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(230, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            marginLeft: '1rem',
            outline: 'none',
            fontFamily: 'var(--font-heading)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 15px rgba(230, 0, 0, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 10px rgba(230, 0, 0, 0.25)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="download-text">Download App</span>
        </button>
      )}

      {/* Official IBM 8-Bar blue logo replica */}
      <div className="brand-logo-container ibm-logo-wrapper">
        <svg width="80" height="30" viewBox="0 7.5 24 9" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d="M23.544 15.993c.038 0 .06-.017.06-.053v-.036c0-.035-.022-.052-.06-.052h-.09v.14zm-.09.262h-.121v-.498h.225c.112 0 .169.066.169.157 0 .079-.036.129-.09.15l.111.19h-.133l-.092-.17h-.07zm.434-.222v-.062c0-.2-.157-.357-.363-.357a.355.355 0 00-.363.357v.062c0 .2.156.358.363.358a.355.355 0 00.363-.358zm-.838-.03c0-.28.212-.492.475-.492.264 0 .475.213.475.491 0 .279-.211.491-.475.491a.477.477 0 01-.475-.49zM16.21 8.13l-.216-.624h-3.56v.624zm.413 1.19l-.216-.623h-3.973v.624zm2.65 7.147h3.107v-.624h-3.108zm0-1.192h3.107v-.623h-3.108zm0-1.19h1.864v-.624h-1.865zm0-1.191h1.864v-.624h-1.865zm0-1.191h1.864v-.624h-3.555l-.175.504-.175-.504h-3.555v.624h1.865v-.574l.2.574h3.33l.2-.574zm1.864-1.815h-3.142l-.217.624h3.359zm-7.46 3.006h1.865v-.624h-1.865zm0 1.19h1.865v-.623h-1.865zm-1.243 1.191h3.108v-.623h-3.108zm0 1.192h3.108v-.624h-3.108zm6.386-8.961l-.216.624h3.776v-.624zm-.629 1.815h4.19v-.624h-3.974zm-4.514 1.19h3.359l-.216-.623h-3.143zm2.482 2.383h2.496l.218-.624h-2.932zm.417 1.19h1.662l.218-.623h-2.098zm.416 1.191h.83l.218-.623h-1.266zm.414 1.192l.217-.624h-.432zm-12.433-.006l4.578.006c.622 0 1.18-.237 1.602-.624h-6.18zm4.86-3v.624h2.092c0-.216-.03-.425-.083-.624zm-3.616.624h1.865v-.624H6.217zm3.617-3.573h2.008c.053-.199.083-.408.083-.624H9.834zm-3.617 0h1.865v-.624H6.217zM9.55 7.507H4.973v.624h6.18a2.36 2.36 0 00-1.602-.624zm2.056 1.191H4.973v.624h6.884a2.382 2.382 0 00-.25-.624zm-5.39 2.382v.624h4.87c.207-.176.382-.387.519-.624zm4.87 1.191h-4.87v.624h5.389a2.39 2.39 0 00-.519-.624zm-6.114 3.006h6.634c.11-.193.196-.402.25-.624H4.973zM0 8.13h4.352v-.624H0zm0 1.191h4.352v-.624H0zm1.243 1.191h1.865v-.624H1.243zm0 1.191h1.865v-.624H1.243zm0 1.19h1.865v-.623H1.243zm0 1.192h1.865v-.624H1.243zM0 15.276h4.352v-.623H0zm0 1.192h4.352v-.624H0Z" fill="#0F62FE" />
        </svg>
      </div>
    </header>
  );
}

