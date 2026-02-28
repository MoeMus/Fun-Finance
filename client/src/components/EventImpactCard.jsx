import React from 'react';
import './EventImpactCard.css';

const EventImpactCard = ({ event }) => {
  if (!event) return null;

  const getRiskClass = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'risk-high';
      case 'medium': return 'risk-medium';
      case 'low': return 'risk-low';
      default: return 'risk-low';
    }
  };

  const cost = Number(event.predictedCost) || 0;
  const eventDate = event.date ? new Date(event.date).toLocaleDateString() : 'TBD';

  return (
    <div className={`event-card ${getRiskClass(event.risk)}`}>
      <div className="event-info">
        <h3 className="event-title">{event.title || 'Untitled Event'}</h3>
        <p className="event-type">{(event.type || 'Activity').toUpperCase()}</p>
        {event.savingTip && <p className="saving-tip">💡 {event.savingTip}</p>}
      </div>
      <div className="event-financials text-right">
        <span className="predicted-cost">
          ${cost.toFixed(2)}
        </span>
        <span className="event-date">{eventDate}</span>
      </div>
    </div>
  );
};

export default EventImpactCard;
