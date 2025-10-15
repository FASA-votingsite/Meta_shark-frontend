import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './services/authService';

// Import components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import TikTokComponent from './components/TikTokComponent';
import InstagramComponent from './components/InstagramComponent';
import FacebookComponent from './components/FacebookComponent';
import ReferralSystem from './components/ReferralSystem';
import Games from './components/Games';
import Withdrawal from './components/Withdrawal';
import ButBar from './components/ButBar';
import ContentSubmission from './components/ContentSubmission';

// Import CSS
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      // Simply check if we have a token and user data
      if (authAPI.isAuthenticated()) {
        const savedUser = authAPI.getUser();
        if (savedUser) {
          setUser(savedUser);
        } else {
          // User data is missing but token exists - clear everything
          authAPI.clearAuth();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear any corrupted auth data
      authAPI.clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (token, userData) => {
    authAPI.setToken(token);
    authAPI.setUser(userData);
    setUser(userData);
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
  };

  if (loading) {
    return <div className="app-loading">Loading META_SHARK...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/tiktok" element={<TikTokComponent />} />
              <Route path="/instagram" element={<InstagramComponent />} />
              <Route path="/facebook" element={<FacebookComponent />} />
              <Route path="/referrals" element={<ReferralSystem user={user} />} />
              <Route path="/games" element={<Games />} />
              <Route path="/withdrawal" element={<Withdrawal user={user} />} />
              <Route path="/submit-content" element={<ContentSubmission />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;