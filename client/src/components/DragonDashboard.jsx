import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../auth_token_store/auth_token_slice';
import Navbar from './Navbar';
import './DragonDashboard.css';
import { useDispatch, useSelector } from "react-redux";
import {setDragon, removeDragon} from "../auth_token_store/dragon_slice.js";
import {feed_dragon, pet_dragon, play_with_dragon, wash_dragon} from "../dragon_events.jsx";
import {useNavigate} from "react-router-dom";

<<<<<<< HEAD
function DragonDashboard() {

  const { dragon, is_dragon_loaded } = useSelector((state) => state.dragonSlice);
  const { access_token } = useSelector((state) => state.authTokenSlice);
  const dispatch = useDispatch();
  const [activeMaintenanceMoods, setActiveMaintenanceMoods] = useState(new Map([]))
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    if (!is_dragon_loaded) {
      getDragonData();
    }

  }, []);

  useEffect(()=>{
    if (dragon) {
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

    const response = await fetch('http://127.0.0.1:5000/dragon/get', {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${access_token}`
      }
    });

    const dragon_data = await response.json();

    dispatch(setDragon({dragon: dragon_data}));

  }

  const updateDragon = async (QueryFunction) => {

    try {
      const dragon_data = await QueryFunction(access_token);
      dispatch(setDragon({dragon: dragon_data}));
    } catch (err) {
      setError(err);
    }
  }

  const bury_dragon = async () => {

    const response = await fetch('http://127.0.0.1:5000/dragon/bury', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!response.ok) {
      const error_msg = await response.json();
      setError(error_msg.error)
    } else {
      dispatch(removeDragon);
      navigate('/create-dragon', {replace: true});
    }

  }

  if (!dragon) {
    return (
      <div className="dragon-vault-page">
        <Navbar />
        <main className="dragon-main-container">Loading...</main>
      </div>
    );
  }
=======
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
>>>>>>> 1d5f26ab6be71fd2502604fcbb4233d935971745

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
                <img src="../../public/Sunset.png" alt={"sunset"} className="overlay-image"/>

                {dragon.current_health > 0 ?

                  <>
                    {dragon.evolution === 'egg' ?
                      <img src="../../public/Egg.png" alt={"egg"} className="foreground-image"/> : null
                    }
                    {dragon.evolution === 'baby' ?
                      <img src="../../public/dragonbaby.png" alt={"dragon baby"} className="foreground-image"/> : null
                    }
                    {dragon.evolution === 'teen' ?
                      <img src="../../public/Medium%20Dragon%20FINAL.png" alt={"egg"}
                           className="foreground-image"/> : null
                    }
                    {dragon.evolution === 'adult' ?
                      <img src="../../public/Big%20boy%20Dragon.png" alt={"egg"} className="foreground-image"/> : null
                    }
                  </>
                  :
                  <>
                    {dragon.evolution === 'egg' ?
                      <img src="../../public/DEADEgg.png" alt={"dead egg"} className="foreground-image"/> : null
                    }
                    {dragon.evolution === 'baby' ?
                      <img src="../../public/DEADdragonbaby.png" alt={"dragon baby"} className="foreground-image"/> : null
                    }
                    {dragon.evolution === 'teen' ?
                      <img src="../../public/DEAD%20Medium%20Dragon%20FINAL.png" alt={"egg"}
                           className="foreground-image"/> : null
                    }
                    {dragon.evolution === 'adult' ?
                      <img src="../../public/DEAD%20Big%20boy%20Dragon.png" alt={"egg"} className="foreground-image"/> : null
                    }
                  </>
                }

              </div>
            </div>

            <div className="dragon-stats-panel">
<<<<<<< HEAD
              <h2 className="dragon-type-title">{dragon.evolution}</h2>

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
                    {[...activeMaintenanceMoods.keys()].map((key) => (
                      <span key={key}>{key}</span>
                    ))}
                  </div>
                  <div className="stat-line">
                    <span className="stat-label">next evolution:</span>
                    <span className="stat-value">level {dragon.next_evolution}</span>
                  </div>
                </div>
                </>
                :

                <div className="stat-line">
                  { dragon.evolution === 'egg' ?  <span className="stat-label"> {dragon.name} has Cracked </span> :
                    <span className="stat-label"> {dragon.name} has Died </span>}
                </div>

              }

=======
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
>>>>>>> 1d5f26ab6be71fd2502604fcbb4233d935971745
            </div>
          </div>

          <footer className="dragon-action-bar">

            {dragon.current_health > 0 ?
              <>
                <button
                  className={`action-btn ${activeMaintenanceMoods.has('hungry') ? 'alert' : ''}`}
                  onClick={() => updateDragon(feed_dragon)}
                >
                  FEED
                </button>
                <button
                  className={`action-btn ${activeMaintenanceMoods.has('bored') ? 'alert' : ''}`}
                  onClick={() => updateDragon(play_with_dragon)}
                >
                  PLAY
                </button>
                <button
                  className={`action-btn ${activeMaintenanceMoods.has('lonely') ? 'alert' : ''}`}
                  onClick={() => updateDragon(pet_dragon)}
                >
                  PET
                </button>
                <button
                  className={`action-btn ${activeMaintenanceMoods.has('dirty') ? 'alert' : ''}`}
                  onClick={() => updateDragon(wash_dragon)}
                >
                  WASH
                </button>
              </>
              :
              <button
                className={`action-btn`}
                onClick={() => bury_dragon()}
              >
                BURY
              </button>
            }


          </footer>
        </div>
      </main>
    </div>
  );
}

export default DragonDashboard;
