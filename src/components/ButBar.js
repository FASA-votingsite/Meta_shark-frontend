import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ButBar.css';

const ButBar = ({ user, onLogout }) => {
  return (
    <but className="butbar">
      <div className="butbar-container">
        <div className="butbar-menu">
          <Link to="/dashboard" className="butbar-item">Home</Link>
          <Link to="/referrals" className="butbar-item">Referrals</Link>
          {/*<Link to="/submit-content" className="butbar-item">Submit</Link>*/}
          <Link to="/games" className="butbar-item">Games</Link>
          <Link to="/withdrawal" className="butbar-item">More</Link>
        </div>

        <button onClick={onLogout} className="logout-btn">Logout</button>
        

      </div>
    </but>
  );
};

export default ButBar;