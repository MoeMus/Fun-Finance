import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import CalendarImport from './CalendarImport';
import './CalendarView.css';

const CalendarView = () => {
  // Use PST Timezone to ensure consistency
  const getPSTDate = () => {
    const pstString = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    return new Date(pstString);
  };

  const now = getPSTDate();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();

  const [selectedDay, setSelectedDay] = useState(todayDate);
  const [todaySpending, setTodaySpending] = useState('0.00');
  
  // Use Redux to get the current token
  const { access_token } = useSelector((state) => state.authTokenSlice);

  // State for events and imported sources with LocalStorage hydration
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('dragonvault_events');
    return saved ? JSON.parse(saved) : [];
  });
  const [importedSources, setImportedSources] = useState(() => {
    const saved = localStorage.getItem('dragonvault_sources');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  // Persistence side-effect
  useEffect(() => {
    localStorage.setItem('dragonvault_events', JSON.stringify(events));
    localStorage.setItem('dragonvault_sources', JSON.stringify(importedSources));
  }, [events, importedSources]);

  // Calculate days in month and starting weekday padding
  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(year, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const paddingCount = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const paddingArray = Array.from({ length: paddingCount }, (_, i) => i);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleImportSuccess = async (newEvents, sourceName) => {
    // Check if this source already exists and if the events are actually new
    if (importedSources.includes(sourceName)) {
      const currentSourceEvents = events.filter(e => e.source === sourceName);
      
      // DEEP COMPARISON: Compare simplified versions of events to detect real changes
      const currentStr = JSON.stringify(currentSourceEvents.map(e => ({ t: e.title, d: e.date })));
      const newStr = JSON.stringify(newEvents.map(e => ({ t: e.title, d: e.date })));
      
      if (currentStr === newStr) {
        console.log("SMART-SYNC: No changes in this calendar. Aborting API request to save quota.");
        return;
      }
    }

    if (!importedSources.includes(sourceName)) {
      setImportedSources(prev => [...prev, sourceName]);
    }

    // Filter out existing events from this source to avoid duplicates when re-importing
    const existingOtherEvents = events.filter(e => e.source !== sourceName);

    // Combine events and analyze with AI
    const combinedEvents = [...existingOtherEvents, ...newEvents];
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

  const removeSource = (sourceName) => {
    setImportedSources(prev => prev.filter(s => s !== sourceName));
    setEvents(prev => prev.filter(e => e.source !== sourceName));
  };

  const getEventsForDay = (day) => {
    return events.filter(e => {
      // Split the "YYYY-MM-DD" string to ensure local timezone parsing doesn't shift the day
      const eventParts = e.date.split('-');
      if (eventParts.length !== 3) return false;
      
      const eYear = parseInt(eventParts[0], 10);
      const eMonth = parseInt(eventParts[1], 10) - 1; // 0-indexed month
      const eDay = parseInt(eventParts[2], 10);
      
      return eDay === day && eMonth === currentMonth && eYear === year;
    });
  };

  const getEnemyForDay = (dayEvents) => {
    if (dayEvents.length === 0) return null;
    
    const totalCost = dayEvents.reduce((sum, e) => sum + (Number(e.predictedCost) || 0), 0);
    if (totalCost > 100) return 'XL';
    if (totalCost > 50) return 'Large';
    if (totalCost > 20) return 'Medium';
    return 'Small';
  };

  // Agentic "End Day" Hook
  const handleEndDay = async () => {
    const dayEvents = getEventsForDay(selectedDay);
    const predicted = dayEvents.reduce((sum, e) => sum + (Number(e.predictedCost) || 0), 0);
    const actual = Number(todaySpending) || 0;

    const payload = {
      actual_spending: actual,
      predicted_spending: predicted,
      events_today: dayEvents,
      current_stats: { hp: 100, level: 7, mood: 'happy' }
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/calendar/resolve_day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        // IF VICTORY: Call the Level Up endpoint!
        if (data.battle_result === 'victory') {
          console.log("VICTORY! Leveling up dragon...");
          try {
            await fetch('http://127.0.0.1:5000/dragon/levelup', {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${access_token}`
              }
            });
          } catch (lvlErr) {
            console.error("Level up failed:", lvlErr);
          }
        } else if (data.battle_result === 'defeat') {
          // IF DEFEAT: Trigger sadness
          console.log("DEFEAT! Updating mood to sad...");
          try {
            await fetch('http://127.0.0.1:5000/dragon/update-mood', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
              },
              body: JSON.stringify({ mood: { happy: false, sad: true, hungry: false, dirty: false, lonely: false, bored: false } })
            });
          } catch (moodErr) {
            console.error("Mood update failed:", moodErr);
          }
        }

        alert(`BATTLE RESULT: ${data.battle_result.toUpperCase()}!\n\nDragon Insight: ${data.insight}`);
      } else {
        alert("Agent failed to respond.");
      }
    } catch (error) {
      console.error("End Day failed:", error);
    }
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
                  {importedSources.map(s => (
                    <span key={s} className="source-badge">
                      {s}
                      <button className="remove-source-btn" onClick={() => removeSource(s)}>×</button>
                    </span>
                  ))}
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
              const dayEvents = getEventsForDay(day);
              const enemy = getEnemyForDay(dayEvents);
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
                    {/* Background Status Icons */}
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

                    {/* Mini Event List */}
                    {dayEvents.length > 0 && (
                      <div className="tile-events">
                        {dayEvents.slice(0, 3).map((e, idx) => (
                          <div key={idx} className="mini-event-title">{e.title}</div>
                        ))}
                        {dayEvents.length > 3 && <div className="mini-event-more">+{dayEvents.length - 3} more</div>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Details Sidebar */}
        <div className="calendar-details-sidebar">
          <h2 className="selected-date">{monthName.substring(0, 3)}. {selectedDay}</h2>
          
          <div className="day-tasks">
            <p className="sidebar-label">Scheduled Events:</p>
            <ul className="task-list">
              {getEventsForDay(selectedDay).map((e, idx) => (
                <li key={idx}>
                  <span className="task-bullet">•</span> 
                  <span className="task-title">{e.title}</span>
                  {e.predictedCost !== undefined && <span className="task-cost"> - ${Number(e.predictedCost).toFixed(2)}</span>}
                </li>
              ))}
              {getEventsForDay(selectedDay).length === 0 && 
                <li className="no-tasks">No events planned</li>
              }
            </ul>
          </div>

          <div className="financial-stats">
            <p>estimated cost: ${getEventsForDay(selectedDay)
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
            <button className="end-day-btn" onClick={handleEndDay}>END DAY</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
