import React, { useState, useEffect } from 'react';
import { gamesAPI } from '../services/apiService';
import '../styles/Games.css';

const Games = () => {
  const [gameResults, setGameResults] = useState({});
  const [loadingStates, setLoadingStates] = useState({
    daily_spin: false,
    scratch_card: false,
    quiz: false,
    daily_login: false
  });
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
    setLoadingStates(prev => ({ ...prev, [gameType]: true }));
    setError('');
    setGameResults(prev => ({ ...prev, [gameType]: null }));

    try {
      const result = await gamesAPI.playGame(gameType);
      setGameResults(prev => ({ ...prev, [gameType]: result }));
      await fetchGameHistory(); // Refresh history
    } catch (error) {
      setError(error.message || `Failed to play ${getGameName(gameType)}. Please try again.`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [gameType]: false }));
    }
  };

  const claimDailyLogin = async () => {
    setLoadingStates(prev => ({ ...prev, daily_login: true }));
    setError('');

    try {
      const result = await gamesAPI.claimDailyLogin();
      setGameResults(prev => ({ ...prev, daily_login: result }));
      await fetchGameHistory(); // Refresh history
    } catch (error) {
      setError(error.message || 'Failed to claim daily login bonus.');
    } finally {
      setLoadingStates(prev => ({ ...prev, daily_login: false }));
    }
  };

  const getGameResult = (gameType) => {
    return gameResults[gameType];
  };

  return (
    <div className="games">
      <div className="games-header">
        <h1>Daily Games & Rewards</h1>
        <p>Play daily games to earn extra rewards</p>
      </div>

      {error && <div className="game-error">{error}</div>}

      <div className="games-grid">
        {/* Daily Spin */}
        <div className="game-card">
          <div className="game-icon">
            <i className="fas fa-compact-disc"></i>
          </div>
          <h3>Daily Spin</h3>
          <p>Spin the wheel to win up to ₦1,000</p>
          <button 
            onClick={() => playGame('daily_spin')} 
            disabled={loadingStates.daily_spin}
            className="game-button"
          >
            {loadingStates.daily_spin ? 'Spinning...' : 'Spin Now'}
          </button>
          {getGameResult('daily_spin') && (
            <div className="game-result-mini">
              {getGameResult('daily_spin').reward > 0 ? (
                <span className="win">+₦{getGameResult('daily_spin').reward}</span>
              ) : (
                <span className="lose">Try again!</span>
              )}
            </div>
          )}
        </div>

        {/* Scratch Card */}
        <div className="game-card">
          <div className="game-icon">
            <i className="fas fa-ticket-alt"></i>
          </div>
          <h3>Scratch Card</h3>
          <p>Reveal your prize by scratching the card</p>
          <button 
            onClick={() => playGame('scratch_card')} 
            disabled={loadingStates.scratch_card}
            className="game-button"
          >
            {loadingStates.scratch_card ? 'Scratching...' : 'Scratch Now'}
          </button>
          {getGameResult('scratch_card') && (
            <div className="game-result-mini">
              {getGameResult('scratch_card').reward > 0 ? (
                <span className="win">+₦{getGameResult('scratch_card').reward}</span>
              ) : (
                <span className="lose">Try again!</span>
              )}
            </div>
          )}
        </div>

        {/* Daily Quiz */}
        <div className="game-card">
          <div className="game-icon">
            <i className="fas fa-puzzle-piece"></i>
          </div>
          <h3>Daily Quiz</h3>
          <p>Answer questions to earn rewards</p>
          <button 
            onClick={() => playGame('quiz')} 
            disabled={loadingStates.quiz}
            className="game-button"
          >
            {loadingStates.quiz ? 'Loading...' : 'Play Now'}
          </button>
          {getGameResult('quiz') && (
            <div className="game-result-mini">
              {getGameResult('quiz').reward > 0 ? (
                <span className="win">+₦{getGameResult('quiz').reward}</span>
              ) : (
                <span className="lose">Try again!</span>
              )}
            </div>
          )}
        </div>

        {/* Daily Login */}
        <div className="game-card">
          <div className="game-icon">
            <i className="fas fa-sign-in-alt"></i>
          </div>
          <h3>Daily Login</h3>
          <p>Claim your daily login bonus</p>
          <button 
            onClick={claimDailyLogin} 
            disabled={loadingStates.daily_login}
            className="game-button login"
          >
            {loadingStates.daily_login ? 'Claiming...' : 'Claim Bonus'}
          </button>
          {getGameResult('daily_login') && (
            <div className="game-result-mini">
              {getGameResult('daily_login').bonus_amount > 0 ? (
                <span className="win">+₦{getGameResult('daily_login').bonus_amount}</span>
              ) : (
                <span className="lose">Already claimed!</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Individual Game Results */}
      {Object.entries(gameResults).map(([gameType, result]) => (
        result && (
          <div key={gameType} className="game-result-individual">
            <h3>{getGameName(gameType)} Result</h3>
            <div className={`result-box ${result.reward > 0 || result.bonus_amount > 0 ? 'win' : 'lose'}`}>
              <i className={`fas ${(result.reward > 0 || result.bonus_amount > 0) ? 'fa-trophy' : 'fa-times-circle'}`}></i>
              <h3>
                {(result.reward > 0 || result.bonus_amount > 0) 
                  ? `You won ₦${(result.reward || result.bonus_amount).toLocaleString()}!` 
                  : 'Try again tomorrow!'
                }
              </h3>
              <p>{result.message || 'Come back tomorrow for another chance!'}</p>
            </div>
          </div>
        )
      ))}

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
    case 'daily_login': return 'fa-sign-in-alt';
    default: return 'fa-gamepad';
  }
};

const getGameName = (gameType) => {
  switch (gameType) {
    case 'daily_spin': return 'Daily Spin';
    case 'scratch_card': return 'Scratch Card';
    case 'quiz': return 'Daily Quiz';
    case 'daily_login': return 'Daily Login';
    default: return gameType;
  }
};

export default Games;