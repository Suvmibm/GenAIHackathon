import React from 'react';

export default function OfflineBanner({ isOffline, queueLength }) {
  if (!isOffline && queueLength === 0) return null;

  return (
    <div style={{ position: 'sticky', top: '74px', zIndex: 99 }}>
      {isOffline && (
        <div className="offline-banner">
          <div className="offline-pulse"></div>
          <span>
            <strong>Working Offline</strong> — No connection. {queueLength > 0 ? `${queueLength} evaluations queued. ` : 'Evaluation ready. '} 
            They will automatically sync when connection returns!
          </span>
        </div>
      )}
    </div>
  );
}
