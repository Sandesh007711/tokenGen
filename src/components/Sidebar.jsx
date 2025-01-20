import React, { useState } from 'react'
import { FaUser, FaCar, FaDollarSign, FaKey, FaChartBar, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import './Sidebar.css'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div>
      <div className="toggle-button-container" onMouseEnter={toggleSidebar}>
        <button className="toggle-button" onClick={toggleSidebar}>
          {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
        </button>
      </div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`} onMouseLeave={toggleSidebar}>
        <ul>
          <li><FaUser /><span>Create User</span></li>
          <li><FaCar /><span>Vehicle</span></li>
          <li><FaDollarSign /><span>Rate</span></li>
          <li><FaKey /><span>Token</span></li>
          <li><FaChartBar /><span>Report</span></li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar