import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ContentSubmission.css';

const ContentSubmission = () => {
  const [formData, setFormData] = useState({
    platform: 'tiktok',
    video_url: ''
  });
  const [message, setMessage] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('/api/content/', formData);
      setMessage('Content submitted successfully! It will be reviewed shortly.');
      setFormData({ platform: 'tiktok', video_url: '' });
      fetchSubmissions();
    } catch (error) {
      console.error('Error submitting content:', error);
      setMessage('Error submitting content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get('/api/content/');
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'tiktok':
        return 'fab fa-tiktok';
      case 'instagram':
        return 'fab fa-instagram';
      case 'facebook':
        return 'fab fa-facebook';
      case 'twitter':
        return 'fab fa-twitter';
      default:
        return 'fas fa-video';
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
    <div className="content-submission">
      <div className="submission-header">
        <h2>Submit Your Content</h2>
        <p>Earn money by sharing your social media content</p>
      </div>
      
      <div className="submission-card">
        <form onSubmit={handleSubmit} className="submission-form">
          <div className="form-group">
            <label>Select Platform:</label>
            <div className="platform-selector">
              <select name="platform" value={formData.platform} onChange={handleChange}>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
              </select>
              {/* FIXED LINE: Added proper template string syntax */}
              <i className={`platform-icon ${getPlatformIcon(formData.platform)}`}></i>
            </div>
          </div>
          
          <div className="form-group">
            <label>Video URL:</label>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="Paste your video link here"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-upload"></i> Submit Content
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
        <h3>Your Recent Submissions</h3>
        
        {submissions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <p>You haven't submitted any content yet</p>
          </div>
        ) : (
          <div className="submission-items">
            {submissions.map(submission => (
              <div key={submission.id} className="submission-item">
                <div className="submission-platform">
                  <i className={getPlatformIcon(submission.platform)}></i>
                  <span>{submission.platform}</span>
                </div>
                
                <div className="submission-url">
                  <a href={submission.video_url} target="_blank" rel="noopener noreferrer">
                    {submission.video_url.length > 40 
                      ? `${submission.video_url.substring(0, 40)}...` 
                      : submission.video_url
                    }
                  </a>
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
                      {submission.earnings}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentSubmission;