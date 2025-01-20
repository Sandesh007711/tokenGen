import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaCar, FaKey, FaTruckLoading, FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const sidebarRef = useRef(null);

  return (
    <div>
      <div className="toggle-button-container">
        <button className="toggle-button" onClick={toggleSidebar}>
          {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
        </button>
      </div>
      <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
        {isOpen && (
          <button className="close-button absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-4 rounded-full" onClick={toggleSidebar}>
            <FaTimes size={24} />
          </button>
        )}
        <ul>
          <li><FaUser /><span>Create User</span></li>
          <li><FaCar /><span>Vehicle Rate</span></li>
          <li><FaKey /><span>Token</span></li>
          <li><FaTruckLoading /><span>Loaded</span></li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;