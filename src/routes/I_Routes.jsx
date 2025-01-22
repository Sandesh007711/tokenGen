import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Content from '../pages/Content';
import Test from '../pages/test';
import CreateUser from '../pages/CreateUser';
import TokenReport from '../pages/TokenReport';
import VehicleRate from '../pages/VehicleRate';
import Loaded from '../pages/Loaded';
import OtpVerification from '../pages/OtpVerification';

const I_Routes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Content />
        </ProtectedRoute>
      } />
      <Route path="/test" element={
        <ProtectedRoute>
          <Test />
        </ProtectedRoute>
      } />
      <Route path="/create-user" element={
        <ProtectedRoute>
          <CreateUser />
        </ProtectedRoute>
      } />
      <Route path="/token-report" element={
        <ProtectedRoute>
          <TokenReport />
        </ProtectedRoute>
      } />
      <Route path="/vehicle-rate" element={
        <ProtectedRoute>
          <VehicleRate />
        </ProtectedRoute>
      } />
      <Route path="/loaded" element={
        <ProtectedRoute>
          <Loaded />
        </ProtectedRoute>
      } />
      <Route path="/otp-verification" element={<OtpVerification />} />
    </Routes>
  );
};

export default I_Routes;