import React, { useState } from 'react';
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
  // State Management
  const [fromDate, setFromDate] = useState(new Date());           // Start date for filtering
  const [toDate, setToDate] = useState(new Date());              // End date for filtering
  const [filteredData, setFilteredData] = useState([]);         // Filtered token data
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' }); // Error popup state
  const [showConfirm, setShowConfirm] = useState(false);         // Confirmation popup state

  // Sample data for demonstration (replace with actual data source)
  const sampleTableData = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      token: 'TK001',
      date: '2024-01-20'
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '9876543210',
      token: 'TK002',
      date: '2024-01-21'
    }
  ];

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
    setFilteredData(sampleTableData);
    setShowConfirm(false);
  };

  /**
   * Exports the filtered data to Excel using ExcelJS
   */
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Token Report');

    // Add headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Token', key: 'token', width: 15 },
      { header: 'Date', key: 'date', width: 15 }
    ];

    // Add rows
    worksheet.addRows(filteredData);

    // Style the header row
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
        {filteredData.length > 0 && (
          <div className="p-4 bg-gray-50 border-b flex justify-end">
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
              <th className="py-3 px-4 text-left font-semibold">Name</th>
              <th className="py-3 px-4 text-left font-semibold">Email</th>
              <th className="py-3 px-4 text-left font-semibold">Phone</th>
              <th className="py-3 px-4 text-left font-semibold">Token</th>
              <th className="py-3 px-4 text-left font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 text-lg">
                  No data available
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition duration-200">
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4">{item.email}</td>
                  <td className="py-3 px-4">{item.phone}</td>
                  <td className="py-3 px-4">{item.token}</td>
                  <td className="py-3 px-4">{item.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Token_list;