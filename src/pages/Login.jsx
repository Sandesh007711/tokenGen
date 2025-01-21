import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/loginLogo.gif'; // Adjust the path as necessary
import loginLogo from '../assets/loginLogo.gif'; // Adjust the path as necessary

const Login = () => {
  const [isAdminLogin, setIsAdminLogin] = useState(true);
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/otp-verification');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-800 to-black p-8">
      {/* Welcome text with fade-in effect */}
      <h1 className="text-5xl font-bold text-gray-300 fade-in text-center mb-8">
        Welcome Back!
      </h1>
      {/* Login card */}
      <div className="bg-black p-8 rounded-lg shadow-lg w-full max-w-md">
        {/* Logo image */}
        <div className="flex justify-center mb-6">
          <img src={loginLogo} alt="Login Logo" className="w-[300px] h-[300px]" />
        </div>
        {/* Login form title */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            {isAdminLogin ? 'Admin Login' : 'Operator Login'}
          </h2>
          {/* Login form */}
          <form>
            {/* Username input */}
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                id="username"
                type="text"
                placeholder={isAdminLogin ? 'Admin Username' : 'Operator Username'}
              />
            </div>
            {/* Password input */}
            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-black mb-3 leading-tight focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                id="password"
                type="password"
                placeholder="******************"
              />
            </div>
            {/* Sign In and Switch Login Type buttons */}
            <div className="flex items-center justify-between">
              <button
                className="bg-white hover:bg-gray-300 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                type="button"
                onClick={handleSignIn}
              >
                Sign In
              </button>
              <button
                className="text-xl font-bold text-gray-500 transition duration-300 ease-in-out transform hover:scale-105 hover:text-white"
                type="button"
                onClick={() => setIsAdminLogin(!isAdminLogin)}
              >
                {isAdminLogin ? 'Operator Login' : 'Admin Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;