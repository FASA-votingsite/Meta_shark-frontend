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
import BottomNavbar from './components/BottomNavbar';
import ContentSubmission from './components/ContentSubmission';
import DailyLogin from './components/DailyLogin';

// Import CSS
import './styles/App.css';

// Layout component for pages with bottom navbar
const LayoutWithNavbar = ({ children, user, onLogout }) => {
  return (
    <div className="app-layout">
      {user && <Navbar user={user} onLogout={onLogout} />}
      <div className="main-content with-bottom-navbar">
        {children}
      </div>
      <BottomNavbar user={user} onLogout={onLogout} />
    </div>
  );
};

// Layout for auth pages (no navbars)
const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      {children}
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      console.log('🔐 Checking authentication...');
      
      // Check if we have a token and user data in localStorage
      const token = authAPI.getToken();
      const savedUser = authAPI.getUser();
      
      if (token && savedUser) {
        console.log('✅ Found token and user data in localStorage');
        
        // Set user immediately for better UX
        setUser(savedUser);
        
        // Try to validate token with backend (but don't block UI)
        validateTokenWithBackend(token);
      } else {
        console.log('❌ No valid authentication data found');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const validateTokenWithBackend = async (token) => {
    try {
      console.log('🔍 Validating token with backend...');
      
      // Use a simple API call that doesn't require much processing
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://meta-shark-backend.onrender.com'}/api/dashboard/`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.ok) {
        console.log('✅ Token is valid');
        // Token is valid, keep user logged in
        return true;
      } else {
        console.log('❌ Token validation failed:', response.status);
        handleLogout();
        return false;
      }
    } catch (error) {
      console.log('⚠️ Token validation error (might be backend spin-down):', error);
      // Don't logout on network errors - might be temporary backend issue
      // Keep user logged in and let individual API calls handle auth errors
      return true;
    }
  };

  const handleLogin = (userData) => {
    console.log('🔑 Login successful, setting user:', userData);
    
    // Make sure we have both token and user data
    if (userData.token && userData.user) {
      authAPI.setToken(userData.token);
      authAPI.setUser(userData.user);
      setUser(userData.user);
    } else {
      console.error('❌ Invalid login response:', userData);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    authAPI.logout();
    setUser(null);
  };

  // Show loading only on initial app load
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading META_SHARK...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {!user ? (
            // AUTH ROUTES - No navbar
            <Route path="*" element={
              <AuthLayout>
                <Routes>
                  <Route path="/login" element={<Login onLogin={handleLogin} />} />
                  <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
                  <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
              </AuthLayout>
            } />
          ) : (
            // PROTECTED ROUTES - With navbar
            <Route path="*" element={
              <LayoutWithNavbar user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard user={user} />} />
                  <Route path="/tiktok" element={<TikTokComponent user={user} />} />
                  <Route path="/instagram" element={<InstagramComponent user={user} />} />
                  <Route path="/facebook" element={<FacebookComponent user={user} />} />
                  <Route path="/referrals" element={<ReferralSystem user={user} />} />
                  <Route path="/games" element={<Games user={user} />} />
                  <Route path="/withdrawal" element={<Withdrawal user={user} />} />
                  <Route path="/submit-content" element={<ContentSubmission user={user} />} />
                  <Route path="/daily-login" element={<DailyLogin user={user} />} />
                  
                  {/* More menu routes */}
                  <Route path="/rewards" element={
                    <div className="page-container">
                      <h1>Rewards</h1>
                      <p>Rewards page coming soon!</p>
                    </div>
                  } />
                  <Route path="/terms" element={
                    <div className="page-container">
                      <h1>Terms & Conditions</h1>
                      <p>Terms and conditions page coming soon!</p>
                    </div>
                  } />
                  <Route path="/settings" element={
                    <div className="page-container">
                      <h1>Settings</h1>
                      <p>Settings page coming soon!</p>
                    </div>
                  } />
                  
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </LayoutWithNavbar>
            } />
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;