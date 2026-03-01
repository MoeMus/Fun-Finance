import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import './DragonDashboard.css';

const DragonDashboard = ({ summary = {} }) => {
  const {
    dragonMood: financialMood = 'happy',
    dragonSize = 'baby',
  } = summary;

  // Track maintenance moods (hungry, bored, lonely, stinky)
  const [activeMaintenanceMoods, setActiveMaintenanceMoods] = useState([]);

  // Determine the display mood based on precedence rules
  const getDisplayMood = () => {
    if (financialMood === 'sad') return 'sad';
    if (activeMaintenanceMoods.length > 0) return activeMaintenanceMoods[0];
    return 'happy';
  };

  const currentMood = getDisplayMood();

  // Maintenance mood trigger logic
  useEffect(() => {
    const maintenanceTypes = ['hungry', 'bored', 'lonely', 'stinky'];
    
    const checkMoodTriggers = () => {
      setActiveMaintenanceMoods(prev => {
        const newMoods = [...prev];
        maintenanceTypes.forEach(type => {
          // 10% chance if not already active
          if (!newMoods.includes(type) && Math.random() < 0.10) {
            newMoods.push(type);
          }
        });
        return newMoods;
      });
    };

    // Run every 5 minutes (300,000 ms)
    const interval = setInterval(checkMoodTriggers, 300000);
    
    return () => clearInterval(interval);
  }, []);

  // Action handlers
  const handleAction = (moodToClear) => {
    setActiveMaintenanceMoods(prev => prev.filter(m => m !== moodToClear));
  };

  return (
    <div className="dragon-vault-page">
      <Navbar />

      {/* Main Content Area */}
      <main className="dragon-main-container">
        <div className="dragon-stage-card">
          <div className="stage-split">
            <div className="dragon-scene-view">
              <div className="dragon-mood-display">
                <span className="mood-emoji">
                  {currentMood === 'happy' && '🐲'}
                  {currentMood === 'sad' && '🐉'}
                  {currentMood === 'hungry' && '😋'}
                  {currentMood === 'bored' && '💤'}
                  {currentMood === 'lonely' && '🥺'}
                  {currentMood === 'stinky' && '🤢'}
                </span>
                <p className="mood-display-text">{currentMood.toUpperCase()}</p>
              </div>
            </div>

            <div className="dragon-stats-panel">
              <h2 className="dragon-type-title">{dragonSize.toUpperCase()} DRAGON</h2>
              <div className="stats-list">
                <div className="stat-line">
                  <span className="stat-label">name:</span>
                  <span className="stat-value">Banko</span>
                </div>
                <div className="stat-line">
                  <span className="stat-label">lvl:</span>
                  <span className="stat-value">7</span>
                </div>
                <div className="stat-line">
                  <span className="stat-label">hp:</span>
                  <span className="stat-value">100/100</span>
                </div>
                <div className="stat-line">
                  <span className="stat-label">mood:</span>
                  <span className="stat-value">{currentMood}</span>
                </div>
                <div className="stat-line">
                  <span className="stat-label">next evolution:</span>
                  <span className="stat-value">level 8</span>
                </div>
              </div>

              <div className="level-up-countdown">
                <p>5 days to next level up opportunity</p>
              </div>
            </div>
          </div>

          <footer className="dragon-action-bar">
            <button 
              className={`action-btn ${activeMaintenanceMoods.includes('hungry') ? 'alert' : ''}`}
              onClick={() => handleAction('hungry')}
            >
              FEED
            </button>
            <button 
              className={`action-btn ${activeMaintenanceMoods.includes('bored') ? 'alert' : ''}`}
              onClick={() => handleAction('bored')}
            >
              PLAY
            </button>
            <button 
              className={`action-btn ${activeMaintenanceMoods.includes('lonely') ? 'alert' : ''}`}
              onClick={() => handleAction('lonely')}
            >
              PET
            </button>
            <button 
              className={`action-btn ${activeMaintenanceMoods.includes('stinky') ? 'alert' : ''}`}
              onClick={() => handleAction('stinky')}
            >
              WASH
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default DragonDashboard;
