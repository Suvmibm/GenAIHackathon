import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? `http://${window.location.hostname}:5000/api` : 'http://localhost:5000/api');

const SCORE_COLORS = ['', '#da1e28', '#e67e00', '#f1c21b', '#24a148', '#0f62fe'];

export default function SubmissionsView({ houses, teams, juries }) {
  const [filterHouse, setFilterHouse] = useState('');
  const [filterTeam,  setFilterTeam]  = useState('');
  const [filterJury,  setFilterJury]  = useState('');

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [expandedId, setExpandedId]   = useState(null);
  const [fetched, setFetched]         = useState(false);

  const filteredTeams = filterHouse
    ? teams.filter(t => t.house_id === parseInt(filterHouse))
    : teams;

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterHouse) params.append('house_id', filterHouse);
      if (filterTeam)  params.append('team_id',  filterTeam);
      if (filterJury)  params.append('jury_id',  filterJury);

      const res = await fetch(`${API_BASE}/submissions/detail?${params.toString()}`);
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setSubmissions(data);
      setFetched(true);
    } catch (e) {
      setError('Failed to load submissions. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleHouseChange = (val) => {
    setFilterHouse(val);
    setFilterTeam('');
    setFetched(false);
  };

  const scoreColor = (s) => SCORE_COLORS[s] || '#8e8e93';

  return (
    <div>
      {/* Filter Card */}
      <div className="card selector-card" style={{ padding: 0, marginBottom: '1.25rem' }}>
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#f8fbff',
          borderBottom: '1px solid #ddecff',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-blue)" strokeWidth="2.5">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: 'var(--brand-blue)' }}>
            Filter Submissions
          </span>
        </div>

        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f0f4fa' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            {/* House */}
            <div className="select-group" style={{ width: '100%', maxWidth: '220px' }}>
              <label htmlFor="sf-house">Filter by House</label>
              <select id="sf-house" className="select-control" value={filterHouse}
                onChange={e => handleHouseChange(e.target.value)}>
                <option value="">All Houses</option>
                {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>

            {/* Team */}
            <div className="select-group" style={{ width: '100%', maxWidth: '220px' }}>
              <label htmlFor="sf-team">Filter by Team</label>
              <select id="sf-team" className="select-control" value={filterTeam}
                onChange={e => { setFilterTeam(e.target.value); setFetched(false); }}>
                <option value="">All Teams</option>
                {filteredTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {/* Jury */}
            <div className="select-group" style={{ width: '100%', maxWidth: '220px' }}>
              <label htmlFor="sf-jury">Filter by Jury</label>
              <select id="sf-jury" className="select-control" value={filterJury}
                onChange={e => { setFilterJury(e.target.value); setFetched(false); }}>
                <option value="">All Juries</option>
                {juries.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
            </div>
          </div>

          <button className="btn btn-dark" onClick={fetchSubmissions} disabled={loading}
            style={{ padding: '0.6rem 1.75rem', fontSize: '0.9rem' }}>
            {loading ? 'Loading...' : 'Search Submissions'}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ padding: '1rem', background: '#fde8e9', borderRadius: '12px', color: 'var(--error)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Empty / not fetched yet */}
      {!loading && fetched && submissions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '0.75rem' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p style={{ fontWeight: 600 }}>No submissions found</p>
          <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Try adjusting your filters.</p>
        </div>
      )}

      {!fetched && !loading && (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-light)' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '0.75rem' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
          <p style={{ fontSize: '0.9rem' }}>Select filters and click <strong>Search Submissions</strong></p>
        </div>
      )}

      {/* Results count */}
      {fetched && submissions.length > 0 && (
        <div style={{ marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Submission Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {submissions.map(sub => {
          const isOpen = expandedId === sub.submissionId;
          return (
            <div key={sub.submissionId}>
              {/* Summary Row */}
              <div
                onClick={() => setExpandedId(isOpen ? null : sub.submissionId)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #efeff2',
                  borderRadius: isOpen ? '12px 12px 0 0' : '12px',
                  padding: '0.9rem 1rem',
                  cursor: 'pointer',
                  boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '0.75rem',
                  alignItems: 'center',
                }}
              >
                <div>
                  {/* Jury → Team */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-heading)', fontWeight: 800,
                      fontSize: '0.95rem', color: 'var(--text-primary)'
                    }}>
                      {sub.juryName}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--brand-blue)' }}>
                      {sub.teamName}
                    </span>
                  </div>
                  {/* House tag + date */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                      backgroundColor: '#f0f4fa', color: 'var(--brand-blue)',
                      borderRadius: '100px', border: '1px solid #b8d4ff'
                    }}>
                      {sub.houseName}
                    </span>
                    {sub.submittedAt && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                        {new Date(sub.submittedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score + chevron */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-blue)' }}>
                      {sub.averageScore.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>avg</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="var(--text-light)" strokeWidth="2.5" strokeLinecap="round"
                    style={{ transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {isOpen && (
                <div style={{
                  backgroundColor: '#fbfcfe',
                  borderLeft: '4px solid var(--brand-blue)',
                  borderRight: '1px solid #efeff2',
                  borderBottom: '1px solid #efeff2',
                  borderRadius: '0 0 12px 12px',
                  padding: '1rem',
                }}>
                  {/* Header: total score */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Criterion Scores
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Total: <strong style={{ color: 'var(--brand-blue)' }}>{sub.totalScore}</strong> / {sub.scores.length * 5}
                    </span>
                  </div>

                  {/* Criterion rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {sub.scores.map(sc => (
                      <div key={sc.criterionId} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        padding: '0.55rem 0.75rem', backgroundColor: 'white',
                        borderRadius: '8px', border: '1px solid #eef1f6', gap: '0.75rem'
                      }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, flex: 1, wordBreak: 'break-word' }}>
                          {sc.question}
                        </span>
                        <span style={{
                          fontSize: '0.9rem', fontWeight: 800, flexShrink: 0,
                          color: scoreColor(sc.score),
                          minWidth: '1.5rem', textAlign: 'right'
                        }}>
                          {sc.score}/5
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Comments */}
                  {sub.comments && sub.comments.trim() && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eef1f6' }}>
                      <p style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
                        Jury Comments
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {sub.comments}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
