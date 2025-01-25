import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/operator/Op_Home';
import Print_token_report from '../pages/operator/Print_Token_Report';
import Loaded from '../pages/operator/Loaded';



const O_Routes = () => {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/print-token-report" element={<Print_token_report />}/>
        <Route path="/loaded" element={<Loaded />}/>
        <Route path="/*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default O_Routes