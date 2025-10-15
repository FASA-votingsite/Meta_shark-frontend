import { API_BASE_URL } from '../config/environment';

// Token management
export const getToken = () => localStorage.getItem('metashark_token');
export const setToken = (token) => localStorage.setItem('metashark_token', token);
export const removeToken = () => localStorage.removeItem('metashark_token');
       
// User management
export const getUser = () => {
  const userStr = localStorage.getItem('metashark_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user) => {
  localStorage.setItem('metashark_user', JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem('metashark_user');
};

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Token ${token}`; // Use 'Token' not 'Bearer'
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
        console.log('Error response:', errorData); // Debug log
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

// Authentication API calls
export const authAPI = {
  // Login user - FIXED ENDPOINT
  login: async (username, password) => {
    const response = await apiRequest('/api/auth/login/', {
      method: 'POST',
      body: { 
        username, 
        password
      },
    });

    if (response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
    }

    return response;
  },

  // Register user with coupon - FIXED ENDPOINT
  register: async (userData) => {
    const response = await apiRequest('/api/auth/register/', {
      method: 'POST',
      body: userData,
    });

    if (response.token && response.user) {
      setToken(response.token);
      setUser(response.user);
    }

    return response;
  },

  // Validate coupon code - FIXED ENDPOINT
  validateCoupon: async (couponCode) => {
    return await apiRequest('/api/auth/validate-coupon/', {
      method: 'POST',
      body: { coupon_code: couponCode },
    });
  },

  // Logout user
  logout: () => {
    removeToken();
    removeUser();
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getToken();
  }
};

export default authAPI;