import React from 'react';

// High-fidelity icons matched exactly to the reference image using public folder assets
function renderIcon(iconName) {
  let src = '';
  switch (iconName) {
    case 'idea': // Bulb
      src = '/icons/image 37.png';
      break;
    case 'persona': // Hand with gear and stars
      src = '/icons/image 38-2.png';
      break;
    case 'benefit': // Woman with bulb and check
      src = '/icons/image 38-1.png';
      break;
    case 'scalability': // Cube with arrows
      src = '/icons/image 38-3.png';
      break;
    case 'qa': // Head with gear
      src = '/icons/image 38.png';
      break;
    default:
      src = '/icons/image 37.png'; // Fallback
      break;
  }
  
  return (
    <img 
      src={src} 
      alt={`${iconName} icon`} 
      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
    />
  );
}

export default function CriterionRow({ criterion, selectedScore, onChange }) {
  const scores = ['01', '02', '03', '04', '05'];

  return (
    <div className="card criterion-card">
      <div className="criterion-info">
        {/* Left Icon */}
        <div className="criterion-icon-wrapper">
          {renderIcon(criterion.icon)}
        </div>
        {/* Question Text */}
        <div className="criterion-question">
          {criterion.question}
        </div>
      </div>

      {/* Right Shield Scores */}
      <div className="shield-rating-group">
        {scores.map(numStr => {
          const scoreVal = parseInt(numStr);
          const isSelected = selectedScore === scoreVal;

          return (
            <button
              key={numStr}
              type="button"
              className={`shield-button ${isSelected ? 'selected' : ''}`}
              onClick={() => onChange(criterion.id, scoreVal)}
              aria-label={`Rate ${scoreVal} out of 5 for criterion ${criterion.id}`}
            >
              {/* Custom High-Fidelity SVG Shield vector shape */}
              <svg className="shield-svg" viewBox="0 0 100 115" xmlns="http://www.w3.org/2000/svg">
                {/* Mathematical premium shield curve */}
                <path d="M50 2 C50 2 95 12 95 12 C95 12 95 65 50 112 C5 65 5 12 5 12 C5 12 50 2 50 2 Z" />
              </svg>
              {/* Displaying '01', '02', etc. inside the shield */}
              <span className="shield-text">{numStr}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
