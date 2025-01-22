import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginLogo from '../assets/loginLogo.gif';
import { PiEyeClosedBold, PiEyeBold } from 'react-icons/pi';

const Login = () => {
  const [isAdminLogin, setIsAdminLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignIn = () => {
    if (isAdminLogin && username === 'admin' && password === 'admin123') {
      login({
        token: 'admin-token',
        role: 'admin',
        username
      });
      navigate('/otp-verification');
    } else if (!isAdminLogin && username === 'operator' && password === 'operator123') {
      login({
        token: 'operator-token',
        role: 'operator',
        username
      });
      navigate('/otp-verification');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleSwitchLogin = () => {
    setIsAdminLogin(!isAdminLogin);
    setUsername('');
    setPassword('');
    setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
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
          <h2 className="text-3xl font-bold mb-2 text-center text-white">
            {isAdminLogin ? 'Admin Login' : 'Operator Login'}
          </h2>
          {/* Error message */}
          {error && <p className="text-red-500 text-4xs italic mb-4 text-center">{error}</p>}
          {/* Login form */}
          <form onKeyPress={handleKeyPress}>
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            {/* Password input */}
            <div className="mb-6 relative">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-black mb-3 leading-tight focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="******************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* eye Password input */}
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 py-8 text-gray-600 hover:text-gray-900 focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-125"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? < PiEyeBold size={24} /> : < PiEyeClosedBold size={24} />} 
              </button>
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
                onClick={handleSwitchLogin}
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