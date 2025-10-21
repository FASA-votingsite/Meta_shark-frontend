import { API_BASE_URL } from '../config/environment';

// Helper function for API calls
// In your authService.js, update the apiRequest function
// Update your apiRequest function in authService.js
const apiRequest = async (endpoint, options = {}) => {
  const token = authAPI.getToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers: defaultHeaders
  };

  // Stringify body if it's an object
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    console.log(`🌐 Making API request to: ${endpoint}`, config);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    console.log(`📨 Response status: ${response.status}`, response);
    
    // Handle unauthorized/forbidden
    if (response.status === 401 || response.status === 403) {
      console.log('🔐 Authentication failed, clearing token...');
      authAPI.logout();
      throw new Error('Authentication failed. Please login again.');
    }
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let responseText = '';
      
      try {
        // First, try to get the response as text to see what's actually being returned
        responseText = await response.text();
        console.log('📝 Raw response text:', responseText);
        
        // Try to parse as JSON if it looks like JSON
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
          
          // Handle field-specific errors
          if (errorData.username) errorMessage = errorData.username[0];
          if (errorData.password) errorMessage = errorData.password[0];
          if (errorData.non_field_errors) errorMessage = errorData.non_field_errors[0];
          if (typeof errorData === 'object') {
            const fieldErrors = Object.values(errorData).flat();
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors[0];
            }
          }
        } else {
          // It's not JSON, use the raw text
          errorMessage = responseText || errorMessage;
        }
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        // Use the raw text if JSON parsing fails
        errorMessage = responseText || response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    // Handle empty responses
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
      return null;
    }
    
    // For successful responses, try to parse as JSON
    const responseText = await response.text();
    console.log('✅ Successful response text:', responseText);
    
    if (!responseText) {
      return null;
    }
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON parse error for successful response:', parseError);
      throw new Error('Invalid response format from server');
    }
    
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