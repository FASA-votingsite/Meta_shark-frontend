import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';
import { NAIRA_SIGN } from "@bilmapay/react-currency-symbols"
import { Link } from 'react-router-dom';
import PackageBadge from './PackageBadge';


// Add at the top of your Dashboard component
const USE_MOCK_DATA = false;

// Mock data
const MOCK_STATS = {
  totalEarnings: 325.50,
  tiktokEarnings: 45.75,
  instagramEarnings: 23.00,
  facebookEarnings: 56.00
};

const MOCK_ACTIVITY = [
  {
    id: 1,
    type: 'content',
    description: 'TikTok video submission approved',
    amount: 5.00,
    date: '2025-09-15T10:30:00Z'
  },
   {
    id: 2,
    type: 'referral',
    description: 'Referral reward - John Smith',
    amount: 10.00,
    date: '2025-09-14T16:45:00Z'
  },
  {
    id: 3,
    type: 'game',
    description: 'Daily spin wheel reward',
    amount: 2.50,
    date: '2025-09-14T09:15:00Z'
  }
];



const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    tiktokEarnings: 0,
    instagramEarnings: 0,
    facebookEarnings: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Then in your fetchDashboardData function
  const fetchDashboardData = async () => {
    try {
      if (USE_MOCK_DATA) {
        setStats(MOCK_STATS);
        setRecentActivity(MOCK_ACTIVITY);
      } else {
        const [statsResponse, activityResponse] = await Promise.all([
          axios.get('/api/dashboard/stats/'),
          axios.get('/api/dashboard/activity/')
        ]);
        
        setStats(statsResponse.data);
        setRecentActivity(activityResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isProUser = user.package_tier === 'pro';
  const isSilverUser = user.package_tier === 'silver';


  if (loading) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Hi, {user.username} <PackageBadge tier={user.package_tier} /></h1>
        
        {/* Package-specific benefits display */}
        <div className="package-benefits">
          {isProUser && (
            <div className="pro-benefits">
              <h3>🎯 Pro Package Benefits</h3>
              <ul>
                <li>₦4,000 per referral</li>
                <li>₦1,000 daily login bonus</li>
                <li>Auto-claim rewards</li>
                <li>Fast withdrawal processing</li>
              </ul>
            </div>
          )}
          
          {isSilverUser && (
            <div className="silver-benefits">
              <h3>⭐ Silver Package Benefits</h3>
              <ul>
                <li>₦3,000 per referral</li>
                <li>₦700 daily game rewards</li>
                <li>Standard withdrawal processing</li>
              </ul>
            </div>
          )}
        </div>
        {/* Conditional feature access */}
      {isProUser && (
        <div className="pro-features">
          <h3>Exclusive Pro Features</h3>
          <button className="auto-claim-btn">
            <i className="fas fa-bolt"></i> Auto Claim Rewards
          </button>
        </div>
      )}

        <p>Here's your earnings overview and recent activity</p>
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
                <p>FaceBook Balance {'>'}</p>            </div>
            </div>
          </Link>
        </div>
      </div>

      <div className='act-list'>
        <Link to='/withdrawal' className='link-properties'>
          <div className='act-card'>
            <div className="act-icon">
              <i className="fas fa-naira-sign"></i>
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
              <p>{NAIRA_SIGN}{stats.tiktokEarnings.toFixed(2)} {'>'}</p>
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
              <p>{NAIRA_SIGN}{stats.tiktokEarnings.toFixed(2)} {'>'}</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {recentActivity.length === 0 ? (
        <p className="no-activity">No recent activity to display</p>
        ) : (
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  <i className={`fas ${getActivityIcon(activity.type)}`}></i>
                </div>
                <div className="activity-details">
                  <p>{activity.description}</p>
                  <span>{new Date(activity.date).toLocaleDateString()}</span>
                </div>
                <div className={`activity-amount ${activity.amount > 0 ? 'positive' : 'negative'}`}>
                  {activity.amount > 0 ? '+' : ''}{activity.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'content': return 'fa-video';
    case 'referral': return 'fa-user-plus';
    case 'game': return 'fa-gamepad';
    case 'payout': return 'fa-money-bill-wave';
    default: return 'fa-circle';
  }
};

export default Dashboard;