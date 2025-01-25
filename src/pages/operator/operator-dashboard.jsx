import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Nav from '../../components/Nav';

const OperatorDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Nav />
      <div className="flex flex-1 pt-[100px]"> {/* Added padding-top to account for fixed Nav */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800">Operator Dashboard</h1>
            {/* Add your dashboard content here */}
          </div>
        </div>
      </div>

      <footer className="footer_w">
      <p className="m-0 font-bold tracking-wide">
        COPYRIGHT &copy; RAMJEE SINGH AND COMPANY - DEVELOPED BY TRIADEVS ALL RIGHTS RESERVED - 2025
        </p>
    </footer>
    </div>
  );
};

export default OperatorDashboard;
