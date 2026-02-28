import React from 'react';
import './EventImpactCard.css';

const EventImpactCard = ({ event }) => {
  const getRiskClass = (risk) => {
    switch (risk) {
      case 'high': return 'risk-high';
      case 'medium': return 'risk-medium';
      default: return 'risk-low';
    }
  };

  return (
    <div className={`event-card ${getRiskClass(event.risk)}`}>
      <div className="event-info">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-type">{event.type.toUpperCase()}</p>
        {event.savingTip && <p className="saving-tip">💡 {event.savingTip}</p>}
      </div>
      <div className="event-financials text-right">
        <span className="predicted-cost">
          ${event.predictedCost.toFixed(2)}
        </span>
        <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default EventImpactCard;
