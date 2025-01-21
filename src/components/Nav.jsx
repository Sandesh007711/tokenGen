import React, { useState } from "react";
import logo from "../assets/Ramjee Singh and company logo.gif";
import logoutIcon from "../assets/icons8-logout-64.png";
import profile from "../assets/profile.png";
import home from "../assets/home.png";
import { Link } from "react-router-dom";

const Nav = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-gradient-to-l from-slate-400 via-slate-700 to-black lg:py-4 md:py-2 sm:py-1 py-[2px]">
      <div className="flex justify-between items-center mx-5">
        {/* Company Logo and Title */}
        <div className="flex items-center">
          <img
            src={logo}
            alt="Ramjee Singh & Co Logo"
            className="h-[80px] w-[80px] sm:h-[90px] sm:w-[90px] md:h-[100px] md:w-[100px] lg:h-[110px] lg:w-[110px] mr-2 rounded-full transition-transform duration-300 hover:scale-110 hover:shadow-xl hover:shadow-slate-400"
          />
        
        <Link to="/"> 
          <h1 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold rounded-xl px-2 transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-400">
            Ramjee Singh And Co.
          </h1>
          </Link>
        </div>

        {/* Menu Items */}
        <div className="flex flex-row space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8">
          <Link to="/">
          <button
            className="transition-transform duration-300 hover:scale-110 
                    hover:shadow-lg hover:shadow-slate-700 rounded-full group">
            <img
              src={home}
              alt="Home"
              className="h-[20px] w-[20px] sm:h-[40px] sm:w-[40px] md:h-[50px] md:w-[50px] rounded-xl"
            />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Home
            </span>
          </button>
          </Link>

          <div className="relative">
            <button
              className="transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-700 rounded-full group"
              onClick={toggleDropdown}
            >
              <img
                src={profile}
                alt="Profile"
                className="h-[20px] w-[20px] sm:h-[40px] sm:w-[40px] md:h-[50px] md:w-[50px] rounded-xl"
              />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Profile
              </span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
            
                <button className="flex items-center w-full px-2 py-1 text-sm text-gray-700 hover:bg-gray-100">
                  <img src={logoutIcon} alt="Logout" className="h-5 w-5 mr-2" />
                  Logout
                </button>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Nav;
