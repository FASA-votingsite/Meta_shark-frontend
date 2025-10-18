import React, { useState, useEffect } from 'react';
import { gamesAPI, profileAPI } from '../services/apiService';
import { authAPI } from '../services/authService';
import '../styles/DailyLogin.css';

const DailyLogin = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loginHistory, setLoginHistory] = useState([]);
  const [streakCount, setStreakCount] = useState(0);
  const [canClaim, setCanClaim] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchLoginHistory();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await profileAPI.getProfile();
      setUserProfile(profile);
      checkDailyClaim(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const history = await gamesAPI.getGameHistory();
      const loginHistory = history.filter(game => game.game_type === 'daily_login');
      setLoginHistory(loginHistory.slice(0, 7)); // Last 7 days
      
      calculateStreak(loginHistory);
    } catch (error) {
      console.error('Error fetching login history:', error);
      // Don't show error to user for history fetch
    }
  };

  const checkDailyClaim = (profile) => {
    if (!profile) return;
    
    // Check if user already claimed today based on last_daily_login
    const today = new Date().toDateString();
    const lastLogin = profile.last_daily_login ? new Date(profile.last_daily_login).toDateString() : null;
    
    setCanClaim(lastLogin !== today);
  };

  const calculateStreak = (history) => {
    if (!history || history.length === 0) {
      setStreakCount(0);
      return;
    }

    // Sort by date descending
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.participation_date) - new Date(a.participation_date)
    );

    let streak = 0;
    let currentDate = new Date();
    
    // Check consecutive days from today backwards
    for (let i = 0; i < sortedHistory.length; i++) {
      const loginDate = new Date(sortedHistory[i].participation_date);
      const expectedDate = new Date(currentDate);
      
      // Reset time parts for date comparison
      loginDate.setHours(0, 0, 0, 0);
      expectedDate.setHours(0, 0, 0, 0);
      
      if (loginDate.getTime() === expectedDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
      } else {
        break;
      }
    }
    
    setStreakCount(streak);
  };

  const claimDailyLogin = async () => {
    if (!canClaim) {
      setError('You have already claimed your daily bonus today.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await gamesAPI.claimDailyLogin();
      setResult(response);
      setCanClaim(false);
      
      // Refresh user profile to get updated data
      await fetchUserProfile();
      
      // Refresh history after successful claim
      await fetchLoginHistory();
      
      // Show success message for longer
      setTimeout(() => {
        setResult(null);
      }, 8000);
      
    } catch (error) {
      console.error('Error claiming daily login:', error);
      if (error.message.includes('already claimed')) {
        setCanClaim(false);
        await fetchUserProfile(); // Refresh to get current status
      }
      setError(error.message || 'Failed to claim daily login bonus. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBonusAmount = () => {
    const packageType = user?.package?.type || user?.package_tier || 'silver';
    
    const bonusAmounts = {
      pro: 1000,
      silver: 700
      // Removed basic package as requested
    };
    
    return bonusAmounts[packageType] || bonusAmounts.silver;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getCurrentPackageName = () => {
    const packageType = user?.package?.type || user?.package_tier;
    
    const packageNames = {
      pro: 'Pro Package',
      silver: 'Silver Package'
    };
    
    return packageNames[packageType] || 'Silver Package';
  };

  return (
    <div className="daily-login">
      <div className="daily-login-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="header-text">
            <h1>Daily Login Bonus</h1>
            <p>Claim your daily reward and build your streak!</p>
          </div>
        </div>
        
        <div className="streak-counter">
          <div className="streak-number">{streakCount}</div>
          <div className="streak-label">Day Streak</div>
          <div className="streak-subtitle">Keep it going! 🔥</div>
        </div>
      </div>

      <div className="daily-login-content">
        <div className="bonus-card">
          <div className="bonus-icon">
            <i className="fas fa-gift"></i>
          </div>
          <div className="bonus-info">
            <h3>Today's Bonus</h3>
            <div className="bonus-amount-main">
              <span className="amount">₦{getBonusAmount().toLocaleString()}</span>
              <span className="package">{getCurrentPackageName()}</span>
            </div>
            <div className="bonus-description">
              <p>Your daily login bonus based on your current package</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {result && (
          <div className="success-message">
            <div className="success-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="success-content">
              <h3>Bonus Claimed Successfully! 🎉</h3>
              <p className="bonus-claimed">₦{result.bonus_amount || result.reward} has been added to your wallet</p>
              <p className="streak-update">Your streak is now {streakCount + 1} days! 🔥</p>
              <small>The bonus has been added to your total balance in the dashboard</small>
            </div>
          </div>
        )}

        <button 
          onClick={claimDailyLogin}
          disabled={loading || !canClaim}
          className={`claim-button ${loading ? 'loading' : ''} ${!canClaim ? 'claimed' : ''}`}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Claiming Bonus...
            </>
          ) : !canClaim ? (
            <>
              <i className="fas fa-check"></i>
              Already Claimed Today
            </>
          ) : (
            <>
              <i className="fas fa-gift"></i>
              Claim Daily Bonus
            </>
          )}
        </button>

        <div className="login-history">
          <h3>Recent Login History</h3>
          {loginHistory.length === 0 ? (
            <div className="empty-history">
              <i className="fas fa-history"></i>
              <p>No login history yet</p>
              <small>Claim your first bonus to start your streak!</small>
            </div>
          ) : (
            <div className="history-grid">
              {loginHistory.map((login, index) => (
                <div key={login.id} className={`history-item ${index === 0 ? 'latest' : ''}`}>
                  <div className="history-date">
                    {formatDate(login.participation_date)}
                    {index === 0 && <span className="latest-badge">Latest</span>}
                  </div>
                  <div className="history-bonus">
                    +₦{parseFloat(login.reward_earned).toLocaleString()}
                  </div>
                  <div className="history-status">
                    <i className="fas fa-check-circle"></i>
                    Claimed
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="login-tips">
          <h4>💡 Daily Login Tips</h4>
          <div className="tips-grid">
            <div className="tip-item">
              <i className="fas fa-sync-alt"></i>
              <div>
                <strong>Consistency Matters</strong>
                <p>Login every day to maintain your streak and earn bigger rewards</p>
              </div>
            </div>
            <div className="tip-item">
              <i className="fas fa-box-open"></i>
              <div>
                <strong>Upgrade Package</strong>
                <p>Higher packages get better daily bonuses (Pro: ₦1,000, Silver: ₦700)</p>
              </div>
            </div>
            <div className="tip-item">
              <i className="fas fa-clock"></i>
              <div>
                <strong>24-Hour Reset</strong>
                <p>Bonus resets at midnight every day. Don't miss a day!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyLogin;