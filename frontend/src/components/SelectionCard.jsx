import React, { useState } from 'react';

export default function SelectionCard({
  houses,
  selectedHouse,
  setSelectedHouse,
  teams,
  selectedTeam,
  setSelectedTeam,
  juries,
  selectedJury,
  setSelectedJury
}) {
  const [isOpen, setIsOpen] = useState(true);

  // Filter teams by selected house
  const filteredTeams = selectedHouse
    ? teams.filter(team => team.house_id === parseInt(selectedHouse))
    : teams;

  return (
    <div className="card selector-card">
      {/* Accordion Header */}
      <div className="selector-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="selector-title">Jury &amp; Team Selection</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--brand-blue)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`selector-chevron ${isOpen ? 'open' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Collapsible Dropdown Content */}
      {isOpen && (
        <div className="selector-body">
          <div className="selector-grid-mobile">

            {/* Row 1: House + Team side by side */}
            <div className="selector-row-top">
              <div className="select-group">
                <label htmlFor="house-select">Select House</label>
                <select
                  id="house-select"
                  className="select-control"
                  value={selectedHouse}
                  onChange={(e) => {
                    setSelectedHouse(e.target.value);
                    setSelectedTeam('');
                  }}
                >
                  <option value="">Select</option>
                  {houses.map(house => (
                    <option key={house.id} value={house.id}>{house.name}</option>
                  ))}
                </select>
              </div>

              <div className="select-group">
                <label htmlFor="team-select">Select Team</label>
                <select
                  id="team-select"
                  className="select-control"
                  value={selectedTeam}
                  onChange={(e) => {
                    const teamId = e.target.value;
                    setSelectedTeam(teamId);
                    if (teamId && !selectedHouse) {
                      const matchedTeam = teams.find(t => t.id === parseInt(teamId));
                      if (matchedTeam) setSelectedHouse(matchedTeam.house_id.toString());
                    }
                  }}
                >
                  <option value="">Select</option>
                  {filteredTeams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Judge / Jury full width */}
            <div className="select-group selector-jury-row">
              <label htmlFor="jury-select">Select Judge / Jury</label>
              <select
                id="jury-select"
                className="select-control"
                value={selectedJury}
                onChange={(e) => setSelectedJury(e.target.value)}
              >
                <option value="">Select</option>
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
