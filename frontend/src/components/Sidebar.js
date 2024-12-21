import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <ul>
        <li>Repositories</li>
        <li>AI Code Review</li>
        <li>Cloud Security</li>
        <li>How to Use</li>
        <li>Settings</li>
        <li>Support</li>
        <li>Logout</li>
      </ul>
    </aside>
  );
};

export default Sidebar;
