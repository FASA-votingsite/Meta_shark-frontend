import { API_BASE_URL } from '../config/environment';
import { authAPI } from './authService';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = authAPI.getToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }), // Changed from Token to Bearer
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
      authAPI.logout(); // Use logout instead of clearAuth
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

// Add token refresh logic
const apiRequestWithRefresh = async (endpoint, options = {}) => {
  try {
    return await apiRequest(endpoint, options);
  } catch (error) {
    if (error.message.includes('Authentication failed')) {
      // Try to refresh token once
      try {
        await authAPI.refreshToken();
        return await apiRequest(endpoint, options);
      } catch (refreshError) {
        authAPI.logout();
        throw new Error('Session expired. Please login again.');
      }
    }
    throw error;
  }
};

export const dashboardAPI = {
  getDashboardData: () => apiRequestWithRefresh('/api/dashboard/'),
  getEarningsBreakdown: () => apiRequestWithRefresh('/api/dashboard/earnings/'),
  getRecentActivity: () => apiRequestWithRefresh('/api/dashboard/activity/')
};

// Content Submission API - Use apiRequestWithRefresh for authenticated endpoints
export const contentAPI = {
  getSubmissions: () => apiRequestWithRefresh('/api/content/'),
  submitContent: (data) => 
    apiRequestWithRefresh('/api/content/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateSubmission: (submissionId, data) =>
    apiRequestWithRefresh(`/api/content/${submissionId}/`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteSubmission: (submissionId) =>
    apiRequestWithRefresh(`/api/content/${submissionId}/`, {
      method: 'DELETE'
    })
};

// Games API - Use apiRequestWithRefresh
// In your apiService.js, update the gamesAPI section:
export const gamesAPI = {
  playGame: (gameType) =>
    apiRequestWithRefresh('/api/games/play/', {
      method: 'POST',
      body: JSON.stringify({ game_type: gameType })
    }),
  
  getGameHistory: () => 
    apiRequestWithRefresh('/api/games/history/', {
      method: 'GET'
    }),
  
  claimDailyLogin: () =>
    apiRequestWithRefresh('/api/daily-login/', {
      method: 'POST'
    })
};

// Referrals API
export const referralsAPI = {
  getReferrals: () => 
    apiRequestWithRefresh('/api/referrals/', {
      method: 'GET'
    }),
  
  getReferralStats: () =>
    apiRequestWithRefresh('/api/referrals/stats/', {
      method: 'GET'
    })
};
// Other APIs remain the same...
export const packagesAPI = {
  getAllPackages: () => apiRequest('/api/packages/'),
  getPackageDetails: (packageId) => apiRequest(`/api/packages/${packageId}/`)
};

// Wallet & Transactions API
export const walletAPI = {
  getBalance: () => apiRequestWithRefresh('/api/wallet/balance/'),
  getTransactions: () => apiRequestWithRefresh('/api/transactions/'),
  requestWithdrawal: (withdrawalData) =>
    apiRequestWithRefresh('/api/withdrawals/', {
      method: 'POST',
      body: JSON.stringify(withdrawalData)
    }),
  getWithdrawalHistory: () => apiRequestWithRefresh('/api/withdrawals/')
};

// User Profile API
export const profileAPI = {
  getProfile: () => apiRequestWithRefresh('/api/profile/'),
  updateProfile: (profileData) =>
    apiRequestWithRefresh('/api/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
};

// Platform-specific APIs
export const platformAPI = {
  tiktok: {
    getSubmissions: () => contentAPI.getSubmissions().then(submissions => 
      submissions.filter(sub => sub.platform === 'tiktok')
    ),
    submitVideo: (videoData) => 
      contentAPI.submitContent({ ...videoData, platform: 'tiktok' })
  },
  
  instagram: {
    getSubmissions: () => contentAPI.getSubmissions().then(submissions => 
      submissions.filter(sub => sub.platform === 'instagram')
    ),
    submitVideo: (videoData) => 
      contentAPI.submitContent({ ...videoData, platform: 'instagram' })
  },
  
  facebook: {
    getSubmissions: () => contentAPI.getSubmissions().then(submissions => 
      submissions.filter(sub => sub.platform === 'facebook')
    ),
    submitVideo: (videoData) => 
      contentAPI.submitContent({ ...videoData, platform: 'facebook' })
  }
};

export { apiRequest, apiRequestWithRefresh };

const apiServices = {
  apiRequest,
  apiRequestWithRefresh,
  dashboard: dashboardAPI,
  packages: packagesAPI,
  content: contentAPI,
  referrals: referralsAPI,
  games: gamesAPI,
  wallet: walletAPI,
  profile: profileAPI,
  platform: platformAPI
};

export default apiServices;