// Package feature configurations
export const PACKAGE_FEATURES = {
  pro: {
    label: 'PRO',
    color: '#FFD700',
    bgColor: 'linear-gradient(135deg, #FFD700, #FFA500)',
    icon: 'fas fa-crown',
    dailyReward: 1000,
    referralBonus: 4000,
    withdrawalSpeed: 'fast',
    features: [
      'Auto claim reward',
      '₦4,000 per referred user',
      '₦1,000 daily login bonus',
      'Fast withdrawal processing',
      'Priority support'
    ]
  },
  silver: {
    label: 'SILVER',
    color: '#C0C0C0',
    bgColor: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)',
    icon: 'fas fa-star',
    dailyReward: 700,
    referralBonus: 3000,
    withdrawalSpeed: 'standard',
    features: [
      'Manual features',
      '₦3,000 per referred user',
      '₦700 daily game bonus',
      'Standard withdrawal processing',
      'Basic support'
    ]
  }
};

// Get package features by tier
export const getPackageFeatures = (tier) => {
  return PACKAGE_FEATURES[tier] || PACKAGE_FEATURES.silver;
};

// Check if user has specific feature
export const hasFeature = (userTier, feature) => {
  const features = getPackageFeatures(userTier);
  return features.features.includes(feature);
};

// Get package badge info
export const getPackageBadgeInfo = (tier) => {
  const packageInfo = getPackageFeatures(tier);
  return {
    label: packageInfo.label,
    color: packageInfo.color,
    bgColor: packageInfo.bgColor,
    icon: packageInfo.icon
  };
};