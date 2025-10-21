import React, { useState, useEffect } from 'react';
import { referralsAPI, profileAPI } from '../services/apiService';
import { getPackageFeatures } from '../utils/packageFeatures';
import '../styles/ReferralSystem.css';

const ReferralSystem = ({ user }) => {
  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState({
    total_earned: 0,
    total_referrals: 0,
    pending_earnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [referralsData, statsData, profileData] = await Promise.all([
        referralsAPI.getReferrals(),
        referralsAPI.getReferralStats(),
        profileAPI.getProfile()
      ]);
      
      console.log('Referrals data:', referralsData);
      console.log('Stats data:', statsData);
      console.log('Profile data:', profileData);
      
      setReferrals(referralsData || []);
      
      // Handle different response formats for stats
      let processedStats = {
        total_earned: 0,
        total_referrals: 0,
        pending_earnings: 0
      };
      
      if (statsData) {
        processedStats = {
          total_earned: statsData.total_earned || statsData.totalEarnings || 0,
          total_referrals: statsData.total_referrals || statsData.totalReferrals || 0,
          pending_earnings: statsData.pending_earnings || statsData.pendingEarnings || 0
        };
      }
      
      setReferralStats(processedStats);
      setUserProfile(profileData);

    } catch (error) {
      console.error('Error fetching referral data:', error);
      setError('Failed to load referral data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralCode = userProfile?.referral_code || user?.referral_code;
    
    if (!referralCode) {
      alert('Referral code not available yet. Please try again later.');
      return;
    }

    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Calculate total earned from referrals array as fallback
  const calculateTotalEarned = () => {
    if (referrals.length === 0) return 0;
    return referrals.reduce((total, referral) => total + parseFloat(referral.reward_earned || 0), 0);
  };

  // Calculate pending earnings as fallback
  const calculatePendingEarnings = () => {
    if (referrals.length === 0) return 0;
    return referrals
      .filter(referral => !referral.is_paid)
      .reduce((total, referral) => total + parseFloat(referral.reward_earned || 0), 0);
  };

  const userFeatures = getPackageFeatures(user?.package_tier);

  if (loading) {
    return (
      <div className="referral-loading">
        <i className="fas fa-spinner fa-spin"></i>
        Loading referral data...
      </div>
    );
  }

  return (
    <div className="referral-system">
      <div className="referral-header">
        <h1>Referral Program</h1>
        <p>Earn ₦3000 for Silver package referrals and ₦4000 for Pro package referrals</p>
      </div>

      {error && (
        <div className="referral-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="referral-stats">
        <div className="referral-stat">
          <h3>₦{(referralStats.total_earned || calculateTotalEarned()).toLocaleString()}</h3>
          <p>Total Referral Earnings</p>
        </div>
        <div className="referral-stat">
          <h3>{referralStats.total_referrals || referrals.length}</h3>
          <p>Total Referrals</p>
        </div>
        <div className="referral-stat">
          <h3>₦{(referralStats.pending_earnings || calculatePendingEarnings()).toLocaleString()}</h3>
          <p>Pending Earnings</p>
        </div>
      </div>

      <div className="referral-share">
        <h2>Your Referral Code</h2>
        <div className="referral-code-box">
          <code>{userProfile?.referral_code || user?.referral_code || 'Loading...'}</code>
          <button onClick={copyReferralLink} className="copy-button">
            {copied ? (
              <>
                <i className="fas fa-check"></i> Copied!
              </>
            ) : (
              <>
                <i className="fas fa-copy"></i> Copy Link
              </>
            )}
          </button>
        </div>
        <p className="referral-note">
          Share your referral link with friends. 
          You'll earn ₦3000 when they purchase a Silver package or ₦4000 when they purchase a Pro package.
          Earnings are credited immediately when your referral completes registration.
        </p>
      </div>

      <div className="referral-benefits">
        <h3>💰 Referral Benefits</h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <i className="fas fa-gift"></i>
            <div>
              <strong>₦3,000 Bonus</strong>
              <p>For each friend who joins with Silver package</p>
            </div>
          </div>
          <div className="benefit-item">
            <i className="fas fa-crown"></i>
            <div>
              <strong>₦4,000 Bonus</strong>
              <p>For each friend who joins with Pro package</p>
            </div>
          </div>
          <div className="benefit-item">
            <i className="fas fa-bolt"></i>
            <div>
              <strong>Instant Payment</strong>
              <p>Earnings added to your wallet immediately</p>
            </div>
          </div>
        </div>
      </div>

      <div className="referral-list">
        <h2>Your Referrals ({referrals.length})</h2>
        {referrals.length === 0 ? (
          <div className="no-referrals">
            <i className="fas fa-users"></i>
            <p>No referrals yet. Share your link to start earning!</p>
            <small>Your referral code: {userProfile?.referral_code || user?.referral_code}</small>
          </div>
        ) : (
          <div className="referral-items">
            {referrals.map(referral => (
              <div key={referral.id} className="referral-item">
                <div className="referral-info">
                  <h4>{referral.referee?.username || referral.referee_name || 'Unknown User'}</h4>
                  <p>
                    Joined: {referral.referral_date ? new Date(referral.referral_date).toLocaleDateString() : 'Date unavailable'}
                    {referral.referee_package && ` • ${referral.referee_package.charAt(0).toUpperCase() + referral.referee_package.slice(1)} Package`}
                  </p>
                </div>
                <div className="referral-earning">
                  <span className="amount">+₦{parseFloat(referral.reward_earned || 0).toLocaleString()}</span>
                  <span className={`status ${referral.is_paid ? 'paid' : 'pending'}`}>
                    {referral.is_paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralSystem;