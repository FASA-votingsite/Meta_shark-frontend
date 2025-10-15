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
    maxContentSubmissions: 50,
    supportPriority: 'high',
    features: [
      'Auto claim reward',
      '₦4,000 per referred user',
      '₦1,000 daily login bonus',
      'Fast withdrawal processing',
      'Priority support',
      'Advanced analytics'
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
    maxContentSubmissions: 20,
    supportPriority: 'normal',
    features: [
      'Manual features',
      '₦3,000 per referred user',
      '₦700 daily game bonus',
      'Standard withdrawal processing',
      'Basic support'
    ]
  }
};

// Get package features by tier - handles different data structures
export const getPackageFeatures = (packageData) => {
  if (!packageData) {
    return PACKAGE_FEATURES.silver;
  }
  
  // Handle if packageData is a string (package_tier)
  if (typeof packageData === 'string') {
    return PACKAGE_FEATURES[packageData] || PACKAGE_FEATURES.silver;
  }
  
  // Handle if packageData is an object with type
  if (packageData.type) {
    return PACKAGE_FEATURES[packageData.type] || PACKAGE_FEATURES.silver;
  }
  
  // Handle if packageData is an object with package_type
  if (packageData.package_type) {
    return PACKAGE_FEATURES[packageData.package_type] || PACKAGE_FEATURES.silver;
  }
  
  return PACKAGE_FEATURES.silver;
};

// Format currency in Naira
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₦0';
  
  // Handle both number and string inputs
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericAmount);
};

// Get package badge info
export const getPackageBadgeInfo = (packageData) => {
  const packageInfo = getPackageFeatures(packageData);
  return {
    label: packageInfo.label,
    color: packageInfo.color,
    bgColor: packageInfo.bgColor,
    icon: packageInfo.icon
  };
};

// Helper to get user's package tier from user object
export const getUserPackageTier = (user) => {
  if (!user) return 'silver';
  
  // Check different possible locations for package data
  if (user.package_tier) {
    return user.package_tier;
  }
  
  if (user.package && user.package.type) {
    return user.package.type;
  }
  
  if (user.package && user.package.package_type) {
    return user.package.package_type;
  }
  
  return 'silver';
};

// Constants for use in components
export const NAIRA_SIGN = '₦';

// Default stats structure to prevent undefined errors
export const DEFAULT_STATS = {
  totalEarnings: 0,
  tiktokEarnings: 0,
  instagramEarnings: 0,
  facebookEarnings: 0,
  totalReferrals: 0,
  referralEarnings: 0,
  gameEarnings: 0,
  dailyLoginEarnings: 0
};

// Helper to calculate platform-specific earnings from content submissions
const calculatePlatformEarnings = (contentSubmissions = []) => {
  const platformEarnings = {
    tiktok: 0,
    instagram: 0,
    facebook: 0
  };

  contentSubmissions.forEach(submission => {
    if (submission.status === 'approved' && submission.earnings) {
      const platform = submission.platform?.toLowerCase();
      if (platform in platformEarnings) {
        platformEarnings[platform] += parseFloat(submission.earnings) || 0;
      }
    }
  });

  return platformEarnings;
};

// Helper to safely get stats from dashboard data
export const getSafeStats = (dashboardData) => {
  if (!dashboardData) return DEFAULT_STATS;
  
  const { 
    earnings_breakdown = {}, 
    referral_stats = {}, 
    wallet_balance = 0,
    recent_submissions = []
  } = dashboardData;

  // Calculate platform-specific earnings from content submissions
  const platformEarnings = calculatePlatformEarnings(recent_submissions);
  
  return {
    totalEarnings: wallet_balance || 0,
    tiktokEarnings: platformEarnings.tiktok,
    instagramEarnings: platformEarnings.instagram,
    facebookEarnings: platformEarnings.facebook,
    totalReferrals: referral_stats.total_referrals || 0,
    referralEarnings: referral_stats.total_earned || 0,
    gameEarnings: earnings_breakdown.games || 0,
    dailyLoginEarnings: earnings_breakdown.daily_login || 0
  };
};