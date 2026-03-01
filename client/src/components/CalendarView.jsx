import React, { useState } from 'react';
import Navbar from './Navbar';
import './CalendarView.css';

const CalendarView = ({ events = [] }) => {
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();

  const [selectedDay, setSelectedDay] = useState(todayDate);
  const [todaySpending, setTodaySpending] = useState('0.00');

  // Calculate days in month and starting weekday padding
  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(year, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  // Adjust for Monday start (0=Mon, 6=Sun)
  const paddingCount = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const paddingArray = Array.from({ length: paddingCount }, (_, i) => i);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getEnemyForDay = (day) => {
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === day && eventDate.getMonth() === currentMonth;
    });
    if (dayEvents.length === 0) return null;
    
    const totalCost = dayEvents.reduce((sum, e) => sum + (e.predictedCost || 0), 0);
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
          <h2 className="month-title">{monthName} {year}</h2>
          <div className="grid-header">
            {weekDays.map(d => <div key={d} className="weekday-label">{d}</div>)}
          </div>
          <div className="calendar-grid">
            {/* Filled padding tiles */}
            {paddingArray.map(p => {
              const dow = p + 1; // 1=Mon, 2=Tue, etc.
              return (
                <div key={`pad-${p}`} className={`calendar-tile padding-tile day-${dow}`}></div>
              );
            })}
            
            {daysArray.map(day => {
              const dow = ((paddingCount + day - 1) % 7) + 1; // 1=Mon, 7=Sun
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
                  <li key={idx}>{e.title}</li>
                ))
              }
              {events.filter(e => new Date(e.date).getDate() === selectedDay).length === 0 && 
                <li className="no-tasks">No events planned</li>
              }
            </ul>
          </div>

          <div className="financial-stats">
            <p>estimated cost: $100</p>
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
