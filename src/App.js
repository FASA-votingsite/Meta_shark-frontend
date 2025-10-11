import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Import all components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ContentSubmission from './components/ContentSubmission';
import ReferralSystem from './components/ReferralSystem';
import Games from './components/Games';
import Withdrawal from './components/Withdrawal';
import ButBar from './components/ButBar';
import TikTokComponent from './components/TikTokComponent';
import InstagramComponent from './components/InstagramComponent';
import FacebookComponent from './components/FacebookComponent';


// Import CSS files from the styles directory
import './styles/App.css';

// Set base URL for axios based on environment
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      // This is a mock function until your backend is ready
      // Replace with actual API call when backend is available
       // Mock condition - set to true for demo
      const USE_MOCK_DATA = true;

       if (USE_MOCK_DATA) {
      // Mock user data
      const mockUser = {
        id: 1,
        username: 'demo_user',
        email: 'demo@metashark.com',
        Total_balance: 150.75,
        referral_code: 'META123',
        total_earnings: 325.50
      };
      setUser(mockUser);
    } else {
      // Real API call
      const response = await axios.get('/api/profile/');
      setUser(response.data);
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  } finally {
      setLoading(false);
    }
  };

  const handleLogin = (token, userData) => {
    console.log('Login function called');
    console.log('Token', token);
    console.log('User data:', userData);
    console.log('Login successful:', userData);
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return <div className="app-loading">Loading META_SHARK...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}

        
        <main className="main-content">
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <>
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/submit-content" element={<ContentSubmission />} />
                <Route path="/referrals" element={<ReferralSystem user={user} />} />
                <Route path="/games" element={<Games />} />
                <Route path="/withdrawal" element={<Withdrawal user={user} />} />
                <Route path="/tiktok" element={<TikTokComponent />} />
                <Route path="/instagram" element={<InstagramComponent />} />
                <Route path="/facebook" element={<FacebookComponent />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            )}
          </Routes>
        </main>
        {user && <ButBar user={user} onLogout={handleLogout} />}
      </div>
    </Router>
  );
}

export default App;