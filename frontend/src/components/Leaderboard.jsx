import React, { useState } from 'react';

export default function Leaderboard({ standings, onRefresh, loading }) {
  const [expandedTeamId, setExpandedTeamId] = useState(null);

  const toggleExpand = (teamId) => {
    setExpandedTeamId(prev => prev === teamId ? null : teamId);
  };

  const rankColors = {
    1: { bg: '#ffd700', color: '#1c1c1e' },
    2: { bg: '#c0c0c0', color: '#1c1c1e' },
    3: { bg: '#cd7f32', color: '#ffffff' },
  };

  return (
    <div className="card" style={{ padding: '1.5rem', border: '1px solid #efeff2', minHeight: '300px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800 }}>
            Hackathon Live Standings
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Real-time average standings computed from all jury submissions.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={onRefresh}
          disabled={loading}
          style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', flexShrink: 0 }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {standings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-light)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>No evaluations submitted yet.</p>
          <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Completed scores will register here immediately.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {standings.map((team, index) => {
            const rank = index + 1;
            const isExpanded = expandedTeamId === team.teamId;
            const badge = rankColors[rank] || { bg: '#f2f2f7', color: 'var(--text-secondary)' };

            return (
              <div key={team.teamId}>
                {/* Team Card Row */}
                <div
                  onClick={() => toggleExpand(team.teamId)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '44px 1fr auto',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.9rem 1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #efeff2',
                    borderRadius: isExpanded ? '12px 12px 0 0' : '12px',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.15s ease',
                    boxShadow: isExpanded ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  }}
                >
                  {/* Rank Badge */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: badge.bg,
                    color: badge.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    flexShrink: 0,
                  }}>
                    {rank}
                  </div>

                  {/* Team Info */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {team.teamName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                      {team.houseName}
                    </div>
                  </div>

                  {/* Score + Votes + Chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        color: 'var(--brand-blue)',
                      }}>
                        {team.averageScore.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '1px' }}>
                        {team.evaluationsCount} {team.evaluationsCount === 1 ? 'vote' : 'votes'}
                      </div>
                    </div>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="var(--text-light)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transition: 'transform 0.25s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Breakdown Panel */}
                {isExpanded && (
                  <div style={{
                    padding: '1rem 1rem 1.25rem',
                    backgroundColor: '#fbfcfe',
                    borderLeft: '4px solid var(--brand-blue)',
                    borderRight: '1px solid #efeff2',
                    borderBottom: '1px solid #efeff2',
                    borderRadius: '0 0 12px 12px',
                  }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-blue)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                      Itemized Score Breakdown (Averages)
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {team.breakdown && team.breakdown.length > 0 ? (
                        team.breakdown.map(crit => (
                          <div key={crit.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            padding: '0.6rem 0.75rem',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '1px solid #eef1f6',
                            gap: '0.75rem',
                          }}>
                            <span style={{
                              fontSize: '0.82rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.45,
                              flex: 1,
                              wordBreak: 'break-word',
                            }}>
                              {crit.question}
                            </span>
                            <strong style={{
                              fontSize: '0.9rem',
                              color: 'var(--brand-blue)',
                              flexShrink: 0,
                              paddingTop: '1px',
                              minWidth: '2.5rem',
                              textAlign: 'right',
                            }}>
                              {crit.avgScore.toFixed(2)}
                            </strong>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>No itemized stats compiled yet.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
