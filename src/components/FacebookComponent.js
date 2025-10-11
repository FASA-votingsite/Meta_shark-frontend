import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/PlatformComponent.css';

const FacebookComponent = () => {
  const [balance, setBalance] = useState(0);
  const [formData, setFormData] = useState({
    video_url: '',
    description: ''
  });
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0
  });

  useEffect(() => {
    fetchUserData();
    fetchSubmissions();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/dashboard/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(response.data.wallet_balance);
      
      // Calculate Facebook-specific stats
      const facebookSubmissions = response.data.recent_submissions.filter(
        sub => sub.platform === 'facebook'
      );
      const approved = facebookSubmissions.filter(sub => sub.status === 'approved');
      const pending = facebookSubmissions.filter(sub => sub.status === 'pending');
      
      const facebookEarnings = approved.reduce((sum, sub) => sum + parseFloat(sub.earnings), 0);
      
      setStats({
        totalEarnings: facebookEarnings,
        approvedSubmissions: approved.length,
        pendingSubmissions: pending.length
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage('Error loading data');
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/content/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter Facebook submissions only
      const facebookSubmissions = response.data.filter(
        submission => submission.platform === 'facebook'
      );
      setSubmissions(facebookSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setMessage('Error loading submissions');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/content/', 
        {
          ...formData,
          platform: 'facebook'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setMessage('Facebook video submitted successfully! It will be reviewed shortly.');
      setFormData({ video_url: '', description: '' });
      fetchSubmissions();
      fetchUserData();
    } catch (error) {
      console.error('Error submitting content:', error);
      setMessage(error.response?.data?.error || 'Error submitting video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="status-badge approved">Approved</span>;
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      case 'rejected':
        return <span className="status-badge rejected">Rejected</span>;
      default:
        return <span className="status-badge pending">Pending</span>;
    }
  };

  return (
    <div className="platform-component">
      <div className="platform-header">
        <div className="platform-title">
          <i className="fab fa-facebook platform-icon"></i>
          <h1>Facebook Content</h1>
        </div>
        <p>Earn money from your Facebook videos and reels</p>
      </div>

      <div className="platform-stats">
        <div className="platform-stat">
          <h3>₦{balance.toLocaleString()}</h3>
          <p>Total Balance</p>
        </div>
        <div className="platform-stat">
          <h3>₦{stats.totalEarnings.toLocaleString()}</h3>
          <p>Facebook Earnings</p>
        </div>
        <div className="platform-stat">
          <h3>{submissions.length}</h3>
          <p>Total Submissions</p>
        </div>
        <div className="platform-stat">
          <h3>{stats.approvedSubmissions}</h3>
          <p>Approved Videos</p>
        </div>
      </div>

      <div className="submission-card">
        <h2>Submit New Facebook Video</h2>
        <form onSubmit={handleSubmit} className="submission-form">
          <div className="form-group">
            <label>Facebook Video URL *</label>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="https://www.facebook.com/watch/?v=123456789"
              required
            />
            <small className="input-hint">
              Format: https://www.facebook.com/watch/?v=video_id
            </small>
          </div>
          
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your video content for better review"
              rows="3"
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-upload"></i> Submit Facebook Video
              </>
            )}
          </button>
        </form>
        
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            <i className={`fas ${message.includes('Error') ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
            {message}
          </div>
        )}
      </div>

      <div className="submissions-list">
        <h3>Your Facebook Submissions</h3>
        
        {submissions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-video"></i>
            <p>You haven't submitted any Facebook videos yet</p>
            <small>Submit your first Facebook video to start earning!</small>
          </div>
        ) : (
          <div className="submission-items">
            {submissions.map(submission => (
              <div key={submission.id} className="submission-item">
                <div className="submission-info">
                  <div className="submission-url">
                    <a href={submission.video_url} target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-facebook"></i>
                      {submission.video_url.length > 50 
                        ? `${submission.video_url.substring(0, 50)}...` 
                        : submission.video_url
                      }
                    </a>
                    {submission.description && (
                      <p className="submission-description">{submission.description}</p>
                    )}
                  </div>
                  
                  <div className="submission-details">
                    <div className="submission-date">
                      {new Date(submission.submission_date).toLocaleDateString()}
                    </div>
                    
                    <div className="submission-status">
                      {getStatusBadge(submission.status)}
                    </div>
                    
                    {submission.earnings > 0 && (
                      <div className="submission-earnings">
                        <i className="fas fa-naira-sign"></i>
                        {parseFloat(submission.earnings).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookComponent;