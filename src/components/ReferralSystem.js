import React, { useState, useEffect } from 'react';
import { referralsAPI, profileAPI } from '../services/apiService';
import { getPackageFeatures } from '../utils/packageFeatures';
import '../styles/ReferralSystem.css';

const ReferralSystem = ({ user }) => {
  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState({
    totalEarnings: 0,
    totalReferrals: 0,
    pendingEarnings: 0
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
      
      setReferrals(referralsData || []);
      setReferralStats(statsData || { totalReferrals: 0, totalEarnings: 0, pendingEarnings: 0 });
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

    const referralLink = `https://content-monetization-platform.netlify.app/signup?ref=${referralCode}`;
    
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
        <p>Earn ₦{userFeatures?.referralBonus || '4,000'} for each friend you refer to META_SHARK</p>
      </div>

      {error && (
        <div className="referral-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="referral-stats">
        <div className="referral-stat">
          <h3>₦{referralStats.totalEarnings?.toLocaleString() || '0'}</h3>
          <p>Total Referral Balance</p>
        </div>
        <div className="referral-stat">
          <h3>{referralStats.totalReferrals || '0'}</h3>
          <p>Total Referrals</p>
        </div>
        <div className="referral-stat">
          <h3>₦{referralStats.pendingEarnings?.toLocaleString() || '0'}</h3>
          <p>Pending Earnings</p>
        </div>
      </div>

      <div className="referral-share">
        <h2>Your Referral Code</h2>
        <div className="referral-code-box">
          <code>{userProfile?.referral_code || user?.referral_code || 'META' + Math.floor(1000 + Math.random() * 9000)}</code>
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
          Share your referral link with friends. You'll earn ₦{userFeatures?.referralBonus || '4,000'} when they sign up and purchase a package.
        </p>
      </div>

      <div className="referral-list">
        <h2>Your Referrals</h2>
        {referrals.length === 0 ? (
          <div className="no-referrals">
            <i className="fas fa-users"></i>
            <p>No referrals yet. Share your link to start earning!</p>
          </div>
        ) : (
          <div className="referral-items">
            {referrals.map(referral => (
              <div key={referral.id} className="referral-item">
                <div className="referral-info">
                  <h4>{referral.referee?.username || 'Unknown User'}</h4>
                  <p>Joined: {new Date(referral.referral_date).toLocaleDateString()}</p>
                </div>
                <div className="referral-earning">
                  <span className="amount">+₦{parseFloat(referral.reward_earned || 0).toFixed(2)}</span>
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