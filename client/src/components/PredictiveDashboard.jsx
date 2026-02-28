import React, { useState } from 'react';
import EventImpactCard from './EventImpactCard';
import './PredictiveDashboard.css';

const PredictiveDashboard = () => {
  const [events] = useState([
    { 
      id: 1, 
      title: "Study Group @ Starbucks", 
      type: "social", 
      date: "2026-03-01", 
      predictedCost: 12.50, 
      risk: "high" 
    },
    { 
      id: 2, 
      title: "Gym Session", 
      type: "health", 
      date: "2026-03-02", 
      predictedCost: 0, 
      savingTip: "Great! Free activity.",
      risk: "low"
    },
    { 
      id: 3, 
      title: "Team Lunch - Sushi", 
      type: "work", 
      date: "2026-03-03", 
      predictedCost: 25.00, 
      risk: "medium" 
    },
    { 
      id: 4, 
      title: "Grocery Run", 
      type: "errands", 
      date: "2026-03-04", 
      predictedCost: 85.00, 
      risk: "high" 
    }
  ]);

  const totalPredictedBurn = events.reduce((sum, e) => sum + e.predictedCost, 0);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-text">
          <h1>Financial Outlook</h1>
          <p className="subtitle">Predicted spend for the next 7 days</p>
        </div>
        <div className="burn-indicator">
          <span className="burn-label">Total Burn</span>
          <span className="burn-amount">${totalPredictedBurn.toFixed(2)}</span>
        </div>
      </header>

      <section className="events-list">
        {events.map(event => (
          <EventImpactCard key={event.id} event={event} />
        ))}
      </section>

      <div className="tamagotchi-teaser">
        <p>🐾 Your Finance-agotchi is looking <strong>anxious</strong> about that Sushi lunch.</p>
      </div>
    </div>
  );
};

export default PredictiveDashboard;
