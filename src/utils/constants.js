// App constants
export const APP_CONSTANTS = {
  APP_NAME: 'META_SHARK',
  CURRENCY: 'NGN',
  MIN_WITHDRAWAL: 1000,
  MAX_CONTENT_SUBMISSIONS: {
    pro: 50,
    silver: 20
  },
  WITHDRAWAL_TIMEFRAMES: {
    pro: '1-2 hours',
    silver: '24-48 hours'
  },
  SUPPORT_EMAIL: 'support@metashark.com',
  WHATSAPP_NUMBER: '+2349028526056'
};

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login/',
  SIGNUP: '/api/signup-with-coupon/',
  PROFILE: '/api/profile/',
  CONTENT_SUBMISSION: '/api/content/',
  WITHDRAWAL: '/api/withdrawal/',
  PACKAGES: '/api/packages/',
  VALIDATE_COUPON: '/api/validate-coupon/'
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'metashark_token',
  USER_DATA: 'metashark_user',
  PACKAGE_TIER: 'metashark_tier'
};