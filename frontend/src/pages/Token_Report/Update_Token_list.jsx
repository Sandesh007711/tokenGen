import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import "react-datepicker/dist/react-datepicker.css";

/**
 * UpdateTokenList Component
 * Handles the display and filtering of updated tokens report
 * Features: Date range selection, user filtering, and tabular display of updated token data
 */
const Update_Token_list = () => {
  // Add confirmation state
  const [showConfirm, setShowConfirm] = useState(false);
  // Same state management as Token_list
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [perPage, setPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  // Error handling and form submission functions
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  };

  // Update fetchTokens to return a promise and handle state updates more carefully
  const fetchTokens = async (searchParams = {}, newPage = currentPage) => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      
      const queryParams = new URLSearchParams({
        updated: true,
        page: newPage,
        limit: perPage,
        ...(searchParams.fromDate && { fromDate: searchParams.fromDate.toISOString() }),
        ...(searchParams.toDate && { toDate: searchParams.toDate.toISOString() }),
        ...(searchParams.username && { username: searchParams.username })
      });

      const apiUrl = `http://localhost:8000/api/v1/tokens?${queryParams}`;
      console.log('Fetching with pagination:', { page: newPage, perPage });

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.status === 'success') {
        // Only update state after successful fetch
        setFilteredData(result.data);
        setTotalRows(result.totalCount || 0);
        setCurrentPage(newPage); // Update page only after successful data fetch
        
        if (result.data.length === 0) {
          showError('No matching records found for the selected criteria');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Fetch error:', error);
      showError(error.message);
      setFilteredData([]);
      setTotalRows(0);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to handle pagination changes
  useEffect(() => {
    const initializePage = async () => {
      await fetchTokens({}, currentPage);
    };
    initializePage();
  }, [perPage]); // Remove currentPage dependency to prevent double fetching

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          showError('Authentication token not found');
          return;
        }

        const response = await fetch('http://localhost:8000/api/v1/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch users');
        }

        if (result.status === 'success' && Array.isArray(result.data)) {
          setUsers(result.data);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        console.error('Fetch users error:', error);
        showError(error.message || 'Error fetching users');
      }
    };

    fetchUsers();
  }, []);

  // Update handleSubmit to show confirmation
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) {
      showError('Please select a user');
      return;
    }
    setShowConfirm(true);
  };

  // Update handleConfirm to use the new fetchTokens
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const searchParams = {
        fromDate: fromDate,
        toDate: toDate,
        ...(selectedUser && { username: selectedUser })
      };

      const success = await fetchTokens(searchParams, 1);
      if (success) {
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('Filter error:', error);
      showError('Error filtering data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update handleShowAll to use the new fetchTokens
  const handleShowAll = async () => {
    setSelectedUser('');
    setFromDate(new Date());
    setToDate(new Date());
    await fetchTokens({}, 1);
  };

  // Add function to check if data is filtered
  const isDataFiltered = () => {
    return filteredData.length !== tokens.length || 
           JSON.stringify(filteredData) !== JSON.stringify(tokens);
  };

  // Update pagination handlers to wait for data before changing page
  const handlePageChange = async (page) => {
    console.log('Changing to page:', page);
    const success = await fetchTokens({}, page);
    if (!success) {
      showError('Failed to load page data');
    }
  };

  const handlePerPageChange = async (newPerPage, page) => {
    console.log('Changing rows per page:', { newPerPage, page });
    setPerPage(newPerPage);
    const success = await fetchTokens({}, page);
    if (!success) {
      showError('Failed to update rows per page');
    }
  };

  // Add this after your existing state declarations
  const columns = [
    {
      name: 'Token No',
      selector: row => row.tokenNo,
      sortable: true,
    },
    {
      name: 'Driver Name',
      selector: row => row.driverName,
      sortable: true,
    },
    {
      name: 'Mobile No',
      selector: row => row.driverMobileNo,
      sortable: true,
    },
    {
      name: 'Vehicle No',
      selector: row => row.vehicleNo,
      sortable: true,
    },
    {
      name: 'Vehicle Type',
      selector: row => row.vehicleType,
      sortable: true,
    },
    {
      name: 'Place',
      selector: row => row.place,
      sortable: true,
    },
    {
      name: 'Quantity',
      selector: row => row.quantity,
      sortable: true,
    },
    {
      name: 'Route',
      selector: row => row.route,
      sortable: true,
    },
    {
      name: 'Challan Pin',
      selector: row => row.challanPin,
      sortable: true,
    },
    {
      name: 'Username',
      selector: row => row.userId?.username,
      sortable: true,
    },
    {
      name: 'Created At',
      selector: row => new Date(row.createdAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      }),
      sortable: true,
    },
  ];

  // Add custom styles for DataTable
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f1f5f9',
        borderRadius: '0.5rem 0.5rem 0 0',
      },
    },
    headCells: {
      style: {
        fontSize: '0.95rem',
        fontWeight: '600',
        padding: '1rem',
      },
    },
    rows: {
      style: {
        fontSize: '0.875rem',
        padding: '0.5rem 1rem',
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
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm'
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

      {/* Header Section with Form */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-300">Updated Token Report</h1>
          {/* Only show button when data is filtered */}
          {isDataFiltered() && (
            <button
              onClick={handleShowAll}
              className="bg-gradient-to-r from-slate-400 via-gray-500 to-black hover:from-black hover:via-gray-500 hover:to-slate-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02] flex items-center gap-2"
            >
              Show All Tokens
            </button>
          )}
        </div>
        
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
            disabled={loading}
          >
            <option value="">Select User</option>
            {users && users.length > 0 ? (
              users.map((user) => (
                <option key={user._id} value={user.username}>
                  {user.username} ({user.route})
                </option>
              ))
            ) : (
              <option value="" disabled>
                {loading ? 'Loading users...' : 'No users available'}
              </option>
            )}
          </select>

          <button
            type="submit"
            className="px-8 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" />
                Processing...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </form>
      </div>

      {/* Updated Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
          progressPending={loading}
          progressComponent={
            <div className="flex items-center justify-center gap-2 py-8">
              <FaSpinner className="animate-spin text-2xl" />
              <span>Loading data...</span>
            </div>
          }
          customStyles={customStyles}
          noDataComponent={
            <div className="py-8 text-center text-gray-500 text-lg">
              No data available
            </div>
          }
          responsive
          highlightOnHover
          pointerOnHover
        />
      </div>
    </div>
  );
};

export default Update_Token_list;