import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const API_BASE = import.meta.env.VITE_API_URL;

const CRITERIA_SHORT = [
  'Business Relevance',
  'AI Solution',
  'UX & Adoption',
  'Scalability',
  'Innovation',
];

export default function ResultsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [subRes, lbRes, crRes] = await Promise.all([
        fetch(`${API_BASE}/submissions/detail`),
        fetch(`${API_BASE}/leaderboard`),
        fetch(`${API_BASE}/criteria`),
      ]);
      const [subData, lbData, crData] = await Promise.all([
        subRes.json(),
        lbRes.json(),
        crRes.json(),
      ]);
      setSubmissions(Array.isArray(subData) ? subData : []);
      setLeaderboard(Array.isArray(lbData) ? lbData : []);
      setCriteria(Array.isArray(crData) ? crData : []);
      setLastRefresh(new Date());
    } catch (e) {
      setError('Failed to load results. Check backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Protect `/resultVIIBM8651` — only accessible by logged-in Superadmin
    const savedSession = localStorage.getItem('jury_session');
    if (!savedSession) {
      window.location.href = '/';
      return;
    }
    try {
      const parsedUser = JSON.parse(savedSession);
      if (parsedUser.role !== 'superadmin') {
        window.location.href = '/';
        return;
      }
    } catch (err) {
      window.location.href = '/';
      return;
    }

    fetchData();
  }, []);

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Leaderboard Summary ──
    const lbRows = [
      ['Rank', 'Team', 'House', 'Judges Voted', 'Total Score', 'Avg Score'],
      ...leaderboard.map((t, i) => [
        i + 1, t.teamName, t.houseName, t.evaluationsCount, t.totalScore, t.averageScore,
      ]),
    ];
    const lbSheet = XLSX.utils.aoa_to_sheet(lbRows);
    lbSheet['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, lbSheet, 'Leaderboard');

    // ── Sheet 2: Detailed Scores (one row per judge per team) ──
    const detailHeader = [
      'House', 'Team', 'Judge',
      ...criteria.map((c, i) => `Q${i + 1} - ${c.category}`),
      'Total', 'Avg',
    ];
    const detailRows = [detailHeader];
    submissions.forEach(sub => {
      const row = [
        sub.houseName, sub.teamName, sub.juryName,
        ...criteria.map(cr => {
          const s = sub.scores.find(x => x.criterionId === cr.id);
          return s ? s.score : '';
        }),
        sub.totalScore,
        sub.averageScore,
      ];
      detailRows.push(row);
    });
    const detailSheet = XLSX.utils.aoa_to_sheet(detailRows);
    detailSheet['!cols'] = [
      { wch: 12 }, { wch: 30 }, { wch: 22 },
      ...criteria.map(() => ({ wch: 22 })),
      { wch: 8 }, { wch: 8 },
    ];
    XLSX.utils.book_append_sheet(wb, detailSheet, 'Detailed Scores');

    // ── Sheet 3: Per-Team Avg per Criterion ──
    const avgHeader = ['House', 'Team', ...criteria.map((c, i) => `Q${i + 1} - ${c.category}`), 'Overall Avg'];
    const avgRows = [avgHeader];
    leaderboard.forEach(t => {
      const teamSubs = submissions.filter(s => s.teamId === t.teamId);
      const critAvgs = criteria.map(cr => {
        const vals = teamSubs.flatMap(s => s.scores.filter(x => x.criterionId === cr.id).map(x => x.score));
        return vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : '';
      });
      avgRows.push([t.houseName, t.teamName, ...critAvgs, t.averageScore]);
    });
    const avgSheet = XLSX.utils.aoa_to_sheet(avgRows);
    avgSheet['!cols'] = [{ wch: 12 }, { wch: 30 }, ...criteria.map(() => ({ wch: 22 })), { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, avgSheet, 'Team Averages');

    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `GenAI_Hackathon_Results_${date}.xlsx`);
  };

  // Group submissions by team
  const teamMap = {};
  submissions.forEach(sub => {
    if (!teamMap[sub.teamId]) {
      teamMap[sub.teamId] = {
        teamId: sub.teamId,
        teamName: sub.teamName,
        houseName: sub.houseName,
        juryScores: [],
      };
    }
    teamMap[sub.teamId].juryScores.push(sub);
  });

  const teams = Object.values(teamMap).sort((a, b) => {
    const lbA = leaderboard.find(t => t.teamId === a.teamId);
    const lbB = leaderboard.find(t => t.teamId === b.teamId);
    return (lbB?.averageScore ?? 0) - (lbA?.averageScore ?? 0);
  });

  const rankColors = ['#f59e0b', '#94a3b8', '#b45309'];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4fa', fontFamily: 'var(--font-body, system-ui)' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        padding: '1.5rem 1.5rem 1.2rem',
        color: 'white',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', opacity: 0.75, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              GenAI Hackathon 2026
            </div>
            <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
              Jury Scoring Results
            </h1>
            <p style={{ margin: '0.3rem 0 0', opacity: 0.8, fontSize: '0.83rem' }}>
              {lastRefresh ? `Last updated ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={fetchData}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 10,
                color: 'white',
                padding: '0.55rem 1.1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              {loading ? 'Refreshing...' : '↻ Refresh'}
            </button>
            <button
              onClick={downloadExcel}
              disabled={loading || submissions.length === 0}
              style={{
                background: submissions.length === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(34,197,94,0.85)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 10,
                color: 'white',
                padding: '0.55rem 1.1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: (loading || submissions.length === 0) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Excel
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.25rem 1rem 3rem' }}>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '1rem 1.25rem', color: '#b91c1c', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {/* ── LEADERBOARD SUMMARY ── */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.85rem' }}>
            Overall Leaderboard
          </h2>
          {loading && leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading...</div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No submissions yet.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {leaderboard.map((team, i) => (
                <div key={team.teamId} style={{
                  background: 'white',
                  borderRadius: 14,
                  padding: '1rem 1.1rem',
                  boxShadow: i < 3 ? '0 4px 16px rgba(37,99,235,0.13)' : '0 1px 4px rgba(0,0,0,0.07)',
                  border: i < 3 ? `2px solid ${rankColors[i]}` : '1px solid #e8edf5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: i < 3 ? rankColors[i] : '#f1f5f9',
                    color: i < 3 ? (i === 1 ? '#1c1c1e' : 'white') : '#475569',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: '1rem',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {team.teamName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 1 }}>{team.houseName}</div>
                    <div style={{ marginTop: '0.3rem', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 900, fontSize: '1.15rem', color: '#2563eb' }}>{team.averageScore.toFixed(2)}</span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>avg · {team.evaluationsCount} votes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── PER TEAM DETAIL ── */}
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.85rem' }}>
            Detailed Jury Scores by Team
          </h2>

          {loading && teams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading...</div>
          ) : teams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No submissions yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {teams.map((team, ti) => {
                const lbEntry = leaderboard.find(t => t.teamId === team.teamId);
                const rank = leaderboard.findIndex(t => t.teamId === team.teamId) + 1;

                // Compute per-criterion avg across all juries for this team
                const critAvgs = criteria.map(cr => {
                  const allScores = team.juryScores.flatMap(sub =>
                    sub.scores.filter(s => s.criterionId === cr.id).map(s => s.score)
                  );
                  const avg = allScores.length ? (allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;
                  return { ...cr, avg };
                });

                return (
                  <div key={team.teamId} style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden', border: '1px solid #e8edf5' }}>

                    {/* Team Header */}
                    <div style={{
                      background: 'linear-gradient(90deg, #1e3a8a, #2563eb)',
                      padding: '0.85rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      flexWrap: 'wrap',
                    }}>
                      {rank > 0 && (
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: rank <= 3 ? rankColors[rank - 1] : 'rgba(255,255,255,0.2)',
                          color: rank === 2 ? '#1c1c1e' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: '0.85rem',
                        }}>#{rank}</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.2px' }}>{team.teamName}</div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{team.houseName}</div>
                      </div>
                      {lbEntry && (
                        <div style={{ textAlign: 'right', color: 'white' }}>
                          <div style={{ fontWeight: 900, fontSize: '1.4rem', lineHeight: 1 }}>{lbEntry.averageScore.toFixed(2)}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>avg score · {lbEntry.evaluationsCount} judges</div>
                        </div>
                      )}
                    </div>

                    {/* Scrollable table */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e8edf5' }}>
                            <th style={{ padding: '0.65rem 1rem', textAlign: 'left', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', minWidth: 160 }}>
                              Judge
                            </th>
                            {criteria.map((cr, ci) => (
                              <th key={cr.id} style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', minWidth: 90 }}>
                                <div style={{ color: '#2563eb', fontSize: '0.75rem' }}>Q{ci + 1}</div>
                                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>{CRITERIA_SHORT[ci]}</div>
                              </th>
                            ))}
                            <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#1e3a8a', whiteSpace: 'nowrap', minWidth: 70, background: '#eff6ff' }}>
                              Total
                            </th>
                            <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#1e3a8a', whiteSpace: 'nowrap', minWidth: 60, background: '#eff6ff' }}>
                              Avg
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {team.juryScores.map((sub, si) => {
                            const total = sub.totalScore;
                            const avg = sub.averageScore;
                            return (
                              <tr key={sub.submissionId} style={{ borderBottom: '1px solid #f1f5f9', background: si % 2 === 0 ? 'white' : '#fafbfd' }}>
                                <td style={{ padding: '0.6rem 1rem', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
                                  {sub.juryName}
                                </td>
                                {criteria.map(cr => {
                                  const s = sub.scores.find(x => x.criterionId === cr.id);
                                  const score = s ? s.score : null;
                                  const bg = score === null ? '#f8fafc' : score >= 4 ? '#dcfce7' : score === 3 ? '#fef9c3' : '#fee2e2';
                                  const col = score === null ? '#cbd5e1' : score >= 4 ? '#15803d' : score === 3 ? '#a16207' : '#b91c1c';
                                  return (
                                    <td key={cr.id} style={{ padding: '0.6rem 0.75rem', textAlign: 'center', background: bg, color: col, fontWeight: 700, fontSize: '0.9rem' }}>
                                      {score ?? '–'}
                                    </td>
                                  );
                                })}
                                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 800, color: '#1e3a8a', background: '#eff6ff', fontSize: '0.9rem' }}>
                                  {total}
                                </td>
                                <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#2563eb', background: '#eff6ff', fontSize: '0.85rem' }}>
                                  {avg.toFixed(1)}
                                </td>
                              </tr>
                            );
                          })}

                          {/* Average row */}
                          <tr style={{ borderTop: '2px solid #2563eb', background: '#eff6ff' }}>
                            <td style={{ padding: '0.65rem 1rem', fontWeight: 800, color: '#1e3a8a', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                              AVG (all judges)
                            </td>
                            {critAvgs.map(cr => (
                              <td key={cr.id} style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 800, color: '#1e3a8a', fontSize: '0.9rem' }}>
                                {cr.avg !== null ? cr.avg.toFixed(2) : '–'}
                              </td>
                            ))}
                            <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 900, color: '#1e3a8a', fontSize: '1rem' }}>
                              {lbEntry ? lbEntry.totalScore : '–'}
                            </td>
                            <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 900, color: '#2563eb', fontSize: '1rem' }}>
                              {lbEntry ? lbEntry.averageScore.toFixed(2) : '–'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
