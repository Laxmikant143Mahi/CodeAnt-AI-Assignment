import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <img src="/logo.svg" alt="CodeAnt AI" className="logo" />
        <div className="user-dropdown">
          <span>UtkarshDhairyaPanwar</span>
          <i className="dropdown-icon">▼</i>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li className="active">
            <i className="nav-icon">📁</i>
            <span>Repositories</span>
          </li>
          <li>
            <i className="nav-icon">🔍</i>
            <span>AI Code Review</span>
          </li>
          <li>
            <i className="nav-icon">🔒</i>
            <span>Cloud Security</span>
          </li>
          <li>
            <i className="nav-icon">❓</i>
            <span>How to Use</span>
          </li>
          <li>
            <i className="nav-icon">⚙️</i>
            <span>Settings</span>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <button className="support-btn">
          <i className="support-icon">💬</i>
          <span>Support</span>
        </button>
        <button className="logout-btn">
          <i className="logout-icon">🚪</i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
