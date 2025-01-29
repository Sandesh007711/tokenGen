import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Ramjee Singh and company logo.gif";
import logoutIcon from "../assets/icons8-logout-64.png";
import profile from "../assets/profile.png";
import home from "../assets/home.png";

const Nav = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setIsDropdownOpen(false);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-gradient-to-l from-slate-400 via-slate-700 to-black py-2 sm:py-3 md:py-3 lg:py-4">
        <div className="flex justify-between items-center mx-2 sm:mx-3 md:mx-4 lg:mx-5">
          {/* Company Logo and Title */}
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Ramjee Singh & Co Logo"
              className="h-[60px] w-[60px] sm:h-[70px] sm:w-[70px] md:h-[80px] md:w-[80px] lg:h-[90px] lg:w-[90px] rounded-full transition-transform duration-300 hover:scale-110 hover:shadow-xl hover:shadow-slate-400"
            />
          
            <Link to="/operator">
              <h1 className="text-white text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold rounded-xl px-2 transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-400">
                Ramjee Singh And Co....
              </h1>
            </Link>
          </div>

          {/* Menu Items */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            <Link to="/operator">
              <button className="transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-700 rounded-full group">
                <img
                  src={home}
                  alt="Home"
                  className="h-[25px] w-[25px] sm:h-[30px] sm:w-[30px] md:h-[40px] md:w-[40px] rounded-xl"
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
                  className="h-[25px] w-[25px] sm:h-[30px] sm:w-[30px] md:h-[40px] md:w-[40px] rounded-xl"
                />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Profile
                </span>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 sm:w-44 bg-white rounded-md shadow-lg z-10">
                  <button 
                    className="flex items-center w-full px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogoutClick}
                  >
                    <img src={logoutIcon} alt="Logout" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Logout</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Nav;


