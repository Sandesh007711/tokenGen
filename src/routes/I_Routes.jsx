import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Content from '../pages/Content'
import Test from '../pages/test'
import CreateUser from '../pages/CreateUser'
import TokenReport from '../pages/TokenReport'
import VehicleRate from '../pages/VehicleRate'
import Loaded from '../pages/Loaded'

const I_Routes = () => {
  return (
    <Routes>
      <Route path="/" element={<Content />} />
      <Route path="/test" element={<Test />} />
      <Route path="/create-user" element={<CreateUser />} />
      <Route path="/token-report" element={<TokenReport />} />
      <Route path="/vehicle-rate" element={<VehicleRate />} />
      <Route path="/loaded" element={<Loaded />} />
    </Routes>
  )
}

export default I_Routes