import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Content from '../pages/Content';
import CreateUser from '../pages/CreateUser';
import TokenReport from '../pages/TokenReport';
import ManageVehicle from '../pages/Vehicle_rate/Manage_vehicle';
import Loaded from '../pages/Loaded';
import OtpVerification from '../pages/OtpVerification';
import ManageRate from '../pages/Vehicle_rate/Manage_rate';
import Token_list from '../pages/Token_Report/Token_list';
import Update_Token_list from '../pages/Token_Report/Update_Token_list';
import Delete_Token_list from '../pages/Token_Report/Delete_Token_list';
import Loaded_list from '../pages/Token_Report/Loaded_list';

const I_Routes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Content />
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
          <ManageVehicle />
        </ProtectedRoute>
      } />
      <Route path="/loaded" element={
        <ProtectedRoute>
          <Loaded />
        </ProtectedRoute>
      } />
      <Route path="/manage-rate" element={
        <ProtectedRoute>
          <ManageRate />
        </ProtectedRoute>
      } />
      <Route path="/token-list" element={
        <ProtectedRoute>
          <Token_list />
        </ProtectedRoute>
      } />
      <Route path="/update-token-list" element={
        <ProtectedRoute>
          <Update_Token_list />
        </ProtectedRoute>
      } />
      <Route path="/delete-token-list" element={
        <ProtectedRoute>
          <Delete_Token_list />
        </ProtectedRoute>
      } />
      <Route path="/loaded-list" element={
        <ProtectedRoute>
          <Loaded_list />
        </ProtectedRoute>
      } />
      <Route path="/otp-verification" element={<OtpVerification />} />
    </Routes>
  );
};

export default I_Routes;