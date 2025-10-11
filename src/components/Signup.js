import React, { useState, useEffect, useCallback } from 'react';
//import axios from 'axios';
import '../styles/Auth.css';

const Signup = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    couponCode: ''
  });
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [couponValid, setCouponValid] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Package selection, 2: Registration
  const [packagesLoading, setPackagesLoading] = useState(true);

  console.log('Current step:', step);
  console.log('Packages data:', packages);
  console.log('Packages loading:', packagesLoading);

  // Mock packages data - use this if API fails
  const mockPackages = [
    {
      id: 1,
      name: 'Pro Package',
      type: 'pro',
      price: 10000,
      description: 'Premium package with automatic features',
      features: [
        'Auto claim reward',
        'Earn ₦4,000 per referred user',
        '₦1,000 daily login bonus',
        'Fast withdrawal processing',
        'Priority support'
      ]
    },
    {
      id: 2,
      name: 'Silver Package',
      type: 'silver',
      price: 8000,
      description: 'Standard package with manual features',
      features: [
        'Manual features',
        'Earn ₦3,000 per referred user',
        '₦700 daily game bonus',
        'Standard withdrawal processing',
        'Basic support'
      ]
    }
  ];

  
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = useCallback(async () => {
    try {
      setPackagesLoading(true);
      // Try to fetch from API first
      //const response = await axios.get('/api/packages/');
      setPackages(mockPackages);
    } catch (error) {
      console.error('Error fetching packages, using mock data:', error);
      // Use mock data if API fails
      setPackages(mockPackages);
    } finally {
      setPackagesLoading(false);
    }
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateCoupon = async () => {
    if (!formData.couponCode) {
      setError('Please enter a coupon code');
      return;
    }

    try {
      // Mock coupon validation for now
      setTimeout(() => {
        const mockPackage = mockPackages.find(p => p.type === 'pro'); // Default to pro for demo
        setCouponValid(mockPackage);
        setSelectedPackage(mockPackage);
        setError('');
      }, 500);
    } catch (error) {
      setCouponValid(false);
      setError('Error validating coupon code');
    }
  };

  const redirectToWhatsApp = (packageType) => {
    const packageInfo = packages.find(p => p.type === packageType) || mockPackages.find(p => p.type === packageType);
    const message = `Hello! I want to purchase the ${packageInfo.name} for ₦${packageInfo.price.toLocaleString()}. 
    Please generate a coupon code for me.`;
    const encodedMessage = encodeURIComponent(message);
    // Replace with your actual WhatsApp number
    window.open(`https://wa.me/message/6RA3GBWCYXUWP1?text=${encodedMessage}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

    try {
      // Mock signup for now
      setTimeout(() => {
        const mockUser = {
          id: 1,
          username: formData.username,
          email: formData.email,
          package: selectedPackage,
          wallet_balance: 0,
          referral_code: 'META' + Math.random().toString(36).substr(2, 5).toUpperCase()
        };
        
        const mockToken = 'mock_jwt_token_' + Date.now();
        onLogin(mockToken, mockUser);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError('Signup failed. Please try again.');
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

          {packagesLoading ? (
            <div className="loading-packages">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading packages...</p>
            </div>
          ) : (
            <div className="packages-grid">
              {(packages.length > 0 ? packages : mockPackages).map(pkg => (
                <div key={pkg.id} className="package-card">
                  <div className="package-header">
                    <h3>{pkg.name}</h3>
                    <div className="package-price">₦{pkg.price.toLocaleString()}</div>
                  </div>
                  
                  <div className="package-description">
                    {pkg.description}
                  </div>
                  
                  <div className="package-features">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <i className="fas fa-check"></i>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className="whatsapp-button"
                    onClick={() => redirectToWhatsApp(pkg.type)}
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
              Valid coupon for {couponValid.name} (₦{couponValid.price.toLocaleString()})
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
              />
              <button type="button" onClick={validateCoupon} className="validate-button">
                Validate
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
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            />
          </div>

          <button type="submit" disabled={loading || !couponValid} className="auth-button">
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