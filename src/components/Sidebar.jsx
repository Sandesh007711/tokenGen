import React, { useState, useEffect, useRef } from 'react'
import { FaUser, FaCar, FaDollarSign, FaKey, FaTruckLoading, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import './Sidebar.css'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef(null)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div>
      <div className="toggle-button-container">
        <button className="toggle-button" onClick={toggleSidebar}>
          {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
        </button>
      </div>
      <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
        <ul>
          <li><FaUser /><span>Create User</span></li>
          <li><FaCar /><span>Vehicle Rate</span></li>
          <li><FaKey /><span>Token</span></li>
          <li><FaTruckLoading /><span>Loaded</span></li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar