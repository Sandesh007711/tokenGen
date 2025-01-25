import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import OtpVerification from '../pages/OtpVerification';
import Login from '../pages/Login'; 
import OperatorDashboard from '../pages/operator/operator-dashboard';


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/*" element={<Home />} /> {/* Home route */}
      <Route path="/otp-verification" element={<OtpVerification />} />
      <Route path="/login" element={<Login />} />
      <Route path="/operator-dashboard" element={< OperatorDashboard/>} />
    </Routes>
  );
};

export default AppRoutes;