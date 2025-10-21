import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/BottomNavbar.css';

const BottomNavbar = ({ user, onLogout }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', icon: 'fas fa-home', label: 'Home' },
    { path: '/referrals', icon: 'fas fa-users', label: 'Referrals' },
    { path: '/withdrawal', icon: 'fas fa-money-bill-wave', label: 'Withdrawal' },
    { path: '/games', icon: 'fas fa-gamepad', label: 'Games' },
  ];

  const moreMenuItems = [
    { path: '/rewards', icon: 'fas fa-gift', label: 'Rewards' },
    { path: '/terms', icon: 'fas fa-file-contract', label: 'Terms & Conditions' },
    { path: '/settings', icon: 'fas fa-cog', label: 'Settings' },
    { action: 'rate', icon: 'fas fa-star', label: 'Rate Us' },
    { action: 'logout', icon: 'fas fa-sign-out-alt', label: 'Log Out' },
  ];

  const handleMoreClick = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const handleMoreItemClick = (item) => {
    setShowMoreMenu(false);
    
    if (item.action === 'logout') {
      if (onLogout) {
        onLogout();
      }
    } else if (item.action === 'rate') {
      // Handle rate us action
      alert('Rate us feature coming soon!');
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('more-menu-overlay')) {
      setShowMoreMenu(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div 
          className="more-menu-overlay" 
          onClick={handleOverlayClick}
        >
          <div className="more-menu-content">
            <div className="more-menu-header">
              <h3>More Options</h3>
              <button 
                className="close-more-menu"
                onClick={() => setShowMoreMenu(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="more-menu-items">
              {moreMenuItems.map((item, index) => (
                <div
                  key={index}
                  className={`more-menu-item ${item.action ? 'action-item' : ''}`}
                  onClick={() => handleMoreItemClick(item)}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                  {item.path && <i className="fas fa-chevron-right more-arrow"></i>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="bottom-navbar">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <i className={item.icon}></i>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
        
        {/* More Button */}
        <div 
          className={`nav-item more-button ${showMoreMenu ? 'active' : ''}`}
          onClick={handleMoreClick}
        >
          <i className="fas fa-ellipsis-h"></i>
          <span className="nav-label">More</span>
        </div>
      </nav>
    </>
  );
};

export default BottomNavbar;