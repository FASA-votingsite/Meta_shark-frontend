// components/UpgradePanel.js
import React from 'react';
import axios from 'axios';

const UpgradePanel = ({ user, onUpgrade }) => {
  const handleUpgrade = async (packageType) => {
    try {
      const response = await axios.post('/api/upgrade-package/', {
        package_type: packageType
      });
      
      if (response.data.success) {
        onUpgrade(response.data.user);
        alert('Package upgraded successfully!');
      }
    } catch (error) {
      alert('Upgrade failed: ' + error.response?.data?.error);
    }
  };

  const upgradeOptions = {
    silver: {
      price: 5000,
      features: ['₦3,000 per referral', '₦700 daily rewards', 'Standard processing']
    },
    pro: {
      price: 10000,
      features: ['₦4,000 per referral', '₦1,000 daily login', 'Auto-claim', 'Fast withdrawals']
    }
  };

  return (
    <div className="upgrade-panel">
      <h3>Upgrade Your Package</h3>
      
      {user.package_tier === 'silver' && (
        <div className="upgrade-option">
          <h4>Upgrade to Pro</h4>
          <p>₦{upgradeOptions.pro.price.toLocaleString()}</p>
          <ul>
            {upgradeOptions.pro.features.map((feature, index) => (
              <li key={index}>✓ {feature}</li>
            ))}
          </ul>
          <button onClick={() => handleUpgrade('pro')}>
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
};