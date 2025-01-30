import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaTimes, FaFileExcel, FaSpinner, FaEdit, FaTrash } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
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
  const [selectedUser, setSelectedUser] = useState('');          // Selected user from dropdown
  const [filteredData, setFilteredData] = useState([]);         // Filtered token data
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' }); // Error popup state
  const [showConfirm, setShowConfirm] = useState(false);         // Confirmation popup state
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' }); // Success popup state
  const [selectedToken, setSelectedToken] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pending, setPending] = useState(true);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to sort tokens by date (newest first)
  const sortTokensByDate = (tokens) => {
    return [...tokens].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Updated useEffect for fetching users with authentication
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:8000/api/v1/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          throw new Error('Unauthorized access');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const result = await response.json();
        console.log('API Response:', result);

        // Access the users array from the response structure
        const usersList = result.data.users || [];
        console.log('Processed users:', usersList);
        
        setUsers(usersList);
      } catch (error) {
        console.error('Fetch error:', error);
        showError(error.message);
      }
    };

    fetchUsers();
  }, []);

  // Add helper function to compare only dates
  const isSameOrAfterDate = (date1, date2) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1 >= d2;
  };

  const isSameOrBeforeDate = (date1, date2) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1 <= d2;
  };

  // Replace initialFetch with this new fetch function
  const fetchTokens = async (page, perPage, searchParams = {}) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Remove username from query params and fetch all tokens
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString()
      });

      const response = await fetch(`http://localhost:8000/api/v1/tokens?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const result = await response.json();
      console.log('Token API Response:', result);

      if (result.status === 'success' && Array.isArray(result.printTokens)) {
        // Filter by both date and username on frontend
        const filteredTokens = result.printTokens.filter(token => {
          // Date filtering
          const dateMatches = (() => {
            if (!searchParams.fromDate || !searchParams.toDate) return true;
            
            const tokenDate = new Date(token.createdAt);
            const fromDateTime = new Date(searchParams.fromDate);
            const toDateTime = new Date(searchParams.toDate);
            
            return isSameOrAfterDate(tokenDate, fromDateTime) && 
                   isSameOrBeforeDate(tokenDate, toDateTime);
          })();

          // Username filtering
          const usernameMatches = (() => {
            if (!searchParams.username) return true;
            return token.userId?.username === searchParams.username;
          })();

          return dateMatches && usernameMatches;
        });

        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedData = filteredTokens.slice(startIndex, endIndex);

        setFilteredData(paginatedData);
        setTotalRows(filteredTokens.length);
        showSuccess(`Found ${filteredTokens.length} matching records`);
      } else {
        setFilteredData([]);
        setTotalRows(0);
        showError('No matching records found');
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
      showError(error.message);
      setFilteredData([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Replace the useEffect for initial fetch
  useEffect(() => {
    fetchTokens(currentPage, perPage);
  }, []); // Initial fetch

  // Add handlePageChange function
  const handlePageChange = (page) => {
    setCurrentPage(page);
    const searchParams = {
      fromDate,
      toDate,
      ...(selectedUser && { username: selectedUser })
    };
    fetchTokens(page, perPage, searchParams);
  };

  // Add handlePerPageChange function
  const handlePerPageChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
    const searchParams = {
      fromDate,
      toDate,
      ...(selectedUser && { username: selectedUser })
    };
    await fetchTokens(page, newPerPage, searchParams);
  };

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
   * Shows success popup with message
   * @param {string} message - Success message to display
   */
  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => {
      setSuccessPopup({ show: false, message: '' });
    }, 3000);
  };

  /**
   * Handles form submission
   * Validates user selection and filters data
   * @param {Event} e - Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showError('Please select both from and to dates');
      return;
    }
    setShowConfirm(true);
  };

  // Update handleConfirm to use pagination
  const handleConfirm = async () => {
    setShowConfirm(false);
    setCurrentPage(1); // Reset to first page

    const searchParams = {
      fromDate: fromDate,
      toDate: toDate,
      ...(selectedUser && { username: selectedUser })
    };

    console.log('Submitting search with params:', searchParams);
    await fetchTokens(1, perPage, searchParams);
  };

  /**
   * Helper function to format date and time
   * @param {Date} date - Date to format
   * @returns {string} Formatted date and time
   */
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  /**
   * Exports the filtered data to Excel using ExcelJS
   */
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Token Report');

    worksheet.columns = [
      { header: 'Driver Name', key: 'driverName', width: 20 },
      { header: 'Driver Mobile No.', key: 'driverMobileNo', width: 15 }, // Updated header
      { header: 'Vehicle No', key: 'vehicleNo', width: 15 },
      { header: 'Place', key: 'place', width: 20 },
      { header: 'Route', key: 'route', width: 20 },
      { header: 'Token No', key: 'tokenNo', width: 15 },
      { header: 'Challan Pin', key: 'challanPin', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'User', key: 'createdBy', width: 20 }, // Updated header
      { header: 'Updated By', key: 'updatedBy', width: 20 },
      { header: 'Date', key: 'createdAt', width: 20 }
    ];

    // Format the data for Excel with date and time
    const formattedData = filteredData.map(item => ({
      ...item,
      createdBy: item.userId?.username || 'N/A', // Add user info
      updatedBy: item.updatedBy?.username || 'N/A', // Add updated by info
      createdAt: formatDateTime(item.createdAt)
    }));

    // Add rows
    worksheet.addRows(formattedData);

    // Style the header row
    worksheet.getRow(1).font = { bold: true };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Token_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  // Add these new functions for handling updates and deletes
  const handleUpdate = (token) => {
    // Implement your update logic here
    console.log('Update token:', token);
  };

  const handleDelete = async () => {
    if (!selectedToken) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/tokens/${selectedToken._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete token');
      }

      // Remove the deleted token from the state
      setTokens(prevTokens => prevTokens.filter(t => t._id !== selectedToken._id));
      setFilteredData(prevData => prevData.filter(t => t._id !== selectedToken._id));
      showSuccess('Token deleted successfully');
    } catch (error) {
      showError(error.message);
    } finally {
      setShowDeleteConfirm(false);
      setSelectedToken(null);
    }
  };

  // Define the columns for DataTable
  const columns = [
    {
      name: 'Driver Name',
      selector: row => row.driverName,
      sortable: true,
    },
    {
      name: 'Driver Mobile No.',
      selector: row => row.driverMobileNo,
      sortable: true,
    },
    {
      name: 'Vehicle No',
      selector: row => row.vehicleNo,
      sortable: true,
    },
    {
      name: 'Place',
      selector: row => row.place,
      sortable: true,
    },
    {
      name: 'Route',
      selector: row => row.route || 'N/A',
      sortable: true,
    },
    {
      name: 'Token No',
      selector: row => row.tokenNo,
      sortable: true,
    },
    {
      name: 'Challan Pin',
      selector: row => row.challanPin || 'N/A',
      sortable: true,
    },
    {
      name: 'Quantity',
      selector: row => row.quantity,
      sortable: true,
    },
    {
      name: 'User',
      selector: row => row.userId?.username || 'N/A',
      sortable: true,
    },
    {
      name: 'Updated By',
      selector: row => row.updatedBy?.username || 'N/A',
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => formatDateTime(row.createdAt),
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleUpdate(row)}
            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
            title="Update"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => {
              setSelectedToken(row);
              setShowDeleteConfirm(true);
            }}
            className="p-2 text-red-600 hover:text-red-800 transition-colors"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      // Removed allowOverflow property as it's not needed
    },
  ];

  // Custom styles for DataTable
  const customStyles = {
    headRow: {
      style: {
        background: 'linear-gradient(to right, #94a3b8, #cbd5e1, #e2e8f0)',
        fontWeight: 'bold',
      },
    },
    rows: {
      style: {
        minHeight: '60px',
        '&:hover': {
          backgroundColor: '#f8fafc',
        },
      },
    },
    pagination: {
      style: {
        border: 'none',
        backgroundColor: '#f8fafc',
      },
    },
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

      {/* Add Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete this token?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
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

      {/* Success Popup */}
      {successPopup.show && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in-top z-50">
          <span>{successPopup.message}</span>
          <button
            onClick={() => setSuccessPopup({ show: false, message: '' })}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Header Section with Form */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-300 mb-4">Token Report</h1>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label htmlFor="fromDate" className="text-gray-300 mb-1">From Date</label>
            <DatePicker
              id="fromDate"
              selected={fromDate}
              onChange={date => setFromDate(date)}
              className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
              placeholderText="From Date"
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="toDate" className="text-gray-300 mb-1">To Date</label>
            <DatePicker
              id="toDate"
              selected={toDate}
              onChange={date => setToDate(date)}
              className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
              placeholderText="To Date"
            />
          </div>
          
          <div className="flex flex-col">
            <label htmlFor="userSelect" className="text-gray-300 mb-1">Select User</label>
            <select
              id="userSelect"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300 min-w-[200px]"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user.username}>{user.username}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-transparent mb-1">Submit</label>
            <button
              type="submit"
              className="bg-gradient-to-r from-slate-400 via-gray-500 to-black hover:from-black hover:via-gray-500 hover:to-slate-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
            >
              Submit
            </button>
          </div>
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
        
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerPageChange}
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          progressPending={isLoading}
          progressComponent={
            <div className="py-8 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center">
                <FaSpinner className="animate-spin text-2xl mb-2" />
                <span className="font-medium">Loading tokens...</span>
              </div>
            </div>
          }
          noDataComponent={
            <div class="py-8 text-center text-gray-500 text-lg">
              <div class="flex flex-col items-center justify-center">
                <span class="font-medium">No data available</span>
                <span class="text-sm text-gray-400 mt-1">Select date range to view tokens</span>
              </div>
            </div>
          }
          customStyles={customStyles}
          sortIcon={<span className="ml-2">↕</span>}
          responsive
          highlightOnHover
          pointerOnHover
          striped
        />
      </div>
    </div>
  );
};

export default Token_list;