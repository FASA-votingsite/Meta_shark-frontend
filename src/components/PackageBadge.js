// components/PackageBadge.js
import React from 'react';
import '../styles/PackageBadge.css';

const PackageBadge = ({ tier }) => {
  const getPackageInfo = (tier) => {
    switch (tier) {
      case 'pro':
        return {
          label: 'PRO',
          color: '#FFD700', // Gold
          bgColor: 'linear-gradient(135deg, #FFD700, #FFA500)',
          icon: 'fas fa-crown'
        };
      case 'silver':
        return {
          label: 'SILVER',
          color: '#C0C0C0', // Silver
          bgColor: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)',
          icon: 'fas fa-star'
        };
      default:
        return {
          label: 'BASIC',
          color: '#CD7F32', // Bronze
          bgColor: 'linear-gradient(135deg, #CD7F32, #8B4513)',
          icon: 'fas fa-user'
        };
    }
  };

  const packageInfo = getPackageInfo(tier);

  return (
    <div className="package-badge" style={{ background: packageInfo.bgColor }}>
      <i className={packageInfo.icon}></i>
      <span>{packageInfo.label}</span>
    </div>
  );
};

export default PackageBadge;