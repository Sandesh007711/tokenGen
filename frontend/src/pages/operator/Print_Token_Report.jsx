import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { FaTimes, FaFileExcel } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * TokenList Component
 * Handles the display and filtering of token reports
 * Features: Date range selection, user filtering, and tabular display of token data
 */
const Token_list = () => {
  // Add currentUser to state
  const [currentUser, setCurrentUser] = useState(null);
  // State Management
  const [fromDate, setFromDate] = useState(new Date());           // Start date for filtering
  const [toDate, setToDate] = useState(new Date());              // End date for filtering
  const [filteredData, setFilteredData] = useState([]);         // Filtered token data
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' }); // Error popup state
  const [showConfirm, setShowConfirm] = useState(false);         // Confirmation popup state
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);

  // Modified getCurrentUser to extract username correctly
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        return userData.user; // Extract the nested user object
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const user = getCurrentUser();
        setCurrentUser(user);

        console.log('Current username:', user?.username); // Debug log

        const response = await axios.get('http://localhost:8000/api/v1/tokens', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('API Response:', response.data);

        if (response.data?.status === 'success' && Array.isArray(response.data.printTokens)) {
          // Filter tokens for current user based on username
          const userTokens = response.data.printTokens.filter(token => 
            token.userId?.username === user?.username
          );
          
          console.log('Filtered tokens for user:', userTokens); // Debug log
          
          setTokens(userTokens);
          setFilteredData(userTokens);
          
          if (userTokens.length === 0) {
            showError('No tokens found for current user');
          }
        } else {
          console.log('Response structure:', response.data);
          showError('No tokens available');
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
        showError(error.response?.data?.message || 'Error fetching tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  // Debug user information
  useEffect(() => {
    const user = getCurrentUser();
    console.log('Current user from localStorage:', user);
  }, []);

  /**
   * Shows error popup with message
   * Automatically hides after 3 seconds
   * @param {string} message - Error message to display
   */
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000);
  };

  /**
   * Handles form submission
   * Validates user selection and filters data
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  /**
   * Handles confirmation of data fetch
   */
  const handleConfirm = () => {
    try {
      console.log('Filtering tokens between:', fromDate, toDate); // Debug log
      console.log('Available tokens:', tokens); // Debug log

      const filtered = tokens.filter(token => {
        const tokenDate = new Date(token.createdAt);
        const from = new Date(fromDate.setHours(0, 0, 0, 0));
        const to = new Date(toDate.setHours(23, 59, 59, 999));
        
        return tokenDate >= from && tokenDate <= to;
      });
      
      console.log('Filtered tokens:', filtered); // Debug log
      setFilteredData(filtered);
      setShowConfirm(false);
    } catch (error) {
      console.error('Error during filtering:', error); // Debug log
      showError('Error filtering data');
    }
  };

  /**
   * Exports the filtered data to Excel using ExcelJS
   */
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Token Report');

    // Updated headers to match JSON structure
    worksheet.columns = [
      { header: 'Token No', key: 'tokenNo', width: 15 },
      { header: 'Driver Name', key: 'driverName', width: 20 },
      { header: 'Mobile No', key: 'driverMobileNo', width: 15 },
      { header: 'Vehicle No', key: 'vehicleNo', width: 15 },
      { header: 'Vehicle Type', key: 'vehicleType', width: 15 },
      { header: 'Route', key: 'route', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Place', key: 'place', width: 15 },
      { header: 'Challan Pin', key: 'challanPin', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];

    // Transform data to include nested vehicleType
    const excelData = filteredData.map(item => ({
      ...item,
      vehicleType: item.vehicleId?.vehicleType || ''
    }));

    worksheet.addRows(excelData);
    worksheet.getRow(1).font = { bold: true };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Token_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="p-7 max-w-7xl mx-auto">
      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Submission</h3>
            <p className="mb-4">Are you sure you want to fetch the data?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {errorPopup.show && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in-top z-50">
          <span>{errorPopup.message}</span>
          <button
            onClick={() => setErrorPopup({ show: false, message: '' })}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Header Section with Form */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-300 mb-4">Token Report</h1>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-4">
          <DatePicker
            selected={fromDate}
            onChange={date => setFromDate(date)}
            className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
            placeholderText="From Date"
          />
          
          <DatePicker
            selected={toDate}
            onChange={date => setToDate(date)}
            className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
            placeholderText="To Date"
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-slate-400 via-gray-500 to-black hover:from-black hover:via-gray-500 hover:to-slate-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading tokens...
          </div>
        ) : (
          <>
            {filteredData.length > 0 && (
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <span className="text-gray-600">
                  Total Tokens: {filteredData.length}
                </span>
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
                >
                  <FaFileExcel />
                  Export to Excel
                </button>
              </div>
            )}
            
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Token No</th>
                  <th className="py-3 px-4 text-left font-semibold">Driver Name</th>
                  <th className="py-3 px-4 text-left font-semibold">Mobile No</th>
                  <th className="py-3 px-4 text-left font-semibold">Vehicle No</th>
                  <th className="py-3 px-4 text-left font-semibold">Vehicle Type</th>
                  <th className="py-3 px-4 text-left font-semibold">Route</th>
                  <th className="py-3 px-4 text-left font-semibold">Quantity</th>
                  <th className="py-3 px-4 text-left font-semibold">Place</th>
                  <th className="py-3 px-4 text-left font-semibold">Challan Pin</th>
                  <th className="py-3 px-4 text-left font-semibold">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-gray-500 text-lg">
                      Loading...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-gray-500 text-lg">
                      No data available
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition duration-200">
                      <td className="py-3 px-4">{item.tokenNo}</td>
                      <td className="py-3 px-4">{item.driverName}</td>
                      <td className="py-3 px-4">{item.driverMobileNo}</td>
                      <td className="py-3 px-4">{item.vehicleNo}</td>
                      <td className="py-3 px-4">{item.vehicleId?.vehicleType}</td>
                      <td className="py-3 px-4">{item.route}</td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">{item.place}</td>
                      <td className="py-3 px-4">{item.challanPin}</td>
                      <td className="py-3 px-4">{new Date(item.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Token_list;