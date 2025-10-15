import React, { useState, useEffect } from 'react';
import { gamesAPI } from '../services/apiService';
import '../styles/Games.css';

const Games = () => {
  const [gameResult, setGameResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameHistory, setGameHistory] = useState([]);

  useEffect(() => {
    fetchGameHistory();
  }, []);

  const fetchGameHistory = async () => {
    try {
      const history = await gamesAPI.getGameHistory();
      setGameHistory(history);
    } catch (error) {
      console.error('Error fetching game history:', error);
    }
  };

  const playGame = async (gameType) => {
    setLoading(true);
    setError('');
    setGameResult(null);

    try {
      const result = await gamesAPI.playGame(gameType);
      setGameResult(result);
      fetchGameHistory(); // Refresh history
    } catch (error) {
      setError(error.message || 'Failed to play game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const claimDailyLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await gamesAPI.claimDailyLogin();
      setGameResult(result);
    } catch (error) {
      setError(error.message || 'Failed to claim daily login bonus.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="games">
      <div className="games-header">
        <h1>Daily Games & Rewards</h1>
        <p>Play daily games to earn extra rewards</p>
      </div>

      {error && <div className="game-error">{error}</div>}

      <div className="games-grid">
        <div className="game-card">
          <div className="game-icon">
            <i className="fas fa-compact-disc"></i>
          </div>
          <h3>Daily Spin</h3>
          <p>Spin the wheel to win up to ₦1,000</p>
          <button 
            onClick={() => playGame('daily_spin')} 
            disabled={loading}
            className="game-button"
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
            onClick={() => playGame('scratch_card')} 
            disabled={loading}
            className="game-button"
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
            className="game-button"
          >
            {loading ? 'Loading...' : 'Play Now'}
          </button>
        </div>

        <div className="game-card">
          <div className="game-icon">
            <i className="fas fa-sign-in-alt"></i>
          </div>
          <h3>Daily Login</h3>
          <p>Claim your daily login bonus</p>
          <button 
            onClick={claimDailyLogin} 
            disabled={loading}
            className="game-button login"
          >
            {loading ? 'Claiming...' : 'Claim Bonus'}
          </button>
        </div>
      </div>

      {gameResult && (
        <div className="game-result">
          <h2>Game Result</h2>
          <div className={`result-box ${gameResult.reward > 0 ? 'win' : 'lose'}`}>
            <i className={`fas ${gameResult.reward > 0 ? 'fa-trophy' : 'fa-times-circle'}`}></i>
            <h3>{gameResult.reward > 0 ? `You won ₦${gameResult.reward.toLocaleString()}!` : 'Try again tomorrow!'}</h3>
            <p>{gameResult.message}</p>
          </div>
        </div>
      )}

      <div className="game-history">
        <h2>Recent Game History</h2>
        {gameHistory.length === 0 ? (
          <p className="no-history">No game history yet</p>
        ) : (
          <div className="history-list">
            {gameHistory.slice(0, 10).map(game => (
              <div key={game.id} className="history-item">
                <div className="game-type">
                  <i className={`fas ${getGameIcon(game.game_type)}`}></i>
                  <span>{getGameName(game.game_type)}</span>
                </div>
                <div className="game-date">
                  {new Date(game.participation_date).toLocaleDateString()}
                </div>
                <div className="game-reward">
                  +₦{parseFloat(game.reward_earned).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const getGameIcon = (gameType) => {
  switch (gameType) {
    case 'daily_spin': return 'fa-compact-disc';
    case 'scratch_card': return 'fa-ticket-alt';
    case 'quiz': return 'fa-puzzle-piece';
    default: return 'fa-gamepad';
  }
};

const getGameName = (gameType) => {
  switch (gameType) {
    case 'daily_spin': return 'Daily Spin';
    case 'scratch_card': return 'Scratch Card';
    case 'quiz': return 'Daily Quiz';
    default: return gameType;
  }
};

export default Games;