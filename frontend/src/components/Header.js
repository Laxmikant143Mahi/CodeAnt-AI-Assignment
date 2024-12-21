import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">CodeAnt AI</div>
      <nav className="nav">
        <ul>
          <li>Repositories</li>
          <li>AI Code Review</li>
          <li>Cloud Security</li>
          <li>How to Use</li>
          <li>Settings</li>
        </ul>
      </nav>
      <div className="profile">justAdityaG</div>
    </header>
  );
};

export default Header;
