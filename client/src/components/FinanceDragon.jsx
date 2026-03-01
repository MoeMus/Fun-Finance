import React from 'react';
import './FinanceDragon.css';

const FinanceDragon = ({ mood, size }) => {
  const getDragonEmoji = () => {
    // Emojis for different sizes/moods
    if (size === 'egg') return '🥚';
    
    switch (mood) {
      case 'happy': return '🐲';
      case 'sad': return '🐉';
      case 'hungry': return '😋';
      case 'bored': return '💤';
      case 'lonely': return '🥺';
      case 'stinky': return '🤢';
      default: return '🐲';
    }
  };

  return (
    <div className={`dragon-container size-${size} mood-${mood}`}>
      <div className="dragon-visual">
        <span className="dragon-emoji">{getDragonEmoji()}</span>
        <div className="dragon-shadow"></div>
      </div>
      <div className="dragon-info">
        <p className="dragon-label">Finance Dragon: <span className="capitalize">{size}</span></p>
        <p className="dragon-mood">Mood: <span className="mood-tag">{mood}</span></p>
      </div>
    </div>
  );
};

export default FinanceDragon;
