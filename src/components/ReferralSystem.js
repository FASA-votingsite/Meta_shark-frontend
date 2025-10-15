import React, { useState, useEffect } from 'react';
import { referralsAPI } from '../services/apiService';
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

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const [referralsData, statsData] = await Promise.all([
        referralsAPI.getReferrals(),
        referralsAPI.getReferralStats()
      ]);
      
      setReferrals(referralsData);
      setReferralStats(statsData);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${user.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const userFeatures = getPackageFeatures(user.package_tier);

  if (loading) {
    return <div className="referral-loading">Loading referral data...</div>;
  }

  return (
    <div className="referral-system">
      <div className="referral-header">
        <h1>Referral Program</h1>
        <p>Earn {userFeatures.referralBonus} for each friend you refer to META_SHARK</p>
      </div>

      <div className="referral-stats">
        <div className="referral-stat">
          <h3>₦{referralStats.totalEarnings.toLocaleString()}</h3>
          <p>Total Referral Balance</p>
        </div>
        <div className="referral-stat">
          <h3>{referralStats.totalReferrals}</h3>
          <p>Total Referrals</p>
        </div>
        <div className="referral-stat">
          <h3>₦{referralStats.pendingEarnings.toLocaleString()}</h3>
          <p>Pending Earnings</p>
        </div>
      </div>

      <div className="referral-share">
        <h2>Your Referral Code</h2>
        <div className="referral-code-box">
          <code>{user.referral_code}</code>
          <button onClick={copyReferralLink} className="copy-button">
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <p className="referral-note">
          Share your referral link with friends. You'll earn {userFeatures.referralBonus} when they sign up and purchase a package.
        </p>
      </div>

      <div className="referral-list">
        <h2>Your Referrals</h2>
        {referrals.length === 0 ? (
          <p className="no-referrals">You haven't referred anyone yet</p>
        ) : (
          <div className="referral-items">
            {referrals.map(referral => (
              <div key={referral.id} className="referral-item">
                <div className="referral-info">
                  <h4>{referral.referee.username}</h4>
                  <p>Joined on {new Date(referral.referral_date).toLocaleDateString()}</p>
                </div>
                <div className="referral-earning">
                  <span className="earning-amount">+₦{referral.reward_earned.toLocaleString()}</span>
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