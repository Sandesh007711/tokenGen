import React, { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import logo from '../assets/KP website logo.gif'

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <header className="bg-gray-800 p-7">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        {/* Company Logo */}
        <div className="flex items-center">
          <img src={logo} alt="Kochas Power Pvt Ltd Logo" className="h-10 w-10 mr-2" />
          <h1 className="text-white text-2xl font-bold">Kochas Power Pvt Ltd</h1>
        </div>
        
        {/* Menu Toggle Button for Mobile */}
        <div className="block md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className={`w-full md:w-auto ${isOpen ? 'block' : 'hidden'} md:block`}>
          <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-2 md:mt-0">
            <li><a href="#home" className="text-white hover:text-gray-400">Home</a></li>
            <li><a href="#about" className="text-white hover:text-gray-400">About</a></li>
            <li><a href="#contact" className="text-white hover:text-gray-400">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Nav