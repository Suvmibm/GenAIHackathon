import React, { useState, useMemo, useRef, useEffect } from 'react';

function TeamSelect({ teams, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const selected = teams.find(t => t.id === parseInt(value));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? teams.filter(t => t.name.toLowerCase().includes(q)) : teams;
  }, [teams, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setSearch('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (team) => {
    onChange(team.id.toString());
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="team-combobox" ref={wrapperRef}>
      {/* Trigger button */}
      <button
        type="button"
        className={`team-combobox-trigger ${open ? 'team-combobox-trigger--open' : ''} ${selected ? 'team-combobox-trigger--selected' : ''}`}
        onClick={handleOpen}
      >
        <span className="team-combobox-value">
          {selected ? selected.name : <span className="team-combobox-placeholder">-- Select Team --</span>}
        </span>
        <span className="team-combobox-icons">
          {selected && (
            <span className="team-combobox-clear" onMouseDown={handleClear}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </span>
          )}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="team-combobox-dropdown">
          {/* Search inside dropdown */}
          <div className="team-combobox-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="team-combobox-search-input"
              placeholder="Search team..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="team-combobox-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Options list */}
          <div className="team-combobox-list">
            {filtered.length === 0 ? (
              <div className="team-combobox-empty">No teams found</div>
            ) : (
              filtered.map(team => (
                <div
                  key={team.id}
                  className={`team-combobox-option ${team.id === parseInt(value) ? 'team-combobox-option--selected' : ''}`}
                  onMouseDown={() => handleSelect(team)}
                >
                  {team.id === parseInt(value) && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {team.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SelectionCard({
  houses, selectedHouse, setSelectedHouse,
  teams, selectedTeam, setSelectedTeam,
  juries, selectedJury, setSelectedJury,
  disabledJury = false
}) {
  const [isOpen, setIsOpen] = useState(true);

  const derivedHouse = useMemo(() => {
    if (!selectedTeam) return null;
    const t = teams.find(t => t.id === parseInt(selectedTeam));
    if (!t) return null;
    return houses.find(h => h.id === t.house_id) || null;
  }, [selectedTeam, teams, houses]);

  const handleTeamChange = (teamId) => {
    setSelectedTeam(teamId);
    const matched = teams.find(t => t.id === parseInt(teamId));
    setSelectedHouse(matched ? matched.house_id.toString() : '');
  };

  return (
    <div className="card selector-card">
      <div className="selector-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="selector-title">Jury &amp; Team Selection</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`selector-chevron ${isOpen ? 'open' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {isOpen && (
        <div className="selector-body">
          <div className="selector-grid-mobile">

            {/* Row 1: Team (searchable) + House (read-only) */}
            <div className="selector-row-top">

              <div className="select-group">
                <label>Select Team</label>
                <TeamSelect teams={teams} value={selectedTeam} onChange={handleTeamChange} />
              </div>

              <div className="select-group">
                <label>House</label>
                <div className={`house-display ${derivedHouse ? 'house-display--filled' : ''}`}>
                  {derivedHouse ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      {derivedHouse.name}
                    </>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.82rem' }}>Auto-filled on team select</span>
                  )}
                </div>
              </div>

            </div>

            {/* Row 2: Judge / Jury */}
            <div className="select-group selector-jury-row">
              <label htmlFor="jury-select">Judge / Jury Name</label>
              <select
                id="jury-select"
                className="select-control"
                value={selectedJury}
                onChange={e => setSelectedJury(e.target.value)}
                disabled={disabledJury}
                style={disabledJury ? { 
                  backgroundColor: '#f3f4f6', 
                  cursor: 'not-allowed', 
                  opacity: 0.85, 
                  color: 'var(--text-primary)', 
                  fontWeight: 600,
                  backgroundImage: 'none',
                  paddingRight: '0.85rem'
                } : {}}
              >
                <option value="">-- Select Judge --</option>
                {juries.map(jury => (
                  <option key={jury.id} value={jury.id}>{jury.name}</option>
                ))}
              </select>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
