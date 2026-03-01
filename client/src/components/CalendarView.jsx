import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import CalendarImport from './CalendarImport';
import './CalendarView.css';
import { setDragon } from "../auth_token_store/dragon_slice.js";
import { removeAuthToken } from '../auth_token_store/auth_token_slice';

const CalendarView = () => {
  const getPSTDate = () => {
    const pstString = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    return new Date(pstString);
  };

  const now = getPSTDate();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(todayDate);
  const [todaySpending, setTodaySpending] = useState('0.00');
  const [isResolvingDay, setIsResolvingDay] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [battleResult, setBattleResult] = useState(null);
  
  const { access_token } = useSelector((state) => state.authTokenSlice);

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('dragonvault_events');
    return saved ? JSON.parse(saved) : [];
  });
  const [importedSources, setImportedSources] = useState(() => {
    const saved = localStorage.getItem('dragonvault_sources');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [isSlashing, setIsSlashing] = useState(false);

  // Computed: Check if the CURRENTLY SELECTED day is resolved
  const isSelectedDayResolved = useMemo(() => {
    if (importedSources.length === 0) return false;
    const saved = localStorage.getItem(`dragonvault_submitted_${year}_${currentMonth}_${selectedDay}`);
    return saved === 'true';
  }, [selectedDay, year, currentMonth, importedSources.length]);

  useEffect(() => {
    if (importedSources.length === 0) {
      if (events.length > 0) {
        setEvents([]);
      }
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('dragonvault_submitted_') || key.startsWith('dragonvault_result_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    localStorage.setItem('dragonvault_events', JSON.stringify(events));
    localStorage.setItem('dragonvault_sources', JSON.stringify(importedSources));
  }, [events, importedSources]);

  const handleImportSuccess = async (newEvents, sourceName) => {
    const taggedNewEvents = newEvents.map(e => ({ ...e, source: sourceName }));

    const currentSourceEvents = events.filter(e => e.source === sourceName);
    const currentStr = JSON.stringify(currentSourceEvents.map(e => ({ t: e.title, d: e.date })));
    const newStr = JSON.stringify(taggedNewEvents.map(e => ({ t: e.title, d: e.date })));
    if (importedSources.includes(sourceName) && currentStr === newStr) return;

    if (!importedSources.includes(sourceName)) {
      setImportedSources(prev => [...prev, sourceName]);
    }

    const otherEvents = events.filter(e => e.source !== sourceName);
    const combinedEvents = [...otherEvents, ...taggedNewEvents];
    
    setEvents(combinedEvents);
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/calendar/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: combinedEvents })
      });
      const data = await response.json();

      if (data.events) {
        setEvents(currentEvents => {
          return currentEvents.map(currentEvent => {
            const aiMatch = data.events.find(aiEvent => 
              currentEvent.title.toLowerCase().includes(aiEvent.title.toLowerCase()) || 
              aiEvent.title.toLowerCase().includes(currentEvent.title.toLowerCase())
            );

            if (aiMatch) {
              return {
                ...currentEvent,
                predictedCost: aiMatch.predictedCost,
                risk: aiMatch.risk,
                savingTip: aiMatch.savingTip
              };
            }
            return currentEvent;
          });
        });
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
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
      const eventParts = e.date.split('-');
      if (eventParts.length !== 3) return false;
      return parseInt(eventParts[2], 10) === day && (parseInt(eventParts[1], 10) - 1) === currentMonth && parseInt(eventParts[0], 10) === year;
    });
  };

  const getEnemyForDay = (dayEvents) => {
    if (dayEvents.length === 0) return null;

    // CRITICAL FIX: Only show enemy once ALL events for this day have been analyzed.
    // This prevents a 'Slime' from showing for a day that will eventually be a 'BIG BOY'.
    const isFullyAnalyzed = dayEvents.every(e => e.predictedCost !== undefined);
    if (!isFullyAnalyzed) return null;

    const totalCost = dayEvents.reduce((sum, e) => sum + (Number(e.predictedCost) || 0), 0);
    
    // Ranges:
    // $0-20: Slime
    // $21-50: Knight
    // $51-100: Werewolf
    // $101+: BIG BOY
    if (totalCost > 100) return { type: 'XL', img: '/BIG BOY ENEMYYY.png' };
    if (totalCost > 50) return { type: 'Large', img: '/Werewolf final.png' };
    if (totalCost > 20) return { type: 'Medium', img: '/Knight.png' };
    return { type: 'Small', img: '/Slime FINAL.png' };
  };

  const handleEndDay = async () => {
    if (isSelectedDayResolved) return;
    
    const dayEvents = getEventsForDay(selectedDay);
    const predicted = dayEvents.reduce((sum, e) => sum + (Number(e.predictedCost) || 0), 0);
    const actual = Number(todaySpending) || 0;

    setIsSlashing(true);
    setIsResolvingDay(true);

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
        const isVictory = data.battle_result === 'victory';
        const moodUpdate = {
          mood: { happy: isVictory, sad: !isVictory, hungry: false, dirty: false, lonely: false, bored: false }
        };

        const updateResponse = await fetch('http://127.0.0.1:5000/dragon/update-mood', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${access_token}` 
          },
          body: JSON.stringify(moodUpdate)
        });

        const updatedDragonData = await updateResponse.json();

        if (updateResponse.status === 401 || (updatedDragonData.error && updatedDragonData.error.includes("Token expired"))) {
          dispatch(removeAuthToken());
          navigate('/login', { replace: true });
          return;
        }

        dispatch(setDragon({ dragon: updatedDragonData }));

        setTimeout(() => {
          setIsSlashing(false);
          setBattleResult(data);
          setShowResultModal(true);
          setIsResolvingDay(false);
          localStorage.setItem(`dragonvault_submitted_${year}_${currentMonth}_${selectedDay}`, 'true');
          localStorage.setItem(`dragonvault_result_${year}_${currentMonth}_${selectedDay}`, data.battle_result);
        }, 1000);
      }
    } catch (error) {
      console.error("Battle failed:", error);
      setIsSlashing(false);
      setIsResolvingDay(false);
    }
  };

  return (
    <div className="calendar-page-container">
      <Navbar />
      <div className="calendar-main-card">
        <div className="calendar-grid-section">
          <div className="calendar-header-actions">
            <h2 className="month-title">{monthName} {year}</h2>
            <div className="import-controls">
              {importedSources.length > 0 && (
                <div className="sources-list">
                  {importedSources.map(s => (
                    <span key={s} className="source-badge">{s}
                      <button className="remove-source-btn" onClick={() => removeSource(s)}>×</button>
                    </span>
                  ))}
                </div>
              )}
              <CalendarImport onImportSuccess={handleImportSuccess} />
            </div>
          </div>

          <div className="grid-header">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <div key={d} className="weekday-label">{d}</div>)}
          </div>
          <div className="calendar-grid">
            {Array.from({ length: (new Date(year, currentMonth, 1).getDay() === 0 ? 6 : new Date(year, currentMonth, 1).getDay() - 1) }).map((_, p) => (
              <div key={`pad-${p}`} className={`calendar-tile padding-tile day-${p + 1}`}></div>
            ))}
            {Array.from({ length: new Date(year, currentMonth + 1, 0).getDate() }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const enemy = getEnemyForDay(dayEvents);
              const isResolved = importedSources.length > 0 && localStorage.getItem(`dragonvault_submitted_${year}_${currentMonth}_${day}`) === 'true';
              const result = importedSources.length > 0 ? localStorage.getItem(`dragonvault_result_${year}_${currentMonth}_${day}`) : null;

              return (
                <div key={day} className={`calendar-tile day-${(( (new Date(year, currentMonth, 1).getDay() === 0 ? 6 : new Date(year, currentMonth, 1).getDay() - 1) + day - 1) % 7) + 1} ${day === todayDate ? 'today' : ''} ${selectedDay === day ? 'selected' : ''}`} onClick={() => setSelectedDay(day)}>
                  <span className="day-number">{day}</span>
                  <div className="tile-content">
                    {/* SPRITES AT THE TOP OF THE DOM SO THEY USE Z-INDEX CORRECTLY */}
                    {isResolved && (
                      <img src={result === 'victory' ? '/check-mark.png' : '/X mark.png'} className="status-icon-img" alt="result" />
                    )}
                    
                    {!isResolved && (
                      enemy && <img src={enemy.img} className={`enemy-sprite ${enemy.type.toLowerCase()}`} alt="enemy" />
                    )}

                    {dayEvents.length > 0 && (
                      <div className="tile-events">
                        {dayEvents.slice(0, 3).map((e, idx) => <div key={idx} className="mini-event-title">{e.title}</div>)}
                        {dayEvents.length > 3 && <div className="mini-event-more">+{dayEvents.length - 3} more</div>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="calendar-details-sidebar">
          <h2 className="selected-date">{monthName.substring(0, 3)}. {selectedDay}</h2>
          <div className="day-tasks">
            <p className="sidebar-label">Scheduled Events:</p>
            <div className="task-list-wrapper">
              <ul className="task-list">
                {getEventsForDay(selectedDay).map((e, idx) => (
                  <li key={idx}><span className="task-bullet">•</span> <span className="task-title">{e.title}</span>
                    {e.predictedCost !== undefined && <span className="task-cost"> - ${Number(e.predictedCost).toFixed(2)}</span>}
                  </li>
                ))}
                {getEventsForDay(selectedDay).length === 0 && <li className="no-tasks">No events planned</li>}
              </ul>
            </div>
          </div>

          <div className="financial-stats">
            <p>estimated cost: ${getEventsForDay(selectedDay).reduce((sum, e) => sum + (Number(e.predictedCost) || 0), 0).toFixed(2)}</p>
          </div>

          <div className="end-day-section">
            <label>enter spending</label>
            <div className="spending-input-wrapper">
              <span>$</span>
              <input type="text" value={todaySpending} disabled={isSelectedDayResolved} onChange={(e) => setTodaySpending(e.target.value)}/>
            </div>
            <button 
              className="end-day-btn" 
              onClick={handleEndDay} 
              disabled={isResolvingDay || isSelectedDayResolved}
            >
              {isResolvingDay ? 'COMMENCING BATTLE...' : isSelectedDayResolved ? 'DAY RESOLVED' : 'END DAY'}
            </button>
          </div>
        </div>
      </div>

      {showResultModal && battleResult && (
        <div className="battle-modal-overlay">
          <div className={`battle-modal-card ${battleResult.battle_result}`}>
            <h1 className="result-title">{battleResult.battle_result === 'victory' ? 'VICTORY!' : 'DEFEAT!'}</h1>
            <div className="result-insight">{battleResult.insight}</div>
            <div className="hp-change-tag">
              {battleResult.battle_result === 'victory' ? 'DRAGON LEVELED UP!' : 'DRAGON LOST HP!'}
            </div>
            <button className="modal-close-btn" onClick={() => setShowResultModal(false)}>CONTINUE JOURNEY</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
