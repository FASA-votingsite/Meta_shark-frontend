import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/apiService';
import { authAPI } from '../services/authService';
import { 
  getPackageFeatures, 
  formatCurrency, 
  getUserPackageTier,
  NAIRA_SIGN,
  getSafeStats 
} from '../utils/packageFeatures';
import PackageBadge from './PackageBadge';
import '../styles/Dashboard.css';

const Dashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📊 Fetching dashboard data...');
      const data = await dashboardAPI.getDashboardData();
      console.log('📊 Dashboard data received:', data);
      setDashboardData(data);
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      
      // Handle authentication errors
      if (error.message.includes('Authentication failed') || 
          error.message.includes('Invalid token') ||
          error.message.includes('401') ||
          error.message.includes('403')) {
        
        console.log('🔐 Authentication error detected, redirecting to login...');
        authAPI.clearAuth();
        navigate('/login');
        return;
      }
      
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  // Calculate total balance from all sources
  const calculateTotalBalance = (data) => {
    if (!data) return 0;
    
    const { earnings_breakdown = {}, referral_stats = {} } = data;
    
    // Sum all earnings sources
    const contentEarnings = earnings_breakdown.content || 0;
    const referralEarnings = referral_stats.total_earned || 0;
    const gameEarnings = earnings_breakdown.games || 0;
    const dailyLoginEarnings = earnings_breakdown.daily_login || 0;
    
    // Calculate platform-specific earnings from submissions
    const platformEarnings = calculatePlatformEarnings(data.recent_submissions);
    const totalPlatformEarnings = platformEarnings.tiktok + platformEarnings.instagram + platformEarnings.facebook;
    
    // Total balance is sum of all earnings sources
    const totalBalance = contentEarnings + referralEarnings + gameEarnings + dailyLoginEarnings;
    
    console.log('💰 Earnings Breakdown:', {
      content: contentEarnings,
      referral: referralEarnings,
      games: gameEarnings,
      dailyLogin: dailyLoginEarnings,
      platforms: totalPlatformEarnings,
      total: totalBalance
    });
    
    return totalBalance;
  };

  // Calculate platform-specific earnings from submissions
  const calculatePlatformEarnings = (submissions = []) => {
    const platformEarnings = {
      tiktok: 0,
      instagram: 0,
      facebook: 0
    };

    submissions.forEach(submission => {
      if ((submission.status === 'approved' || submission.status === 'paid') && submission.earnings) {
        const platform = submission.platform?.toLowerCase();
        if (platform in platformEarnings) {
          platformEarnings[platform] += parseFloat(submission.earnings) || 0;
        }
      }
    });

    return platformEarnings;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Unable to Load Dashboard</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={handleRetry} className="retry-button">
            <i className="fas fa-redo"></i> Try Again
          </button>
          <button onClick={handleLogout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    );
  }

  // If we have partial data but an error occurred
  if (error && dashboardData) {
    console.warn('⚠️ Dashboard loaded with errors:', error);
  }

  // Use safe fallback data if dashboardData is null
  const safeData = dashboardData || {
    wallet_balance: user?.wallet_balance || 0,
    total_earnings: user?.total_earnings || 0,
    package: user?.package || null,
    submission_count: 0,
    referral_count: 0,
    recent_transactions: [],
    recent_submissions: [],
    referral_stats: { total_referrals: 0, total_earned: 0 },
    earnings_breakdown: {
      content: 0,
      referrals: 0,
      games: 0,
      daily_login: 0
    }
  };

  const packageTier = getUserPackageTier(user);
  const userFeatures = getPackageFeatures(packageTier);
  const { recent_transactions, referral_stats, earnings_breakdown, recent_submissions } = safeData;
  
  // Calculate total balance from all sources
  const totalBalance = calculateTotalBalance(safeData);
  
  // Calculate platform-specific earnings
  const platformEarnings = calculatePlatformEarnings(recent_submissions);
  
  // Create stats object with calculated values
  const stats = {
    totalEarnings: totalBalance,
    tiktokEarnings: platformEarnings.tiktok,
    instagramEarnings: platformEarnings.instagram,
    facebookEarnings: platformEarnings.facebook,
    totalReferrals: referral_stats?.total_referrals || 0,
    referralEarnings: referral_stats?.total_earned || 0,
    gameEarnings: earnings_breakdown?.games || 0,
    dailyLoginEarnings: earnings_breakdown?.daily_login || 0,
    contentEarnings: earnings_breakdown?.content || 0
  };

  return (
    <div className="dashboard">
      {/* Show error banner if we have an error but still showing data */}
      {error && dashboardData && (
        <div className="dashboard-warning">
          <i className="fas fa-exclamation-circle"></i>
          <span>Some data may not be up to date. {error}</span>
          <button onClick={handleRetry} className="retry-small">
            Retry
          </button>
        </div>
      )}

      <div className="dashboard-header">
        <div className="user-welcome">
          <h1>
            Welcome, {user?.username || 'User'} 
            <PackageBadge tier={packageTier} />
          </h1>
          <p>Package: {userFeatures.label} - Enjoy your exclusive benefits!</p>
        </div>
        
        <div className="wallet-overview">
          <div className="wallet-balance">
            <h2>Total Balance</h2>
            <div className="balance-amount">{formatCurrency(totalBalance)}</div>
            <div className="balance-breakdown">
              <small>
                Content: {formatCurrency(stats.contentEarnings)} • 
                Referrals: {formatCurrency(stats.referralEarnings)} • 
                Games: {formatCurrency(stats.gameEarnings)} • 
                Daily Login: {formatCurrency(stats.dailyLoginEarnings)}
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className='board'>
        <div className='meta-layout'>
          <img src="/logo192.png" alt="META_SHARK" />
          <span>META_SHARK</span>
        </div>

        <div className="main-stat-card">
          <div className="main-stat-info">
            <p>Total Balance</p>
            <h3>{NAIRA_SIGN}{totalBalance.toFixed(2)}</h3>
            <div className="balance-sources">
              <span>All Earnings Combined</span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <Link to='/tiktok' className='link-properties'>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fab fa-tiktok"></i>
              </div>
              <div className="stat-info">
                <h3>{NAIRA_SIGN}{stats.tiktokEarnings.toFixed(2)}</h3>
                <p>TikTok Balance {'>'}</p>
                <small>From {recent_submissions?.filter(s => s.platform === 'tiktok' && (s.status === 'approved' || s.status === 'paid')).length || 0} videos</small>
              </div>
            </div>
          </Link>

          <Link to='/instagram' className='link-properties'>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fab fa-instagram"></i>
              </div>
              <div className="stat-info">
                <h3>{NAIRA_SIGN}{stats.instagramEarnings.toFixed(2)}</h3>
                <p>Instagram Balance {'>'}</p>
                <small>From {recent_submissions?.filter(s => s.platform === 'instagram' && (s.status === 'approved' || s.status === 'paid')).length || 0} videos</small>
              </div>
            </div>
          </Link>

          <Link to='/facebook' className='link-properties'>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fab fa-facebook-f"></i>
              </div>
              <div className="stat-info">
                <h3>{NAIRA_SIGN}{stats.facebookEarnings.toFixed(2)}</h3>
                <p>FaceBook Balance {'>'}</p>
                <small>From {recent_submissions?.filter(s => s.platform === 'facebook' && (s.status === 'approved' || s.status === 'paid')).length || 0} videos</small>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className='act-list'>
        <Link to='/withdrawal' className='link-properties'>
          <div className='act-card'>
            <div className="act-icon">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <h3>Withdrawal</h3>
            <small>Available: {formatCurrency(totalBalance)}</small>
          </div>
        </Link>
        
        <Link to='/referrals' className='link-properties'>
          <div className='act-card'>
            <div className='act-icon'>
              <i className="fas fa-users"></i>
            </div>
            <div className='act-info'>
              <h3>Referral</h3>
              <p>{NAIRA_SIGN}{stats.referralEarnings.toFixed(2)} {'>'}</p>
              <small>{stats.totalReferrals} referrals</small>
            </div>
          </div>
        </Link> 
        
        <Link to="/games" className='link-properties'>
          <div className='act-card'>
            <div className='act-icon'>
              <i className="fas fa-gamepad"></i>
            </div>
            <div className='act-info'>
              <h3>Games</h3>
              <p>{NAIRA_SIGN}{stats.gameEarnings.toFixed(2)} {'>'}</p>
              <small>Daily rewards</small>
            </div>
          </div>
        </Link>
        
        <Link to="/daily-login" className='link-properties'>
          <div className='act-card'>
            <div className='act-icon'>
              <i className="fas fa-sign-in-alt"></i>
            </div>
            <div className='act-info'>
              <h3>Daily Login</h3>
              <p>{NAIRA_SIGN}{stats.dailyLoginEarnings.toFixed(2)} {'>'}</p>
              <small>Bonus earnings</small>
            </div>
          </div>
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          {(!recent_transactions || recent_transactions.length === 0) ? (
            <p className="no-activity">No recent activity</p>
          ) : (
            <div className="activity-list">
              {recent_transactions.slice(0, 5).map(transaction => (
                <div key={transaction.id} className="activity-item">
                  <div className="activity-icon">
                    <i className={`fas ${getTransactionIcon(transaction.transaction_type)}`}></i>
                  </div>
                  <div className="activity-details">
                    <p>{transaction.description}</p>
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                  </div>
                  <div className={`activity-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="referral-stats">
          <h3>Referral Stats</h3>
          <div className="referral-info">
            <div className="referral-stat">
              <h4>{stats.totalReferrals}</h4>
              <p>Total Referrals</p>
            </div>
            <div className="referral-stat">
              <h4>{formatCurrency(stats.referralEarnings)}</h4>
              <p>Total Earned</p>
            </div>
          </div>
          <p className="referral-note">
            Earn {formatCurrency(userFeatures.referralBonus)} for each friend you refer!
          </p>
        </div>
      </div>

      <div className="earnings-summary">
        <h3>Earnings Summary</h3>
        <div className="earnings-breakdown">
          <div className="earnings-category">
            <div className="category-icon">
              <i className="fas fa-video"></i>
            </div>
            <div className="category-info">
              <h4>Content Earnings</h4>
              <p>{formatCurrency(stats.contentEarnings)}</p>
            </div>
          </div>
          <div className="earnings-category">
            <div className="category-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="category-info">
              <h4>Referral Earnings</h4>
              <p>{formatCurrency(stats.referralEarnings)}</p>
            </div>
          </div>
          <div className="earnings-category">
            <div className="category-icon">
              <i className="fas fa-gamepad"></i>
            </div>
            <div className="category-info">
              <h4>Game Earnings</h4>
              <p>{formatCurrency(stats.gameEarnings)}</p>
            </div>
          </div>
          <div className="earnings-category">
            <div className="category-icon">
              <i className="fas fa-sign-in-alt"></i>
            </div>
            <div className="category-info">
              <h4>Daily Login</h4>
              <p>{formatCurrency(stats.dailyLoginEarnings)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="package-benefits">
        <h3>Your {userFeatures.label} Package Benefits</h3>
        <div className="benefits-list">
          {userFeatures.features.map((feature, index) => (
            <div key={index} className="benefit-item">
              <i className="fas fa-check"></i>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getTransactionIcon = (type) => {
  switch (type) {
    case 'content': return 'fa-video';
    case 'referral': return 'fa-users';
    case 'game': return 'fa-gamepad';
    case 'daily_login': return 'fa-sign-in-alt';
    case 'payout': return 'fa-money-bill-wave';
    default: return 'fa-circle';
  }
};

export default Dashboard;