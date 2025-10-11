import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Auth.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for temporary login - will work with ANY username/password
  const MOCK_USER = {
    id: 1,
    username: 'demo_user',
    email: 'demo@metashark.com',
    wallet_balance: 150.75,
    referral_code: 'META123',
    total_earnings: 325.50
  };

  const MOCK_TOKEN = 'mock_jwt_token_12345';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Always use mock data for now - will work with any input
    const USE_MOCK_DATA = true;

    if (USE_MOCK_DATA) {
      // Use the entered username or default to 'demo_user'
      const userToLogin = {
        ...MOCK_USER,
        username: formData.username || 'demo_user',
        email: formData.username.includes('@') ? formData.username : 'demo@metashark.com'
      };
      
      // Simulate API call delay
      setTimeout(() => {
        onLogin(MOCK_TOKEN, userToLogin);
        setLoading(false);
      }, 1000);
    }
    
    /*else {
      try {
        // Real API call (commented out for now)
        const response = await axios.post('/api/auth/login/', formData);
        const { token, user } = response.data;
        onLogin(token, user);
      } catch (error) {
        setError(error.response?.data?.error || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } */
  }; 

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Login to META_SHARK</h2>
          <p>Access your content monetization account</p>
          <p style={{color: '#3498db', fontSize: '14px', marginTop: '10px'}}>
            Demo mode: Use any username/password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label>Username or Email</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter any value for demo"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter any value for demo"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <a href="/signup">Sign up here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;