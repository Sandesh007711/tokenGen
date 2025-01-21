// src/routes/W_Routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import OtpVerification from '../pages/OtpVerification';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/otp-verification' element={<OtpVerification />} />
    </Routes>
  );
};

export default AppRoutes;