import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/authService';
import '../styles/Auth.css';

const Signup = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    couponCode: '',
    whatsappNumber: ''
  });
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [couponValid, setCouponValid] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Package selection, 2: Registration
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = useCallback(async () => {
    try {
      setPackagesLoading(true);
      const response = await fetch('/api/packages/');
      if (response.ok) {
        const packagesData = await response.json();
        setPackages(packagesData);
      } else {
        throw new Error('Failed to fetch packages');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Failed to load packages. Please try again later.');
    } finally {
      setPackagesLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateCoupon = async () => {
    if (!formData.couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    try {
      setValidatingCoupon(true);
      setError('');
      
      const response = await authAPI.validateCoupon(formData.couponCode);
      
      if (response.valid) {
        setCouponValid(response.package);
        setSelectedPackage(response.package);
        setError('');
      } else {
        setCouponValid(false);
        setError(response.detail || 'Invalid coupon code');
      }
    } catch (error) {
      setCouponValid(false);
      setError(error.message || 'Error validating coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const redirectToWhatsApp = (packageType) => {
    const packageInfo = packages.find(p => p.package_type === packageType);
    if (!packageInfo) return;

    const message = `Hello! I want to purchase the ${packageInfo.name} package for ₦${parseFloat(packageInfo.price).toLocaleString()}. Please provide me with a coupon code.`;
    const encodedMessage = encodeURIComponent(message);
    // Replace with your actual WhatsApp number
    window.open(`https://wa.me/2349012345678?text=${encodedMessage}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!couponValid) {
      setError('Please validate your coupon code first');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        coupon_code: formData.couponCode,
        referral_code: formData.referralCode || '',
        phone_number: formData.whatsappNumber || ''
      };

      const response = await authAPI.register(userData);
      
      if (response.token && response.user) {
        onLogin(response.token, response.user);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      setError(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Package Selection
  if (step === 1) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Choose Your META_SHARK Package</h2>
            <p>Select a package and get a coupon code to start monetizing your content</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {packagesLoading ? (
            <div className="loading-packages">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading packages...</p>
            </div>
          ) : (
            <div className="packages-grid">
              {packages.map(pkg => (
                <div key={pkg.id} className="package-card">
                  <div className="package-header">
                    <h3>{pkg.name}</h3>
                    <div className="package-price">₦{parseFloat(pkg.price).toLocaleString()}</div>
                  </div>
                  
                  <div className="package-description">
                    {pkg.description}
                  </div>
                  
                  <div className="package-features">
                    {pkg.features && pkg.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <i className="fas fa-check"></i>
                        <span>{feature}</span>
                      </div>
                    ))}
                    <div className="feature-item">
                      <i className="fas fa-check"></i>
                      <span>Referral Bonus: ₦{parseFloat(pkg.referral_bonus).toLocaleString()}</span>
                    </div>
                    <div className="feature-item">
                      <i className="fas fa-check"></i>
                      <span>Daily Login: ₦{parseFloat(pkg.daily_login_bonus).toLocaleString()}</span>
                    </div>
                    <div className="feature-item">
                      <i className="fas fa-check"></i>
                      <span>Daily Game: ₦{parseFloat(pkg.daily_game_bonus).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <button 
                    className="whatsapp-button"
                    onClick={() => redirectToWhatsApp(pkg.package_type)}
                  >
                    <i className="fab fa-whatsapp"></i>
                    Purchase {pkg.name} on WhatsApp
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="auth-footer">
            <p>Already have a coupon code? 
              <button onClick={() => setStep(2)} className="link-button">
                Click here to register
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Registration Form
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Register with Coupon Code</h2>
          <p>Enter your coupon code to create your account</p>
          <button onClick={() => setStep(1)} className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Packages
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          {couponValid && (
            <div className="coupon-success">
              <i className="fas fa-check-circle"></i>
              Valid coupon for {couponValid.name} (₦{parseFloat(couponValid.price).toLocaleString()})
            </div>
          )}
          
          <div className="form-group">
            <label>Coupon Code *</label>
            <div className="coupon-input-group">
              <input
                type="text"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleChange}
                placeholder="Enter your coupon code"
                required
                disabled={validatingCoupon}
              />
              <button 
                type="button" 
                onClick={validateCoupon} 
                className="validate-button"
                disabled={validatingCoupon}
              >
                {validatingCoupon ? 'Validating...' : 'Validate'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="form-group">
            <label>WhatsApp Number</label>
            <input
              type="tel"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              placeholder="Enter your WhatsApp number"
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min. 6 characters)"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="form-group">
            <label>Referral Code (Optional)</label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="Enter referral code if any"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !couponValid} 
            className="auth-button"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;