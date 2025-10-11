// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate Nigerian phone number
export const validatePhone = (phone) => {
  const re = /^(\+234|0)[789][01]\d{8}$/;
  return re.test(phone.replace(/\s/g, ''));
};

// Validate social media URLs
export const validateSocialUrl = (url, platform) => {
  const patterns = {
    tiktok: /https?:\/\/(www\.)?tiktok\.com\/@[^/]+\/video\/\d+/,
    instagram: /https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[^/]+\//,
    facebook: /https?:\/\/(www\.)?facebook\.com\/watch\/\?v=\d+/,
    twitter: /https?:\/\/(www\.)?twitter\.com\/[^/]+\/status\/\d+/
  };
  
  return patterns[platform] ? patterns[platform].test(url) : false;
};

// Validate coupon code format
export const validateCouponFormat = (code) => {
  return /^META[A-Z0-9]{6}$/.test(code);
};