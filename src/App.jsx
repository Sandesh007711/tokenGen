import { useState } from 'react';
import Nav from './components/Nav';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import Footer from './components/Footer';
import 'tailwindcss/tailwind.css';
import {Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import OtpVerification from './pages/OtpVerification';


const App = () => {


  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/Otp' element={<OtpVerification />} />
      
    </Routes>
  );
};

export default App;