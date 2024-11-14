import React from 'react';
import { FaGamepad, FaList, FaCalendarAlt, FaTrophy, FaUserCog, FaBook, FaCog, FaFire } from 'react-icons/fa';
import './styles.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/whiteLogo.svg" alt="Hunch Logo" className='logo-image' />
      </div>
      <ul className="nav-list">
        <li className="inactive"><FaGamepad /> Dashboard</li>
        <li className="inactive"><FaList /> Games</li>
        <li className="active"><FaFire /> Streak Setup</li>
        <ul className="submenu">
          <li className="active-submenu">Questions</li>
          <li className="inactive">Dashboard</li>
        </ul>
        <li className="inactive"><FaCalendarAlt /> External Sport Events</li>
        <li className="inactive"><FaTrophy /> Custom Leaderboards</li>
        <li className="inactive"><FaUserCog /> CRM</li>
        <li className="inactive"><FaBook /> CMS</li>
        <li className="inactive"><FaCog /> Settings</li>
      </ul>
    </div>
  );
};

export default Sidebar;
