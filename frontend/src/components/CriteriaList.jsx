import React from 'react';
import CriterionRow from './CriterionRow';

export default function CriteriaList({ criteria, selectedScores, onScoreChange }) {
  return (
    <div className="criteria-container">
      {criteria.map(criterion => (
        <CriterionRow
          key={criterion.id}
          criterion={criterion}
          selectedScore={selectedScores[criterion.id] || null}
          onChange={onScoreChange}
        />
      ))}
    </div>
  );
}
