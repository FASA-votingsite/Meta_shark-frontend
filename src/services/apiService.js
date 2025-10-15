import { API_BASE_URL } from '../config/environment';
import { authAPI } from './authService'; // Import authAPI instead of getToken


// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = authAPI.getToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers: defaultHeaders
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle unauthorized/forbidden (token expired or invalid)
    if (response.status === 401 || response.status === 403) {
      console.log('🔐 Authentication failed, clearing token...');
      authAPI.clearAuth(); // Use the new method
      throw new Error('Authentication failed. Please login again.');
    }
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
        
        // Handle specific error cases
        if (errorData.username) errorMessage = errorData.username[0];
        if (errorData.password) errorMessage = errorData.password[0];
        if (errorData.non_field_errors) errorMessage = errorData.non_field_errors[0];
        
      } catch (parseError) {
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    // Handle empty responses
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', {
      endpoint,
      error: error.message
    });
    throw error;
  }
};

export const dashboardAPI = {
  getDashboardData: () => apiRequest('/api/dashboard/'),
  getEarningsBreakdown: () => apiRequest('/api/dashboard/earnings/'),
  getRecentActivity: () => apiRequest('/api/dashboard/activity/')
};

// Packages API
export const packagesAPI = {
  getAllPackages: () => apiRequest('/api/packages/'),
  getPackageDetails: (packageId) => apiRequest(`/api/packages/${packageId}/`)
};

// Content Submission API
export const contentAPI = {
  getSubmissions: () => apiRequest('/api/content/'),
  submitContent: (data) => 
    apiRequest('/api/content/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateSubmission: (submissionId, data) =>
    apiRequest(`/api/content/${submissionId}/`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteSubmission: (submissionId) =>
    apiRequest(`/api/content/${submissionId}/`, {
      method: 'DELETE'
    })
};

// Referrals API
export const referralsAPI = {
  getReferrals: () => apiRequest('/api/referrals/'),
  getReferralStats: () => apiRequest('/api/referrals/stats/')
};

// Games API
export const gamesAPI = {
  playGame: (gameType) =>
    apiRequest('/api/games/play/', {
      method: 'POST',
      body: JSON.stringify({ game_type: gameType })
    }),
  getGameHistory: () => apiRequest('/api/games/history/'),
  claimDailyLogin: () =>
    apiRequest('/api/daily-login/', {
      method: 'POST'
    })
};

// Wallet & Transactions API
export const walletAPI = {
  getBalance: () => apiRequest('/api/wallet/balance/'),
  getTransactions: () => apiRequest('/api/transactions/'),
  requestWithdrawal: (withdrawalData) =>
    apiRequest('/api/withdrawals/', {
      method: 'POST',
      body: JSON.stringify(withdrawalData)
    }),
  getWithdrawalHistory: () => apiRequest('/api/withdrawals/')
};

// User Profile API
export const profileAPI = {
  getProfile: () => apiRequest('/api/profile/'),
  updateProfile: (profileData) =>
    apiRequest('/api/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
};

// Platform-specific APIs
export const platformAPI = {
  // TikTok specific
  tiktok: {
    getSubmissions: () => contentAPI.getSubmissions().then(submissions => 
      submissions.filter(sub => sub.platform === 'tiktok')
    ),
    submitVideo: (videoData) => 
      contentAPI.submitContent({ ...videoData, platform: 'tiktok' })
  },
  
  // Instagram specific
  instagram: {
    getSubmissions: () => contentAPI.getSubmissions().then(submissions => 
      submissions.filter(sub => sub.platform === 'instagram')
    ),
    submitVideo: (videoData) => 
      contentAPI.submitContent({ ...videoData, platform: 'instagram' })
  },
  
  // Facebook specific
  facebook: {
    getSubmissions: () => contentAPI.getSubmissions().then(submissions => 
      submissions.filter(sub => sub.platform === 'facebook')
    ),
    submitVideo: (videoData) => 
      contentAPI.submitContent({ ...videoData, platform: 'facebook' })
  }
};

export { apiRequest };

// Create named export object to fix ESLint warning
const apiServices = {
  apiRequest,
  dashboard: dashboardAPI,
  packages: packagesAPI,
  content: contentAPI,
  referrals: referralsAPI,
  games: gamesAPI,
  wallet: walletAPI,
  profile: profileAPI,
  platform: platformAPI
};

// Export all APIs
export default apiServices;