import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../auth_token_store/auth_token_slice';
import Navbar from './Navbar';
import './DragonDashboard.css';

const DragonDashboard = () => {
  const [dragon, setDragon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMaintenanceMoods, setActiveMaintenanceMoods] = useState([]);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { access_token } = useSelector((state) => state.authTokenSlice);

  // Fetch dragon stats from the backend
  useEffect(() => {
    const fetchDragon = async () => {
      if (!access_token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:5000/dragon/get', {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
        
        const data = await response.json();
        
        // AUTH ERROR: If token is expired (401) or contains error text, logout and redirect
        if (response.status === 401 || (data && data.error && data.error.toLowerCase().includes('token'))) {
          console.error("Session expired, logging out...");
          dispatch(removeAuthToken());
          navigate('/login');
          return;
        }

        // REDIRECT LOGIC: If backend returns null, the user needs to create a dragon
        if (data === null) {
          console.log("No dragon found, redirecting to creation...");
          navigate('/create-dragon');
          return;
        }

        if (data && !data.error) {
          setDragon(data);
          
          const maintenance = [];
          if (data.mood?.hungry) maintenance.push('hungry');
          if (data.mood?.bored) maintenance.push('bored');
          if (data.mood?.lonely) maintenance.push('lonely');
          if (data.mood?.dirty) maintenance.push('stinky');
          setActiveMaintenanceMoods(maintenance);
        }
      } catch (err) {
        console.error("Failed to fetch dragon:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDragon();
  }, [access_token, navigate, dispatch]);

  const getDisplayMood = () => {
    if (!dragon) return 'happy';
    if (dragon.mood?.sad) return 'sad';
    if (activeMaintenanceMoods.length > 0) return activeMaintenanceMoods[0];
    return 'happy';
  };

  const handleAction = async (moodType) => {
    // Optimistically update UI
    setActiveMaintenanceMoods(prev => prev.filter(m => m !== moodType));
    
    // In a real app, you would hit the /update-mood endpoint here
    // to persist the "Washed/Fed/etc" state.
  };

  if (loading) return <div className="loading-state">Syncing with the Vault...</div>;
  if (!dragon) return <div className="loading-state">No dragon found. Go to creation!</div>;

  const currentMood = getDisplayMood();

  return (
    <div className="dragon-vault-page">
      <Navbar />

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
              <h2 className="dragon-type-title">{dragon.evolution.toUpperCase()} DRAGON</h2>
              <div className="stats-list">
                <div className="stat-line">
                  <span className="stat-label">name:</span>
                  <span className="stat-value">{dragon.name}</span>
                </div>
                <div className="stat-line">
                  <span className="stat-label">lvl:</span>
                  <span className="stat-value">{dragon.level}</span>
                </div>
                <div className="stat-line">
                  <span className="stat-label">hp:</span>
                  <span className="stat-value">{dragon.current_health}/{dragon.max_health}</span>
                </div>
                <div className="stat-line">
                  <span className="stat-label">mood:</span>
                  <span className="stat-value">{currentMood}</span>
                </div>
                <div className="stat-line">
                  <span className="stat-label">next evolution:</span>
                  <span className="stat-value">lvl {dragon.next_evolution}</span>
                </div>
              </div>

              <div className="level-up-countdown">
                <p>Status: {dragon.mood?.sad ? 'NEEDS BUDGET HELP' : 'FINANCIALLY HEALTHY'}</p>
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
