import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import CalendarImport from './CalendarImport';
import './CalendarView.css';

const CalendarView = () => {
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();

  const [selectedDay, setSelectedDay] = useState(todayDate);
  const [todaySpending, setTodaySpending] = useState('0.00');
  
  // State for events and imported sources
  const [events, setEvents] = useState([]);
  const [importedSources, setImportedSources] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calculate days in month and starting weekday padding
  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(year, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const paddingCount = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const paddingArray = Array.from({ length: paddingCount }, (_, i) => i);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleImportSuccess = async (newEvents, sourceName) => {
    // Add source to list if not already there
    if (!importedSources.includes(sourceName)) {
      setImportedSources(prev => [...prev, sourceName]);
    }

    // Combine events and analyze with AI
    const combinedEvents = [...events, ...newEvents];
    setLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/calendar/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: combinedEvents })
      });
      const data = await response.json();
      if (data.events) setEvents(data.events);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setEvents(combinedEvents);
    } finally {
      setLoading(false);
    }
  };

  const getEnemyForDay = (day) => {
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === day && eventDate.getMonth() === currentMonth;
    });
    if (dayEvents.length === 0) return null;
    
    const totalCost = dayEvents.reduce((sum, e) => sum + (Number(e.predictedCost) || 0), 0);
    if (totalCost > 100) return 'XL';
    if (totalCost > 50) return 'Large';
    if (totalCost > 20) return 'Medium';
    return 'Small';
  };

  return (
    <div className="calendar-page-container">
      <Navbar />
      <div className="calendar-main-card">
        {/* Left Side: The Grid */}
        <div className="calendar-grid-section">
          <div className="calendar-header-actions">
            <h2 className="month-title">{monthName} {year}</h2>
            
            <div className="import-controls">
              {importedSources.length > 0 && (
                <div className="sources-list">
                  {importedSources.map(s => <span key={s} className="source-badge">{s}</span>)}
                </div>
              )}
              <CalendarImport onImportSuccess={handleImportSuccess} />
            </div>
          </div>

          <div className="grid-header">
            {weekDays.map(d => <div key={d} className="weekday-label">{d}</div>)}
          </div>
          <div className="calendar-grid">
            {paddingArray.map(p => (
              <div key={`pad-${p}`} className={`calendar-tile padding-tile day-${p + 1}`}></div>
            ))}
            
            {daysArray.map(day => {
              const dow = ((paddingCount + day - 1) % 7) + 1;
              const enemy = getEnemyForDay(day);
              const isToday = day === todayDate;
              const isPast = day < todayDate;

              return (
                <div 
                  key={day} 
                  className={`calendar-tile day-${dow} ${isToday ? 'today' : ''} ${selectedDay === day ? 'selected' : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <span className="day-number">{day}</span>
                  <div className="tile-content">
                    {isPast && <span className="status-icon success"></span>}
                    {isToday && <span className="dragon-icon">🐲</span>}
                    {!isPast && !isToday && enemy && (
                      <span className={`enemy-icon ${enemy.toLowerCase()}`}>
                        {enemy === 'Small' && '👾'}
                        {enemy === 'Medium' && '👹'}
                        {enemy === 'Large' && '👻'}
                        {enemy === 'XL' && '💀'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Details Sidebar */}
        <div className="calendar-details-sidebar">
          <h2 className="selected-date">{monthName.substring(0, 3)}. {selectedDay}th</h2>
          
          <div className="day-tasks">
            <p className="sidebar-label">Scheduled Events:</p>
            <ul className="task-list">
              {events
                .filter(e => new Date(e.date).getDate() === selectedDay)
                .map((e, idx) => (
                  <li key={idx}>• {e.title}</li>
                ))
              }
              {events.filter(e => new Date(e.date).getDate() === selectedDay).length === 0 && 
                <li className="no-tasks">No events planned</li>
              }
            </ul>
          </div>

          <div className="financial-stats">
            <p>estimated cost: ${events
              .filter(e => new Date(e.date).getDate() === selectedDay)
              .reduce((sum, e) => sum + (Number(e.predictedCost) || 0), 0)
              .toFixed(2)
            }</p>
            <p>weekly budget left: $4</p>
          </div>

          <div className="end-day-section">
            <label>enter today's spending</label>
            <div className="spending-input-wrapper">
              <span>$</span>
              <input 
                type="text" 
                value={todaySpending} 
                onChange={(e) => setTodaySpending(e.target.value)}
              />
            </div>
            <button className="end-day-btn">END DAY</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
