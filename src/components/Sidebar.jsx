import React, { useRef, useState } from 'react';
import { FaUser, FaCar, FaKey, FaTruckLoading, FaArrowLeft, FaArrowRight, FaChevronDown, FaList, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const sidebarRef = useRef(null);
  const [isVehicalRateOpen, setIsVehicalRateOpen] = useState(false);
  const [isTokenReportOpen, setIsTokenReportOpen] = useState(false);

  return (
    <div className="relative">
      {/* Sliding button */}
      <button
        className={`fixed top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-slate-500 via-slate-800 to-black text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 ease-in-out ${
          isOpen ? 'left-64' : 'left-0'
        }`}
        onClick={toggleSidebar}
      >
        {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
      </button>
      <div ref={sidebarRef} className={`fixed top-30 left-0 h-full w-64 bg-gradient-to-b from-black via-slate-800 to-white  text-white transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="fixed flex-col items-center justify-center h-full p-4">
          <ul className="space-y-4">
            <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded"><FaUser /><Link to="/create-user"><span>Create User</span></Link></li>
            <li className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded cursor-pointer" onClick={() => setIsVehicalRateOpen(!isVehicalRateOpen)}>
                <FaCar /><span>Vehical Rate</span><FaChevronDown className={`transform transition-transform ${isVehicalRateOpen ? 'rotate-180' : ''}`} />
              </div>
              {/* Show subsections under Vehical Rate if isVehicalRateOpen is true */}
              {isVehicalRateOpen && (
                <ul className="ml-4 space-y-2">
                  <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded"><FaList /><Link to="/vehicle-rate"><span>Manage Vehical Type</span></Link></li>
                  <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded"><FaEdit /><Link to="/manage-rate"><span>Manage Rate</span></Link></li>
                </ul>
              )}
            </li>
            <li className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded cursor-pointer" onClick={() => setIsTokenReportOpen(!isTokenReportOpen)}>
                <FaKey /><span>Token Report</span><FaChevronDown className={`transform transition-transform ${isTokenReportOpen ? 'rotate-180' : ''}`} />
              </div>
              {/* Show subsections under Token Report if isTokenReportOpen is true */}
              {isTokenReportOpen && (
                <ul className="ml-4 space-y-2">
                  <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded"><FaList /><Link to="/token-list"><span>Token List</span></Link></li>
                  <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded"><FaTruckLoading /><Link to="/loaded-list"><span>Loaded List</span></Link></li>
                  <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded"><FaEdit /><Link to="/update-token-list"><span>Update Token List</span></Link></li>
                  <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded"><FaTrashAlt /><Link to="/delete-token-list"><span>Delete Token List</span></Link></li>
                </ul>
              )}
            </li>
            <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded"><FaTruckLoading /><Link to="/loaded"><span>Loaded</span></Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;