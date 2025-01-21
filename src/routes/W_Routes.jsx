// src/routes/W_Routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import OtpVerification from '../pages/OtpVerification';
import Login from '../pages/Login';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/otp-verification' element={<OtpVerification />} />
      <Route path='/login' element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;