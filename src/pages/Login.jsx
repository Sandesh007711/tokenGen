import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import loginLogo from '../assets/loginLogo.gif';
import { PiEyeClosedBold, PiEyeBold } from 'react-icons/pi';
import api from '../services/api'; // You'll need to create this

const Login = () => {
  const [isAdminLogin, setIsAdminLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/users/login', {
        phone: phone,
        password: password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        navigate(response.data.role === 'admin' ? '/otp-verification' : '/');
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchLogin = () => {
    setIsAdminLogin(!isAdminLogin);
    setPhone('');
    setPassword('');
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-xl bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          {/* Logo and welcome section */}
          <div className="text-center mb-8">
            <img src={loginLogo} alt="Login Logo" className="w-32 h-32 mx-auto mb-6 rounded-full shadow-lg" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500 mb-2">
              Welcome Back!
            </h1>
            <h2 className="text-2xl font-semibold text-slate-400">
              {isAdminLogin ? 'Admin Portal' : 'Operator Portal'}
            </h2>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login form */}
          <form onKeyPress={handleKeyPress} className="space-y-6">
            {/* Phone input */}
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="phone">
                Phone Number
              </label>
              <input
                className="w-full px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Password input with toggle */}
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300 [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-inner-spin-button]:hidden"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                >
                  {showPassword ? (
                    <PiEyeBold className="w-5 h-5" />
                  ) : (
                    <PiEyeClosedBold className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col space-y-4">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-slate-400 via-gray-500 to-black hover:from-black hover:via-gray-500 hover:to-slate-400 text-white font-bold rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={handleSwitchLogin}
                className="text-slate-400 hover:text-white transition-colors duration-300 text-sm font-semibold"
              >
                Switch to {isAdminLogin ? 'Operator Login' : 'Admin Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;