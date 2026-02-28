import React, { useState, useEffect } from 'react';
import EventImpactCard from './EventImpactCard';
import './PredictiveDashboard.css';

const PredictiveDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialCalendarData = [
    { id: 1, title: "Study Group @ Starbucks", type: "social", date: "2026-03-01" },
    { id: 2, title: "Gym Session", type: "health", date: "2026-03-02" },
    { id: 3, title: "Team Lunch - Sushi", type: "work", date: "2026-03-03" },
    { id: 4, title: "Grocery Run", type: "errands", date: "2026-03-04" }
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
        
        // Ensure data is an array
        const eventsArray = Array.isArray(data) ? data : (data.events || []);
        setEvents(eventsArray);
      } catch (error) {
        console.error("Failed to fetch Gemini analysis:", error);
        setEvents(initialCalendarData.map(e => ({ 
          ...e, 
          predictedCost: 0, 
          risk: 'low', 
          savingTip: "Check your backend connection!" 
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchAIAnalysis();
  }, []);

  const totalPredictedBurn = events.reduce((sum, e) => sum + (Number(e.predictedCost) || 0), 0);

  if (loading) return <div className="loading-state">Consulting the Finance-agotchi...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-text">
          <h1>Financial Outlook</h1>
          <p className="subtitle">Gemini AI Analysis of your next 7 days</p>
        </div>
        <div className="burn-indicator">
          <span className="burn-label">Total Burn</span>
          <span className="burn-amount">${totalPredictedBurn.toFixed(2)}</span>
        </div>
      </header>

      <section className="events-list">
        {events.length > 0 ? (
          events.map(event => (
            <EventImpactCard key={event.id || Math.random()} event={event} />
          ))
        ) : (
          <p className="no-events">No events to analyze. Add some to your calendar!</p>
        )}
      </section>

      <div className="tamagotchi-teaser">
        <p>🐾 Your Finance-agotchi is <strong>{totalPredictedBurn > 50 ? 'sweating' : 'chilling'}</strong> based on your schedule.</p>
      </div>
    </div>
  );
};

export default PredictiveDashboard;
