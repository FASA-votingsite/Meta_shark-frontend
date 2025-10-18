import React, { useState, useEffect } from 'react';
import { gamesAPI } from '../services/apiService';
import '../styles/Games.css';

const Games = () => {
  const [gameResults, setGameResults] = useState({});
  const [loadingStates, setLoadingStates] = useState({
    daily_spin: false,
    scratch_card: false,
    quiz: false
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

  const getGameResult = (gameType) => {
    return gameResults[gameType];
  };

  return (
    <div className="games">
      <div className="games-header">
        <h1>🎮 Daily Games</h1>
        <p>Play exciting games daily to earn extra rewards!</p>
      </div>

      {error && (
        <div className="game-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="games-grid">
        {/* Daily Spin */}
        <div className="game-card">
          <div className="game-icon spin-icon">
            <i className="fas fa-compact-disc"></i>
          </div>
          <h3>Daily Spin Wheel</h3>
          <p>Spin to win up to ₦1,000 in rewards</p>
          <div className="game-reward-range">
            <small>Reward: ₦200 - ₦1,000</small>
          </div>
          <button 
            onClick={() => playGame('daily_spin')} 
            disabled={loadingStates.daily_spin}
            className={`game-button ${loadingStates.daily_spin ? 'loading' : ''}`}
          >
            {loadingStates.daily_spin ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Spinning...
              </>
            ) : (
              <>
                <i className="fas fa-play"></i> Spin Now
              </>
            )}
          </button>
          {getGameResult('daily_spin') && (
            <div className="game-result-mini">
              {getGameResult('daily_spin').reward > 0 ? (
                <span className="win">🎉 +₦{getGameResult('daily_spin').reward}</span>
              ) : (
                <span className="lose">😔 Try again tomorrow!</span>
              )}
            </div>
          )}
        </div>

        {/* Scratch Card */}
        <div className="game-card">
          <div className="game-icon scratch-icon">
            <i className="fas fa-ticket-alt"></i>
          </div>
          <h3>Scratch Card</h3>
          <p>Reveal hidden prizes by scratching the card</p>
          <div className="game-reward-range">
            <small>Reward: ₦150 - ₦800</small>
          </div>
          <button 
            onClick={() => playGame('scratch_card')} 
            disabled={loadingStates.scratch_card}
            className={`game-button ${loadingStates.scratch_card ? 'loading' : ''}`}
          >
            {loadingStates.scratch_card ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Scratching...
              </>
            ) : (
              <>
                <i className="fas fa-play"></i> Scratch Now
              </>
            )}
          </button>
          {getGameResult('scratch_card') && (
            <div className="game-result-mini">
              {getGameResult('scratch_card').reward > 0 ? (
                <span className="win">🎉 +₦{getGameResult('scratch_card').reward}</span>
              ) : (
                <span className="lose">😔 Try again tomorrow!</span>
              )}
            </div>
          )}
        </div>

        {/* Daily Quiz */}
        <div className="game-card">
          <div className="game-icon quiz-icon">
            <i className="fas fa-puzzle-piece"></i>
          </div>
          <h3>Daily Quiz</h3>
          <p>Answer fun questions to earn instant rewards</p>
          <div className="game-reward-range">
            <small>Reward: ₦100 - ₦500</small>
          </div>
          <button 
            onClick={() => playGame('quiz')} 
            disabled={loadingStates.quiz}
            className={`game-button ${loadingStates.quiz ? 'loading' : ''}`}
          >
            {loadingStates.quiz ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Loading...
              </>
            ) : (
              <>
                <i className="fas fa-play"></i> Start Quiz
              </>
            )}
          </button>
          {getGameResult('quiz') && (
            <div className="game-result-mini">
              {getGameResult('quiz').reward > 0 ? (
                <span className="win">🎉 +₦{getGameResult('quiz').reward}</span>
              ) : (
                <span className="lose">😔 Try again tomorrow!</span>
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
            <div className={`result-box ${result.reward > 0 ? 'win' : 'lose'}`}>
              <i className={`fas ${result.reward > 0 ? 'fa-trophy' : 'fa-times-circle'}`}></i>
              <h3>
                {result.reward > 0 
                  ? `You won ₦${result.reward.toLocaleString()}!` 
                  : 'Try again tomorrow!'
                }
              </h3>
              <p>{result.message || 'Come back tomorrow for another chance!'}</p>
              {result.reward > 0 && (
                <div className="celebration">
                  🎉 Congratulations! 🎉
                </div>
              )}
            </div>
          </div>
        )
      ))}

      <div className="game-history">
        <h2>📊 Recent Game History</h2>
        {gameHistory.length === 0 ? (
          <div className="no-history">
            <i className="fas fa-gamepad"></i>
            <p>No game history yet</p>
            <small>Play your first game to start earning!</small>
          </div>
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

      <div className="games-info">
        <h3>ℹ️ Game Rules</h3>
        <div className="rules-grid">
          <div className="rule-item">
            <i className="fas fa-sync-alt"></i>
            <div>
              <strong>Daily Limit</strong>
              <p>You can play each game once per day</p>
            </div>
          </div>
          <div className="rule-item">
            <i className="fas fa-clock"></i>
            <div>
              <strong>Reset Time</strong>
              <p>Games reset at midnight (00:00)</p>
            </div>
          </div>
          <div className="rule-item">
            <i className="fas fa-gift"></i>
            <div>
              <strong>Instant Rewards</strong>
              <p>Earnings are added to your wallet immediately</p>
            </div>
          </div>
        </div>
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