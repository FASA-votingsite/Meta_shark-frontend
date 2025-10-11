import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ReferralSystem.css';
import { NAIRA_SIGN } from '@bilmapay/react-currency-symbols';

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
      const [statsResponse, referralsResponse] = await Promise.all([
        axios.get('/api/referrals/stats/'),
        axios.get('/api/referrals/')
      ]);
      
      setReferralStats(statsResponse.data);
      setReferrals(referralsResponse.data);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${user.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="referral-loading">Loading referral data...</div>;
  }

  return (
    <div className="referral-system">
      <div className="referral-header">
        <h1>Referral Program</h1>
        <p>Earn up to 4000 Naira for each friend you refer to META_SHARK</p>
      </div>

      <div className="referral-stats">
        <div className="referral-stat">
          <h3>{NAIRA_SIGN}{referralStats.totalEarnings.toFixed(2)}</h3>
          <p>Total Referral Balance</p>
        </div>
        <div className="referral-stat">
          <h3>{referralStats.totalReferrals}</h3>
          <p>Total Referrals</p>
        </div>
        <div className="referral-stat">
          <h3>{NAIRA_SIGN}{referralStats.pendingEarnings.toFixed(2)}</h3>
          <p>Pending Earnings</p>
        </div>
      </div>

      <div className="referral-share">
        <h2>Your Referral Code</h2>
        <div className="referral-code-box">
          <code>{user.referralCode}</code>
          <button onClick={copyReferralLink} className="copy-button">
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <p className="referral-note">
          Share your referral link with friends. 
          You'll earn 4000 Naira when they sign up and submit their first content.
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
                  <span className="earning-amount">+{NAIRA_SIGN}{referral.reward_earned}</span>
                  <span className={`status {NAIRA_SIGN}{referral.status}`}>{referral.status}</span>
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