import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from 'styled-components';
import logo from "../assets/logo.png";
import { FaUser, FaRoute, FaExpandAlt, FaCompressAlt } from 'react-icons/fa';

const StyledWrapper = styled.div`
  .Btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition-duration: .3s;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
    background-color: rgb(255, 65, 65);
  }

  .sign {
    width: 100%;
    transition-duration: .3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sign svg {
    width: 17px;
  }

  .sign svg path {
    fill: white;
  }

  .text {
    position: absolute;
    right: 0%;
    width: 0%;
    opacity: 0;
    color: white;
    font-size: 1.2em;
    font-weight: 600;
    transition-duration: .3s;
  }

  .Btn:hover {
    width: 125px;
    border-radius: 40px;
    transition-duration: .3s;
  }

  .Btn:hover .sign {
    width: 30%;
    transition-duration: .3s;
    padding-left: 20px;
  }

  .Btn:hover .text {
    opacity: 1;
    width: 70%;
    transition-duration: .3s;
    padding-right: 10px;
  }

  .Btn:active {
    transform: translate(2px ,2px);
  }
`;

const Nav = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [username, setUsername] = useState('');
  const [route, setRoute] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        const currentUser = userData.data || userData.user || userData;
        setUsername(currentUser.username || '');
        setRoute(currentUser.route || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
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
              className="h-[60px] w-[60px] sm:h-[70px] sm:w-[70px] md:h-[80px] md:w-[80px] lg:h-[90px] lg:w-[90px] rounded-full"
            />
          
            <Link to="/operator">
              <h1 className="ml-4 text-white text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold rounded-xl px-2 transition-transform duration-300 hover:scale-110 hover:shadow-lg hover:shadow-slate-400">
                Ramjee Singh And Co.
              </h1>
            </Link>
          </div>

          {/* Menu Items */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {/* Fullscreen Toggle Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white hover:text-gray-300 transition-colors"
            >
              {isFullscreen ? (
                <FaCompressAlt className="text-lg sm:text-xl" />
              ) : (
                <FaExpandAlt className="text-lg sm:text-xl" />
              )}
            </button>

            {/* User Icon and Name */}
            <div className="flex items-center gap-2">
              <FaUser className="text-lg sm:text-xl text-white" />
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-white">
                {username}
              </span>
              <div className="flex items-center gap-2">
                <FaRoute className="text-lg sm:text-xl text-black" />
                <span className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-black">
                  {route || 'N/A'}
                </span>
              </div>
            </div>
            
            <StyledWrapper>
              <button className="Btn" onClick={handleLogoutClick}>
                <div className="sign">
                  <svg viewBox="0 0 512 512">
                    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
                  </svg>
                </div>
                <div className="text">Logout</div>
              </button>
            </StyledWrapper>
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
                className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-400 transition-colors"
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


