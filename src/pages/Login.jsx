import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginLogo from '../assets/loginLogo.gif';

const Login = () => {
  const [isAdminLogin, setIsAdminLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Hardcoded credentials for demonstration
  const adminCredentials = { username: 'admin', password: 'admin123' };
  const operatorCredentials = { username: 'operator', password: 'operator123' };

  const handleSignIn = () => {
    if (
      (isAdminLogin && username === adminCredentials.username && password === adminCredentials.password) ||
      (!isAdminLogin && username === operatorCredentials.username && password === operatorCredentials.password)
    ) {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-800 to-black p-8">
      {/* Welcome text with fade-in effect */}
      <h1 className="text-5xl font-bold text-gray-300 fade-in text-center mb-8">
        Welcome!
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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