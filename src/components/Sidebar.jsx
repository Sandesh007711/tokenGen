import React, { useState } from 'react'
import { FaUser, FaCar, FaDollarSign, FaKey, FaChartBar, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import './Sidebar.css'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className='fixed'>
      <button className="toggle-button" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
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