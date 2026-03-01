import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../auth_token_store/auth_token_slice';
import Navbar from './Navbar';
import './DragonDashboard.css';
import {setDragon, removeDragon} from "../auth_token_store/dragon_slice.js";
import {feed_dragon, pet_dragon, play_with_dragon, wash_dragon} from "../dragon_events.jsx";

function DragonDashboard() {

  const [deadDragons, setDeadDragons] = useState([]);
  const { dragon, is_dragon_loaded } = useSelector((state) => state.dragonSlice);
  const { access_token } = useSelector((state) => state.authTokenSlice);
  const dispatch = useDispatch();
  const [activeMaintenanceMoods, setActiveMaintenanceMoods] = useState(new Map([]))
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // FORCE FETCH if data is missing name, even if Redux thinks it's "loaded"
  useEffect(()=>{
    if (!is_dragon_loaded || !dragon || !dragon.name) {
      getDragonData();
    }
    get_dead_dragons();
  }, []);

  useEffect(()=>{
    if (dragon && dragon.mood) {
      updateMoodMapFromObject();
    }
  }, [dragon])

  function updateMoodMapFromObject() {
    const moodObj = dragon.mood;
    if (moodObj) {
      setActiveMaintenanceMoods(() => {
        const newMap = new Map();
        Object.entries(moodObj).forEach(([key, value]) => {
          if (value === true) {
            newMap.set(key, true);
          }
        });
        return newMap;
      });
    }
  }

  const getDragonData = async () => {
    if (!access_token) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      console.log("DASHBOARD: Fetching dragon data...");
      const response = await fetch('http://127.0.0.1:5000/dragon/get', {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${access_token}`
        }
      });

      const data = await response.json();

      // AUTH CHECK: Handle token expiration
      if (response.status === 401 || (data.error && data.error.includes("Token expired"))) {
        console.warn("SESSION EXPIRED: Redirecting to login...");
        dispatch(removeAuthToken());
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (!data || Object.keys(data).length === 0) {
        console.warn("DASHBOARD: No dragon found for this user.");
        navigate('/create-dragon', { replace: true });
        return;
      }

      dispatch(setDragon({dragon: data}));
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message);
    }
  }

  const updateDragon = async (QueryFunction, action) => {
    const img = document.getElementById("dragonImage");
    const original_src = img.src;
    if (action === 'feed') {
      img.src = '/SunConureEating2_97c55283-bf0e-4587-8ed3-2e748f642f66.gif'
    }
    if (action === 'wash') {
      img.src = '/bird-shaking-off.gif'
    }
    if (action === 'pet') {
      img.src = '/pigeon-pigeon-petting.gif'
    }
    if (action === 'play') {
      img.src = '/b6JWBih.gif'
    }
    try {
      const dragon_data = await QueryFunction(access_token);
      
      if (dragon_data?.error && dragon_data.error.includes("Token expired")) {
        dispatch(removeAuthToken());
        navigate('/login', { replace: true });
        return;
      }

      dispatch(setDragon({dragon: dragon_data}));
    } catch (err) {
      setError(err.message);
    }

    img.src = original_src;
  }

  const bury_dragon = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/dragon/bury', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to bury dragon');
      } else {
        dispatch(removeDragon());
        navigate('/create-dragon', {replace: true});
      }
    } catch (err) {
      setError(err.message);
    }
  }

  const get_dead_dragons = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/dragon/dead', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch dead dragons');
      } else {
        setDeadDragons(data);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  // UPDATED LOADING LOGIC: Show error message if it exists, otherwise show loading
  if (!dragon || !dragon.name) {
    return (
      <div className="dragon-vault-page">
        <Navbar />
        <main className="dragon-main-container">
          <div className="loading-status-box">
            {error ? (
              <div className="error-display">
                <h2 className="error-title">BATTLE ERROR</h2>
                <p>{error}</p>
                <button className="action-btn" onClick={() => getDragonData()}>RETRY</button>
              </div>
            ) : (
              <div className="pixel-spinner">
                <p>SUMMONING DRAGON...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dragon-vault-page">
      <Navbar />

      <main className="dragon-main-container">
        <div className="dragon-stage-card">
          <div className="stage-split">
            <div className="dragon-scene-view">
              <div className="dragon-mood-display">
                <img src="/Sunset.png" alt={"sunset"} className="overlay-image"/>
                {deadDragons.length > 0 ? <img className={"grave-stone"} src={'/Gravestone.png'} alt={"gravestone"} /> : null }
                {dragon.current_health > 0 ?
                  <>
                    {dragon.evolution === 'egg' ?
                      <img id={"dragonImage"} src="/Egg.png" alt={"egg"} className="foreground-image"/> : null
                    }
                    {dragon.evolution === 'baby' ?
                      <img id={"dragonImage"} src="/dragonbaby.png" alt={"dragon baby"} className="foreground-image"/> : null
                    }
                    {dragon.evolution === 'teen' ?
                      <img id={"dragonImage"} src="/Medium Dragon FINAL.png" alt={"teen"}
                           className="foreground-image"/> : null
                    }
                    {dragon.evolution === 'adult' ?
                      <img id={"dragonImage"} src="/Big boy Dragon.png" alt={"adult"} className="foreground-image"/> : null
                    }
                  </>
                  :
                  <>
                    {dragon.evolution === 'egg' ? <img src="/DEADEgg.png" alt={"dead egg"} className="foreground-image"/> : null}
                    {dragon.evolution === 'baby' ? <img src="/DEADdragonbaby.png" alt={"dead baby"} className="foreground-image"/> : null}
                    {dragon.evolution === 'teen' ? <img src="/DEAD Medium Dragon FINAL.png" alt={"dead teen"} className="foreground-image"/> : null}
                    {dragon.evolution === 'adult' ? <img src="/DEAD Big boy Dragon.png" alt={"dead adult"} className="foreground-image"/> : null}
                  </>
                }
              </div>
            </div>

            <div className="dragon-stats-panel">
              <h2 className="dragon-type-title">{(dragon.evolution || 'unknown').toUpperCase()} DRAGON</h2>

              {dragon.current_health > 0 ?
                <>
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
                    <span className="stat-value">{dragon.current_health} / {dragon.max_health}</span>
                  </div>
                  <div className="stat-line">
                    <span className="stat-label">mood:</span>
                    <span className="stat-value">
                      {activeMaintenanceMoods.size > 0 
                        ? [...activeMaintenanceMoods.keys()].join(', ') 
                        : (dragon.mood?.happy ? 'happy' : 'neutral')}
                    </span>
                  </div>
                  <div className="stat-line">
                    <span className="stat-label">next evolution:</span>
                    <span className="stat-value">
                      {dragon.next_evolution ? `level ${dragon.next_evolution}` : 'MAX'}
                    </span>
                  </div>
                </div>
                </>
                :
                <div className="stat-line">
                  { dragon.evolution === 'egg' ?  <span className="stat-label"> {dragon.name} has Cracked </span> :
                    <span className="stat-label"> {dragon.name} has Died </span>}
                </div>
              }
            </div>
          </div>

          <footer className="dragon-action-bar">
            {dragon.current_health > 0 ?
              <>
                <button
                  className={`action-btn ${activeMaintenanceMoods.has('hungry') ? 'alert' : ''}`}
                  onClick={() => updateDragon(feed_dragon, 'feed')}
                >
                  FEED
                </button>
                <button
                  className={`action-btn ${activeMaintenanceMoods.has('bored') ? 'alert' : ''}`}
                  onClick={() => updateDragon(play_with_dragon, 'play')}
                >
                  PLAY
                </button>
                <button
                  className={`action-btn ${activeMaintenanceMoods.has('lonely') ? 'alert' : ''}`}
                  onClick={() => updateDragon(pet_dragon, 'pet')}
                >
                  PET
                </button>
                <button
                  className={`action-btn ${activeMaintenanceMoods.has('dirty') ? 'alert' : ''}`}
                  onClick={() => updateDragon(wash_dragon, 'wash')}
                >
                  WASH
                </button>
              </>
              :
              <button className={`action-btn`} onClick={() => bury_dragon()}>BURY</button>
            }
          </footer>
        </div>
      </main>
    </div>
  );
}

export default DragonDashboard;
