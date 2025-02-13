import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaTimes, FaSpinner, FaExpandAlt, FaCompressAlt } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import "react-datepicker/dist/react-datepicker.css";

/**
 * LoadedList Component
 * Handles the display and filtering of loaded tokens report
 * Features: Date range selection, user filtering, and tabular display of loaded token data
 */
const Loaded_list = () => {
  const [isFiltered, setIsFiltered] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [filteredData, setFilteredData] = useState([]);
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });
  const [perPage, setPerPage] = useState(20); // Changed default to 20 to match Token_list
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0); // Add this state

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // Changed from 'authToken' to 'token'
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  };

  // Simplify fetchUsers to only set users
  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const headers = getAuthHeaders();

      const response = await fetch('http://localhost:8000/api/v1/users', {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Raw API response:', data);

      if (data.status === 'success' && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        console.error('Invalid users data structure:', data);
        showError('Invalid users data format');
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      showError('Failed to fetch users: ' + error.message);
    }
  };

  // Update the fetchTokenData function to use the correct endpoint
  const fetchTokenData = async (searchParams = {}, newPage = currentPage) => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        loaded: true, // Change this from previous implementation
        page: newPage,
        limit: perPage,
        ...(searchParams.fromDate && { fromDate: searchParams.fromDate.toISOString() }),
        ...(searchParams.toDate && { toDate: searchParams.toDate.toISOString() }),
        ...(searchParams.username && { username: searchParams.username })
      });

      // Update API URL to use the tokens endpoint
      const apiUrl = `http://localhost:8000/api/v1/tokens?${queryParams}`;
      console.log('Fetching loaded tokens with URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      
      // Log the complete API response
      console.log('API Response:', result);

      if (result.status === 'success') {
        setFilteredData(result.data);
        setTotalRows(result.totalCount || 0);
        setCurrentPage(newPage); // Update page only after successful data fetch
        
        if (result.data.length > 0) {
          showSuccess(`Found ${result.totalCount} matching records`);
        } else {
          showError('No matching records found for the selected criteria');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in fetchTokenData:', error);
      showError(error.message);
      setFilteredData([]);
      setTotalRows(0);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove loadInitialData function since we're using fetchTokenData for everything
  useEffect(() => {
    fetchUsers();
    const initializePage = async () => {
      await fetchTokenData({}, currentPage);
    };
    initializePage();
  }, [perPage]); // Remove currentPage dependency

  // Error handling and form submission functions
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000);
  };

  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => {
      setSuccessPopup({ show: false, message: '' });
    }, 3000);
  };

  // Modified handleSubmit - removed user check
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  // Update handleShowFullData to reset pagination
  const handleShowFullData = async () => {
    setFromDate(null);
    setToDate(null);
    setSelectedUser('');
    setIsFiltered(false);
    setCurrentPage(1); // Reset to first page
    await fetchTokenData({}, 1);
  };

  // Update handleConfirm to reset pagination
  const handleConfirm = async () => {
    setShowConfirm(false);
    setCurrentPage(1); // Reset to first page
    setIsFiltered(true);

    const searchParams = {
      fromDate: fromDate,
      toDate: toDate,
      ...(selectedUser && { username: selectedUser })
    };

    const success = await fetchTokenData(searchParams, 1);
    if (!success) {
      showError('Failed to fetch filtered data');
    }
  };

  // Add these new functions
  const handlePageChange = async (page) => {
    console.log('Changing to page:', page);
    const success = await fetchTokenData({}, page);
    if (!success) {
      showError('Failed to load page data');
    }
  };

  const handlePerPageChange = async (newPerPage, page) => {
    console.log('Changing rows per page:', { newPerPage, page });
    setPerPage(newPerPage);
    const success = await fetchTokenData({}, page);
    if (!success) {
      showError('Failed to update rows per page');
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  };

  // Define columns for DataTable
  const columns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1 + (currentPage - 1) * perPage,
      sortable: false,
      width: '80px',
    },
    {
      name: 'Loaded Date',
      selector: row => formatDateTime(row.loadedAt),
      sortable: true,
      width: '200px',
      wrap: true,
    },
    {
      name: 'Token No',
      selector: row => row.tokenNo,
      sortable: true,
      width: '120px',
    },
    {
      name: 'Driver Name',
      selector: row => row.driverName,
      sortable: true,
      width: '150px',
      wrap: true,
    },
    {
      name: 'Vehicle No',
      selector: row => row.vehicleNo,
      sortable: true,
      width: '130px',
    },
    {
      name: 'Vehicle Type',
      selector: row => row.vehicleType || row.vehicleId?.vehicleType || 'N/A',
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Vehicle Rate',
      selector: row => row.vehicleRate || 'N/A',
      sortable: true,
      width: '120px',
    },
    {
      name: 'Quantity',
      selector: row => row.quantity,
      sortable: true,
      width: '100px',
    },
    {
      name: 'Place',
      selector: row => row.place,
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Route',
      selector: row => row.route || 'N/A',
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Operator',
      selector: row => row.userId?.username || 'N/A',
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Challan Pin',
      selector: row => row.challanPin || 'N/A',
      sortable: true,
      width: '120px',
    },
  ];

  // Update custom styles to match the formatting
  const customStyles = {
    headRow: {
      style: {
        background: 'linear-gradient(to right, #94a3b8, #cbd5e1, #e2e8f0)',
        fontWeight: 'bold',
        minHeight: '52px',
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        padding: '8px',
        justifyContent: 'center',
        textAlign: 'center',
        fontWeight: '600',
      },
    },
    cells: {
      style: {
        padding: '8px',
        justifyContent: 'center',
        textAlign: 'center',
        '&:not(:last-of-type)': {
          borderRightWidth: '1px',
          borderRightColor: '#e5e7eb',
        },
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
  };

  return (
    <div className="p-7 max-w-7xl mx-auto">
      {/* Add Confirmation Popup */}
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
        <h1 className="text-2xl font-bold text-gray-300 mb-4">Loaded Report</h1>
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

          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300 min-w-[200px]"
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user._id} value={user.username}>
                {user.username} ({user.route})
              </option>
            ))}
          </select>

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
        </form>
      </div>

      {/* Replace the existing table section with DataTable */}
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
        </div>
        
        <div className={`${isFullScreen ? 'h-[calc(100vh-80px)] overflow-auto' : ''}`}>
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationPerPage={perPage}
            paginationDefaultPage={currentPage}
            paginationRowsPerPageOptions={[10, 20, 25, 50, 100]}
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
                  <span className="text-sm text-gray-400 mt-1">Select date range to view records</span>
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
    </div>
  );
};

export default Loaded_list;
