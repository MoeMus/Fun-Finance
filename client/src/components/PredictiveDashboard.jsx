import React, { useState, useEffect } from 'react';
import EventImpactCard from './EventImpactCard';
import FinanceDragon from './FinanceDragon';
import BurnRateChart from './BurnRateChart';
import './PredictiveDashboard.css';

const PredictiveDashboard = () => {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({
    totalPredicted: 0,
    status: 'under',
    causalInsight: 'Analyzing your habits...',
    dragonMood: 'happy',
    dragonSize: 'baby'
  });
  const [loading, setLoading] = useState(true);

  const initialCalendarData = [
    { id: 1, title: "Study Group @ Starbucks", type: "social", date: "2026-03-01" },
    { id: 2, title: "Gym Session", type: "health", date: "2026-03-02" },
    { id: 3, title: "Team Lunch - Sushi", type: "work", date: "2026-03-03" },
    { id: 4, title: "Grocery Run", type: "errands", date: "2026-03-04" },
    { id: 5, title: "Night Out with Friends", type: "social", date: "2026-03-06" }
  ];

  useEffect(() => {
    const fetchAIAnalysis = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/calendar/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: initialCalendarData })
        });
        const data = await response.json();
        
        if (data.events) setEvents(data.events);
        if (data.summary) setSummary(data.summary);
      } catch (error) {
        console.error("Failed to fetch Gemini analysis:", error);
        setEvents(initialCalendarData.map(e => ({ ...e, predictedCost: 0, risk: 'low' })));
      } finally {
        setLoading(false);
      }
    };

    fetchAIAnalysis();
  }, []);

  if (loading) return <div className="loading-state">Consulting the Finance Dragon...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-text">
          <h1>DragonVault</h1>
          <p className="subtitle">Gemini 3 Behavioral Analysis</p>
        </div>
        <div className={`burn-indicator ${summary.status}`}>
          <span className="burn-label">Weekly Predicted</span>
          <span className="burn-amount">${(summary.totalPredicted || 0).toFixed(2)}</span>
        </div>
      </header>

      <div className="dragon-section">
        <FinanceDragon mood={summary.dragonMood} size={summary.dragonSize} />
        <div className="insight-bubble">
          <p>✨ <strong>Dragon Insight:</strong> {summary.causalInsight}</p>
        </div>
      </div>

      <BurnRateChart events={events} budget={150} />

      <section className="events-list">
        <h3>Upcoming Spending Triggers</h3>
        {events.map(event => (
          <EventImpactCard key={event.id || Math.random()} event={event} />
        ))}
      </section>
    </div>
  );
};

export default PredictiveDashboard;
