import React, { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import logo from '../assets/KP website logo.gif'

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <header className="bg-black py-4">
      <div className="container mx-20 flex flex-wrap items-center justify-between">
        {/* Company Logo */}
        <div className="flex items-center">
          <img 
            src={logo} 
            alt="Kochas Power Pvt Ltd Logo" 
            className="h-[90px] w-[90px] mr-2 rounded-full transition-transform duration-300 hover:scale-110 hover:shadow-xl hover:shadow-white" 
          />
          <h1 className="text-white text-2xl font-bold rounded-full px-2 transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white">
            Kochas Power Pvt Ltd
          </h1>
        </div>
        
        {/* Navigation Links */}
        <nav className={` w-full md:w-auto ${isOpen ? 'block' : 'hidden'} md:block`}>
          <ul className="flex flex-col md:flex-row md:space-x-4 ">
            <li><a href="#home" className="text-xl text-white transition-transform duration-300 hover:scale-110 hover:text-yellow-400 hover:shadow-lg">Home</a></li>
            <li><a href="#about" className="text-xl text-white transition-transform duration-300 hover:scale-110 hover:text-yellow-400 hover:shadow-lg">About</a></li>
            <li><a href="#contact" className="text-xl text-white transition-transform duration-300 hover:scale-110 hover:text-yellow-400 hover:shadow-lg">Contact</a></li>
          </ul>
        </nav>
        
        {/* Profile Section */}
        <div className="flex items-center align-middle">
          <div className="text-white mr-4">Profile</div>
          <div className="h-10 w-10 rounded-full bg-gray-500"></div>
        </div>
        
        {/* Menu Toggle Button for Mobile */}
        <div className="block md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Nav