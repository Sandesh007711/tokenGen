import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [tempCredentials, setTempCredentials] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const otpVerified = localStorage.getItem('otpVerified');
    if (token || otpVerified === 'true') {
      setIsAuthenticated(true);
      setIsOtpVerified(true);
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  const login = (credentials) => {
    if (credentials.role === 'admin') {
      setTempCredentials(credentials);
      // For admin, wait for OTP verification
    } else {
      // For operator, directly authenticate
      localStorage.setItem('authToken', credentials.token);
      localStorage.setItem('userRole', credentials.role);
      localStorage.setItem('otpVerified', 'false');
      setIsAuthenticated(true);
      setIsOtpVerified(false);
      setUserRole(credentials.role);
    }
  };

  const verifyOtp = (otp) => {
    // Only admins need OTP verification
    if (tempCredentials?.role === 'admin') {
      if (otp === '123456') { // Example OTP
        localStorage.setItem('authToken', tempCredentials.token);
        localStorage.setItem('userRole', tempCredentials.role);
        localStorage.setItem('otpVerified', 'true');
        setIsAuthenticated(true);
        setIsOtpVerified(true);
        setUserRole(tempCredentials.role);
        return true;
      }
      return false;
    }
    return true; // Always return true for non-admin roles
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('otpVerified');
    setIsAuthenticated(false);
    setIsOtpVerified(false);
    setUserRole(null);
    setTempCredentials(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isOtpVerified,
      loading, 
      userRole, 
      login, 
      logout,
      verifyOtp,
      tempCredentials 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
