import React from 'react';
import './BurnRateChart.css';

const BurnRateChart = ({ events, budget }) => {
  // Group events by date and calculate total cost per day
  const dailyTotals = events.reduce((acc, event) => {
    const date = new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' });
    acc[date] = (acc[date] || 0) + (Number(event.predictedCost) || 0);
    return acc;
  }, {});

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxCost = Math.max(...Object.values(dailyTotals), budget / 7, 50);

  return (
    <div className="burn-chart-container">
      <div className="chart-header">
        <h3>Weekly Burn Forecast</h3>
        <span className="budget-line-label">Budget: ${budget}</span>
      </div>
      <div className="chart-bars">
        {days.map(day => {
          const cost = dailyTotals[day] || 0;
          const height = (cost / maxCost) * 100;
          return (
            <div key={day} className="chart-column">
              <div className="bar-wrapper">
                <div 
                  className={`bar ${cost > (budget/7) ? 'over' : 'under'}`} 
                  style={{ height: `${Math.max(5, height)}%` }}
                >
                  {cost > 0 && <span className="bar-value">${cost.toFixed(0)}</span>}
                </div>
              </div>
              <span className="day-label">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BurnRateChart;
