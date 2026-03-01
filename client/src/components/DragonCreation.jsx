import {Link} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useSelector, useDispatch} from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import auth_token_slice from "../auth_token_store/auth_token_slice.js";
import './DragonCreation.css';
import {setDragon} from "../auth_token_store/dragon_slice.js";

function DragonCreationPage() {

  const [dragonName, setDragonName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { access_token } = useSelector((state)=>state.authTokenSlice);
  const dispatch = useDispatch();

  const createDragon = async () => {

    if (dragonName === '') {
      setError('A name is required');
      return;
    }

    const request = {
      dragon_name: dragonName
    };

    const response = await fetch('http://127.0.0.1:5000/dragon/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`
      },
      body : JSON.stringify(request)
    });

    if (!response.ok) {
      const error_msg = await response.json();
      setError(error_msg.error);
      return;
    }

    const dragon_data = await response.json();

    dispatch(setDragon({dragon: dragon_data}))
    navigate('/', {replace: true});

  }

  return (
    <div className="dragon-vault-page">
      {/* Navbar */}
      <nav className="dragon-navbar">
        <div className="nav-logo">Dragon Vault</div>
      </nav>

      {/* Main Content Area */}
      <main className="dragon-main-container">
        <div className="dragon-stage-card">
          <div className="stage-split">
            <div className="dragon-scene-view">
              <div className="dragon-mood-display-creation" >
                <img className="dragon-egg" src={'../../public/Egg.png'} alt={"Dragon Egg"} />
              </div>
            </div>

            <div className="dragon-stats-panel">
              <h2 className="dragon-type-title"> Create Your Dragon </h2>
              <div className="stats-list">
                <div className="stat-line">
                  <span className="stat-label">name:</span>
                  <input
                    className="dv-input"
                    type="text"
                    autoComplete="Dragon Name"
                    placeholder="e.g, Smaug"
                    value={dragonName}
                    onChange={(e) => setDragonName(e.target.value)}
                  />
                </div>
                <div className="stat-line">
                  <span className="stat-label">lvl:</span>
                  <span className="stat-value">0</span>
                </div>
                <div className="stat-line">
                  <span className="stat-label">hp:</span>
                  <span className="stat-value">50/50</span>
                </div>
                <div className="stat-line">
                  <span className="stat-label">mood:</span>
                  <span className="stat-value">Happy</span>
                </div>
                <div className="stat-line">
                  <span className="stat-label">next evolution:</span>
                  <span className="stat-value">level 4</span>
                </div>
              </div>

              {error ? <p className="dv-error">{error}</p> : null}

            </div>

          </div>

          <footer className="dragon-action-bar">
            <button
              className={`action-btn`}
              onClick={createDragon}
            >
              CREATE YOUR DRAGON
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default DragonCreationPage;