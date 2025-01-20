import React, { useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import logo from '../assets/KP website logo.gif'
import logoutIcon from '../assets/icons8-logout-64.png';
import profile from '../assets/profile.png';
import home from '../assets/home.png';

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
            className="h-[110px] w-[110px] mr-2 rounded-full transition-transform duration-300 hover:scale-110 hover:shadow-xl hover:shadow-slate-400" 
          />
          <h1 className="text-white text-3xl font-bold rounded-xl px-2 transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-400">
            Kochas Power Pvt. Ltd.
          </h1>
        </div>
        
       
        
       

       {/* Logout Button */}
       <div className="flex flex-row px-[20px] mr-4">
       <div className="flex-3 mx-2  transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-400 rounded-full group">
          <img src={home} alt="Home" className="h-[50px] w-[50px] rounded-full " />
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Home
            </span>
          </div>
          
          <div className="flex-3  mx-4 rounded-full transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-400 group">
          <img src={profile} alt="Profile" className="h-[50px] w-[50px] rounded-xl " />
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Profile
            </span>
          </div>

          <button className="flex-3 bg-slate-500 rounded-full p-2 rounded-full transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-400 group">
            <img src={logoutIcon} alt="Logout" className="h-8 w-8 rounded-xl" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Logout
            </span>
          </button>
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