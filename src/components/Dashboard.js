import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/apiService';
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardAPI.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  if (!dashboardData) {
    return <div className="dashboard-error">No data available</div>;
  }

  const packageTier = getUserPackageTier(user);
  const userFeatures = getPackageFeatures(packageTier);
  const { recent_transactions, referral_stats } = dashboardData;
  const stats = getSafeStats(dashboardData);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="user-welcome">
          <h1>
            Welcome, {user.username} 
            <PackageBadge tier={packageTier} />
          </h1>
          <p>Package: {userFeatures.label} - Enjoy your exclusive benefits!</p>
        </div>
        
        <div className="wallet-overview">
          <div className="wallet-balance">
            <h2>Total Balance</h2>
            <div className="balance-amount">{formatCurrency(stats.totalEarnings)}</div>
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
            <h3>{NAIRA_SIGN}{stats.totalEarnings.toFixed(2)}</h3>
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
            </div>
          </div>
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          {recent_transactions && recent_transactions.length === 0 ? (
            <p className="no-activity">No recent activity</p>
          ) : (
            <div className="activity-list">
              {recent_transactions && recent_transactions.slice(0, 5).map(transaction => (
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