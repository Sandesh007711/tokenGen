import React, { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import logo from '../assets/KP website logo.gif'

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <header className="bg-black py-4 ">
      <div className="flex justify-between items-center mx-5"> 
        {/* Company Logo */}
        <div className="flex items-center">
          <img 
            src={logo} 
            alt="Kochas Power Pvt Ltd Logo" 
            className="h-[110px] w-[110px] mr-2 rounded-full transition-transform duration-300 hover:scale-110 hover:shadow-xl hover:shadow-white" 
          />
          <h1 className="text-white text-3xl font-bold rounded-xl px-2 transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white">
            Kochas Power Pvt. Ltd.
          </h1>
        </div>
        
        {/* Navigation Links */}
        <nav className={` w-full md:w-auto ${isOpen ? 'block' : 'hidden'} md:block `}>
          <ul className="flex flex-col md:flex-row md:space-x-4 ">
            <li><a href="#home" className="text-2xl mx-4 hover:font-bold  text-white transition-transform duration-300 hover:scale-110 hover:text-yellow-400 hover:shadow-lg">Home</a></li>
            <li><a href="#about" className="text-2xl mx-4 hover:font-bold  text-white transition-transform duration-300 hover:scale-110 hover:text-yellow-400 hover:shadow-lg">About</a></li>
            <li><a href="#contact" className="text-2xl mx-4 hover:font-bold  text-white transition-transform duration-300 hover:scale-110 hover:text-yellow-400 hover:shadow-lg">Contact</a></li>
          </ul>
        </nav>
        
        {/* Profile Section */}
        <div className='flex flex-row px-[50px] ' >
          <div className="flex-auto text-2xl mx-2 my-2 hover:font-bold  text-white transition-transform duration-300 hover:scale-110 hover:text-yellow-400 hover:shadow-lg ">Profile</div>
          <div className="flex-auto  mx-4 h-[50px] w-[50px] rounded-full bg-slate-400 "></div>
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