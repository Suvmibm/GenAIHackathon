import React from 'react';

function renderIcon(iconName) {
  let src = '';
  switch (iconName) {
    case 'idea':        src = '/icons/image 37.png';   break;
    case 'persona':     src = '/icons/image 38-2.png'; break;
    case 'benefit':     src = '/icons/image 38-1.png'; break;
    case 'scalability': src = '/icons/image 38-3.png'; break;
    case 'qa':          src = '/icons/image 38.png';   break;
    default:            src = '/icons/image 37.png';   break;
  }
  return (
    <img src={src} alt={`${iconName} icon`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
  );
}

const LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export default function CriterionRow({ criterion, selectedScore, onChange }) {
  const [hovered, setHovered] = React.useState(0);
  const active = hovered || selectedScore;

  return (
    <div className="card criterion-card">
      {/* Top row: icon + question */}
      <div className="criterion-info">
        <div className="criterion-icon-wrapper">
          {renderIcon(criterion.icon)}
        </div>
        <div className="criterion-question">
          {criterion.question}
        </div>
      </div>

      {/* Star row: indented to align with question text */}
      <div className="star-rating-group">
        <div className="star-row">
          {[1, 2, 3, 4, 5].map(val => {
            const isFilled = val <= (hovered || selectedScore);
            return (
              <button
                key={val}
                type="button"
                className={`star-button${isFilled ? ' star-button--filled' : ''}`}
                onClick={() => onChange(criterion.id, val)}
                onMouseEnter={() => setHovered(val)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`Rate ${val} out of 5`}
                style={{ animationDelay: `${(val - 1) * 0.04}s` }}
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            );
          })}
          {active > 0 && (
            <span className="star-label">{LABELS[active - 1]}</span>
          )}
        </div>
      </div>
    </div>
  );
}
