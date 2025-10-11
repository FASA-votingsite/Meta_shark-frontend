import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Games.css';
import { NAIRA_SIGN } from '@bilmapay/react-currency-symbols';


const Games = () => {
  const [gameResult, setGameResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const playGame = async (gameType) => {
    setLoading(true);
    setError('');
    setGameResult(null);

    try {
      const response = await axios.post(`/api/games/${gameType}/`);
      setGameResult(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to play game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="games">
      <div className="games-header">
        <h1>Daily Games</h1>
        <p>Play daily games to earn extra rewards</p>
      </div>

      {error && <div className="game-error">{error}</div>}

      <div className="games-grid">
        <div className="game-card">
          <div className="game-icon">
            <i className="fas fa-compact-disc"></i>
          </div>
          <h3>Daily Spin</h3>
          <p>Spin the wheel to win up to {NAIRA_SIGN}1000</p>
          <button 
            onClick={() => playGame('daily-spin')} 
            disabled={loading}
            className="spin-button"
          >
            {loading ? 'Spinning...' : 'Spin Now'}
          </button>
        </div>

        <div className="game-card">
          <div className="game-icon">
            <i className="fas fa-ticket-alt"></i>
          </div>
          <h3>Scratch Card</h3>
          <p>Reveal your prize by scratching the card</p>
          <button 
            onClick={() => playGame('scratch-card')} 
            disabled={loading}
            className="scratch-button"
          >
            {loading ? 'Scratching...' : 'Scratch Now'}
          </button>
        </div>

        <div className="game-card">
          <div className="game-icon">
            <i className="fas fa-puzzle-piece"></i>
          </div>
          <h3>Daily Quiz</h3>
          <p>Answer questions to earn rewards</p>
          <button 
            onClick={() => playGame('quiz')} 
            disabled={loading}
            className="answer-button"
          >
            {loading ? 'Loading...' : 'Play Now'}
          </button>
        </div>
      </div>

      {gameResult && (
        <div className="game-result">
          <h2>Game Result</h2>
          <div className={`result-box ${gameResult.reward > 0 ? 'win' : 'lose'}`}>
            <i className={`fas ${gameResult.reward > 0 ? 'fa-trophy' : 'fa-times-circle'}`}></i>
            <h3>{gameResult.reward > 0 ? `You won $${gameResult.reward.toFixed(2)}!` : 'Try again tomorrow!'}</h3>
            <p>{gameResult.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;