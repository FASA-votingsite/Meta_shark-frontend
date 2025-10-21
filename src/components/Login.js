import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/authService';
import '../styles/Auth.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    // Basic validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Sending login data:', { 
        username: formData.username, 
        password: '***' // Don't log actual password
      });
      
      const response = await authAPI.login(formData.username, formData.password);
      console.log('✅ Login response:', response);
      
      if (response.token && response.user) {
        onLogin(response);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Debug login function (temporary)
  const debugLogin = async (username, password) => {
    try {
      console.log('🔐 Debug: Attempting login...');
      
      const response = await fetch('https://meta-shark-backend.onrender.com/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });
      
      console.log('🔐 Debug: Response status:', response.status);
      
      const responseText = await response.text();
      console.log('🔐 Debug: Raw response:', responseText);
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} - ${responseText}`);
      }
      
      try {
        const data = JSON.parse(responseText);
        return data;
      } catch (parseError) {
        console.error('🔐 Debug: JSON parse error:', parseError);
        throw new Error('Server returned invalid JSON');
      }
    } catch (error) {
      console.error('🔐 Debug: Login error:', error);
      throw error;
    }
  };

  const handleDebugSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await debugLogin(formData.username, formData.password);
      
      if (response.token && response.user) {
        onLogin(response);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Login to META_SHARK</h2>
          <p>Access your content monetization account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label>WhatsApp Number or Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter WhatsApp number or username"
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
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <a href="/signup">Sign up here</a></p>
          <p><a href="/forgot-password">Forgot your password?</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;