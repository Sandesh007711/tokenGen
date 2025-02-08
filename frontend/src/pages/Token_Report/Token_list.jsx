import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaTimes, FaFileExcel, FaSpinner, FaEdit, FaTrash, FaExpandAlt, FaCompressAlt } from 'react-icons/fa';
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
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateFormData, setUpdateFormData] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Add this new state with other states
  const [isFiltered, setIsFiltered] = useState(false); // Add this new state
  const [isDeleting, setIsDeleting] = useState(false); // Add new state for delete loading

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

  // Update fetchTokens function to filter out deleted items
  const fetchTokens = async (searchParams = {}) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/v1/tokens', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const result = await response.json();
      
      // Check if result is an array or has data property
      const tokenData = Array.isArray(result) ? result : (result.data || []);
      
      if (tokenData.length > 0) {
        // First filter out deleted items
        const activeTokens = tokenData.filter(token => token.deletedAt === null);
        
        const sortedTokens = activeTokens.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        const filteredTokens = sortedTokens.filter(token => {
          const dateMatches = (() => {
            if (!searchParams.fromDate || !searchParams.toDate) return true;
            
            const tokenDate = new Date(token.createdAt);
            const fromDateTime = new Date(searchParams.fromDate);
            const toDateTime = new Date(searchParams.toDate);
            
            return isSameOrAfterDate(tokenDate, fromDateTime) && 
                   isSameOrBeforeDate(tokenDate, toDateTime);
          })();

          const usernameMatches = (() => {
            if (!searchParams.username) return true;
            return token.userId?.username === searchParams.username;
          })();

          return dateMatches && usernameMatches;
        });

        // Process the data to match the table structure
        const processedTokens = filteredTokens.map(token => ({
          ...token,
          vehicleType: token.vehicleType || token.vehicleId?.vehicleType || 'N/A',
          vehicleRate: token.vehicleRate || 'N/A',
        }));

        setFilteredData(processedTokens);
        setTotalRows(processedTokens.length);
        
        if (processedTokens.length > 0) {
          showSuccess(`Found ${processedTokens.length} matching records`);
        } else {
          showError('No matching records found for the selected criteria');
        }
      } else {
        setFilteredData([]);
        setTotalRows(0);
        showError('No records available');
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

  // Replace initial useEffect
  useEffect(() => {
    fetchTokens();
  }, []);

  // Update handlePageChange to handle client-side pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Update handlePerPageChange for client-side pagination
  const handlePerPageChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
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

  // Update handleConfirm
  const handleConfirm = async () => {
    setShowConfirm(false);
    setCurrentPage(1); // Reset to first page
    setIsFiltered(true); // Set to true when filters are applied

    const searchParams = {
      fromDate: fromDate,
      toDate: toDate,
      ...(selectedUser && { username: selectedUser })
    };

    console.log('Submitting search with params:', searchParams);
    await fetchTokens(searchParams);
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
      { header: 'Driver Mobile No.', key: 'driverMobileNo', width: 15 },
      { header: 'Vehicle Type', key: 'vehicleType', width: 15 },
      { header: 'Vehicle Rate', key: 'vehicleRate', width: 15 },
      { header: 'Vehicle No', key: 'vehicleNo', width: 15 },
      { header: 'Place', key: 'place', width: 20 },
      { header: 'Route', key: 'route', width: 20 },
      { header: 'Token No', key: 'tokenNo', width: 15 },
      { header: 'Challan Pin', key: 'challanPin', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'User', key: 'createdBy', width: 20 },
      { header: 'Created Date', key: 'createdAt', width: 20 }
    ];

    // Format the data for Excel with date and time
    const formattedData = filteredData.map(item => ({
      driverName: item.driverName || 'N/A',
      driverMobileNo: item.driverMobileNo || 'N/A',
      vehicleType: item.vehicleType || 'N/A',
      vehicleRate: item.vehicleRate || 'N/A',
      vehicleNo: item.vehicleNo || 'N/A',
      place: item.place || 'N/A',
      route: item.route || 'N/A',
      tokenNo: item.tokenNo || 'N/A',
      challanPin: item.challanPin || 'N/A',
      quantity: item.quantity || 'N/A',
      createdBy: item.userId?.username || 'N/A',
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
    setUpdateFormData(token);
    setShowUpdateForm(true);
  };

  const handleUpdateSubmit = async (updatedData) => {
    setIsUpdating(true);
    try {
      const authToken = localStorage.getItem('token');
      
      // Log the entire updatedData for debugging
      console.log('Updated Data:', updatedData);

      // Find selected vehicle type from vehicleTypes array
      const selectedVehicle = vehicleTypes.find(type => 
        type.vehicleType === (updatedData.vehicleType || updatedData.vehicleId?.vehicleType)
      );

      if (!selectedVehicle) {
        throw new Error('Please select a valid vehicle type');
      }

      // Extract userId more carefully
      let userId;
      if (updatedData.userId) {
        if (typeof updatedData.userId === 'object') {
          userId = updatedData.userId._id;
        } else if (typeof updatedData.userId === 'string') {
          userId = updatedData.userId;
        }
      }

      // If still no valid userId, try to get it from localStorage
      if (!userId) {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        userId = currentUser?._id;
      }

      if (!userId) {
        throw new Error('Could not determine user ID');
      }

      const updatePayload = {
        vehicleId: selectedVehicle._id,
        userId: userId,
        driverName: updatedData.driverName,
        driverMobileNo: parseInt(updatedData.driverMobileNo) || 0,
        vehicleNo: updatedData.vehicleNo,
        route: updatedData.route || '',
        quantity: parseInt(updatedData.quantity) || 0,
        place: updatedData.place || '',
        challanPin: updatedData.challanPin || '',
        updateRate: true
      };

      // Log the final payload for debugging
      console.log('Sending update payload:', updatePayload);

      const response = await fetch(`http://localhost:8000/api/v1/tokens/${updatedData._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update token');
      }

      const responseData = await response.json();
      console.log('Update response:', responseData);

      await fetchTokens(); // Refresh the data after update
      setShowUpdateForm(false);
      showSuccess('Token updated successfully');

    } catch (error) {
      console.error('Update error:', error);
      showError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedToken || !selectedToken._id) return;

    setIsDeleting(true);
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

      // Remove the deleted token from both states
      setFilteredData(prevData => prevData.filter(t => t._id !== selectedToken._id));
      setTotalRows(prev => prev - 1);
      showSuccess('Token deleted successfully');
      
      // Refresh the token list after deletion
      await fetchTokens();
    } catch (error) {
      console.error('Delete error:', error);
      showError(error.message || 'Failed to delete token');
    } finally {
      setIsDeleting(false);
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
      name: 'Vehicle Type',  // Add this new column
      selector: row => row.vehicleType || 'N/A',  // Updated to use direct vehicleType
      sortable: true,
    },
    {
      name: 'Vehicle Rate',  // New column
      selector: row => row.vehicleRate || 'N/A',  // Updated to use direct vehicleRate
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
              setSelectedToken({ _id: row._id }); // Ensure we capture the _id
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

  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/v1/vehicles/rates', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vehicle types');
        }

        const result = await response.json();
        console.log('Vehicle rates API response:', result); // Log the API response
        if (result.data && result.data.rates) {
          setVehicleTypes(result.data.rates);
        }
      } catch (error) {
        console.error('Error fetching vehicle types:', error);
        showError(error.message);
      }
    };

    fetchVehicleTypes();
  }, []);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Add this function to handle showing all data
  const handleShowFullData = () => {
    setFromDate(null);
    setToDate(null);
    setSelectedUser('');
    setIsFiltered(false); // Set to false when showing full data
    fetchTokens();
  };

  // Add this new function to handle vehicle type change
  const handleVehicleTypeChange = (e) => {
    const selectedVehicleType = e.target.value;
    const selectedVehicle = vehicleTypes.find(type => type.vehicleType === selectedVehicleType);
    console.log('Selected vehicle:', selectedVehicle); // Log selected vehicle data

    if (selectedVehicle) {
      setUpdateFormData({
        ...updateFormData,
        vehicleType: selectedVehicleType,
        vehicleRate: selectedVehicle.rate, // Automatically set the rate
        vehicleId: selectedVehicle
      });
    }
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
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
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
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-8 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 flex items-center justify-center"
              >
                Submit
              </button>
              
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleShowFullData}
                  className="px-8 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 flex items-center justify-center"
                >
                  Show Full Data
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        isFullScreen ? 'fixed inset-0 z-50' : ''
      }`}>
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <button
            onClick={toggleFullScreen}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            {isFullScreen ? <FaCompressAlt /> : <FaExpandAlt />}
            {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          </button>
          {filteredData.length > 0 && (
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
            >
              <FaFileExcel />
              Export to Excel
            </button>
          )}
        </div>
        
        <div className={`${isFullScreen ? 'h-[calc(100vh-80px)] overflow-auto' : ''}`}>
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            paginationPerPage={perPage}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            paginationTotalRows={totalRows}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerPageChange}
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
              <div className="py-8 text-center text-gray-500 text-lg">
                <div className="flex flex-col items-center justify-center">
                  <span className="font-medium">No data available</span>
                  <span className="text-sm text-gray-400 mt-1">Select date range to view tokens</span>
                </div>
              </div>
            }
            customStyles={customStyles}
            sortIcon={<span className="ml-2">↕</span>}
            responsive
            highlightOnHover
            pointerOnHover
            striped
            className={isFullScreen ? 'h-full' : ''}
          />
        </div>
      </div>

      {/* Add Update Form Popup */}
      {showUpdateForm && updateFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pt-20 z-50">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 w-[800px] max-h-[85vh] overflow-y-auto relative">
            {/* Close button */}
            <button
              onClick={() => setShowUpdateForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-300 mb-4">Update Token</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateSubmit(updateFormData);
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Driver Name</label>
                  <input
                    type="text"
                    value={updateFormData.driverName}
                    onChange={(e) => setUpdateFormData({...updateFormData, driverName: e.target.value})}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Driver Mobile No.</label>
                  <input
                    type="text"
                    value={updateFormData.driverMobileNo}
                    onChange={(e) => setUpdateFormData({...updateFormData, driverMobileNo: e.target.value})}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle Type</label>
                  <select
                    value={updateFormData.vehicleType || updateFormData.vehicleId?.vehicleType || ''}
                    onChange={handleVehicleTypeChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  >
                    <option value="">Select Vehicle Type</option>
                    {vehicleTypes.map((type) => (
                      <option key={type._id} value={type.vehicleType}>
                        {type.vehicleType}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle Rate</label>
                  <input
                    type="text"
                    value={updateFormData.vehicleRate || ''}
                    readOnly
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle No</label>
                  <input
                    type="text"
                    value={updateFormData.vehicleNo}
                    onChange={(e) => setUpdateFormData({...updateFormData, vehicleNo: e.target.value})}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Place</label>
                  <input
                    type="text"
                    value={updateFormData.place}
                    onChange={(e) => setUpdateFormData({...updateFormData, place: e.target.value})}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Route</label>
                  <input
                    type="text"
                    value={updateFormData.route}
                    onChange={(e) => setUpdateFormData({...updateFormData, route: e.target.value})}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Challan Pin</label>
                  <input
                    type="text"
                    value={updateFormData.challanPin}
                    onChange={(e) => setUpdateFormData({...updateFormData, challanPin: e.target.value})}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Quantity</label>
                  <input
                    type="number"
                    value={updateFormData.quantity}
                    onChange={(e) => setUpdateFormData({...updateFormData, quantity: e.target.value})}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Token_list;
