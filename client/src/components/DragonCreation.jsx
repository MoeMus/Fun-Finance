import {Link} from "react-router-dom";
import React, {useState} from "react";


function DragonCreationPage() {

  const [dragonName, setDragonName] = useState('');
  const [error, setError] = useState('');

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
              <div className="dragon-mood-display">
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
                    autoComplete="username"
                    placeholder="username"
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
            </div>
          </div>

          <footer className="dragon-action-bar">
            <button
              disabled={!!dragonName}
              className={`action-btn`}
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