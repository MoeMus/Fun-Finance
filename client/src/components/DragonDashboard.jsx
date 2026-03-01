import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import './DragonDashboard.css';
import { useDispatch, useSelector } from "react-redux";
import {setDragon} from "../auth_token_store/dragon_slice.js";
import {feed_dragon, pet_dragon, play_with_dragon, wash_dragon} from "../dragon_events.jsx";

function DragonDashboard() {

  const { dragon, is_dragon_loaded } = useSelector((state) => state.dragonSlice);
  const { access_token } = useSelector((state) => state.authTokenSlice);
  const dispatch = useDispatch();
  const [activeMaintenanceMoods, setActiveMaintenanceMoods] = useState(new Map([]))

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
      console.error(err)
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
                </span>
                {/*<p className="mood-display-text">{currentMood.toUpperCase()}</p>*/}
              </div>
            </div>

            <div className="dragon-stats-panel">
              <h2 className="dragon-type-title">{dragon.evolution}</h2>
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
                  <span className="stat-value">100/100</span>
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

              <div className="level-up-countdown">
                <p>5 days to next level up opportunity</p>
              </div>
            </div>
          </div>

          <footer className="dragon-action-bar">
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
          </footer>
        </div>
      </main>
    </div>
  );
}

export default DragonDashboard;
