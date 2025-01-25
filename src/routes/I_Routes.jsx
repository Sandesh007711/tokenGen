import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Content from "../pages/Content";
import CreateUser from "../pages/CreateUser";
import TokenReport from "../pages/TokenReport";
import ManageVehicle from "../pages/Vehicle_rate/Manage_vehicle";
import Loaded from "../pages/Loaded";
import OtpVerification from "../pages/OtpVerification";
import ManageRate from "../pages/Vehicle_rate/Manage_rate";
import Token_list from "../pages/Token_Report/Token_list";
import Update_Token_list from "../pages/Token_Report/Update_Token_list";
import Delete_Token_list from "../pages/Token_Report/Delete_Token_list";
import Loaded_list from "../pages/Token_Report/Loaded_list";

const I_Routes = () => {
  return (
    <Routes>
      <Route path="/" element={<Content />} />
      <Route path="/create-user" element={<CreateUser />} />
      <Route path="/token-report" element={<TokenReport />} />
      <Route path="/vehicle-rate" element={<ManageVehicle />} />
      <Route path="/loaded" element={<Loaded />} />
      <Route path="/manage-rate" element={<ManageRate />} />
      <Route path="/token-list" element={<Token_list />} />
      <Route path="/update-token-list" element={<Update_Token_list />} />
      <Route path="/delete-token-list" element={<Delete_Token_list />} />
      <Route path="/loaded-list" element={<Loaded_list />} />
      <Route path="/otp-verification" element={<OtpVerification />} />
    </Routes>
  );
};

export default I_Routes;
