import { API_BASE_URL } from '../config/environment';

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('metashark_token');
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Token ${token}`;
  }

  const config = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  // Stringify body if it's an object
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        errorMessage = errorData.detail || errorData.message || errorMessage;
        
        // Handle specific error cases
        if (errorData.username) errorMessage = errorData.username[0];
        if (errorData.password) errorMessage = errorData.password[0];
        if (errorData.non_field_errors) errorMessage = errorData.non_field_errors[0];
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fieldErrors = Object.values(errorData).flat();
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors[0];
          }
        }
      } catch (parseError) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', {
      endpoint,
      error: error.message,
      config
    });
    throw error;
  }
};

// Authentication API - Everything under authAPI
export const authAPI = {
  // Token management
  getToken: () => localStorage.getItem('metashark_token'),
  setToken: (token) => localStorage.setItem('metashark_token', token),
  removeToken: () => localStorage.removeItem('metashark_token'),
  
  // User management
  getUser: () => {
    const userStr = localStorage.getItem('metashark_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  setUser: (user) => {
    localStorage.setItem('metashark_user', JSON.stringify(user));
  },
  removeUser: () => {
    localStorage.removeItem('metashark_user');
  },

  // Clear all authentication data
  clearAuth: () => {
    localStorage.removeItem('metashark_token');
    localStorage.removeItem('metashark_user');
    console.log('🔐 Auth data cleared');
  },

  // Validate token with server (optional - for future use)
  validateToken: async () => {
    try {
      const token = authAPI.getToken();
      if (!token) return false;
      
      // This endpoint might not exist yet, so we'll handle the error
      const response = await apiRequest('/api/auth/verify-token/', {
        method: 'POST',
        body: { token }
      });
      return true;
    } catch (error) {
      console.log('❌ Token validation failed:', error.message);
      // Clear invalid token
      authAPI.clearAuth();
      return false;
    }
  },

  // API calls
  login: async (username, password) => {
    console.log('Sending login request:', { username, password });
    
    const response = await apiRequest('/api/auth/login/', {
      method: 'POST',
      body: { 
        username, 
        password
      },
    });

    console.log('Login response:', response);

    if (response.token && response.user) {
      authAPI.setToken(response.token);
      authAPI.setUser(response.user);
    }

    return response;
  },

  register: async (userData) => {
    const response = await apiRequest('/api/auth/register/', {
      method: 'POST',
      body: userData,
    });

    if (response.token && response.user) {
      authAPI.setToken(response.token);
      authAPI.setUser(response.user);
    }

    return response;
  },

  validateCoupon: async (couponCode) => {
    return await apiRequest('/api/auth/validate-coupon/', {
      method: 'POST',
      body: { coupon_code: couponCode },
    });
  },

  logout: () => {
    authAPI.clearAuth();
    window.location.href = '/login';
  },

  isAuthenticated: () => {
    return !!authAPI.getToken();
  }
};

export default authAPI;