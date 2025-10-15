// Environment configuration for different deployment environments
const environments = {
  development: {
    apiBaseUrl: 'http://localhost:8000',
    mediaBaseUrl: 'http://localhost:8000',
    environment: 'development'
  },
  staging: {
    apiBaseUrl: 'https://meta-shark-backend.onrender.com',
    mediaBaseUrl: 'https://meta-shark-backend.onrender.com',
    environment: 'staging'
  },
  production: {
    apiBaseUrl: 'https://meta-shark-backend.onrender.com',
    mediaBaseUrl: 'https://meta-shark-backend.onrender.com',
    environment: 'production'
  }
};

// Determine current environment
const getCurrentEnvironment = () => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'development';
  } else if (hostname.includes('staging') || hostname.includes('preview')) {
    return 'staging';
  } else {
    return 'production';
  }
};

// Get current config
const currentEnv = getCurrentEnvironment();
const config = environments[currentEnv];

// Export configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || config.apiBaseUrl;
export const MEDIA_BASE_URL = process.env.REACT_APP_MEDIA_URL || config.mediaBaseUrl;
export const ENVIRONMENT = config.environment;

console.log(`Running in ${ENVIRONMENT} environment`);
console.log(`API Base URL: ${API_BASE_URL}`);

export default {
  API_BASE_URL,
  MEDIA_BASE_URL,
  ENVIRONMENT
};