import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaTimes } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";
import DataTable from 'react-data-table-component';

/**
 * DeleteTokenList Component
 * Handles the display and filtering of deleted tokens report
 * Features: Date range selection, user filtering, and tabular display of deleted token data
 */
const Delete_Token_list = () => {
  // Add confirmation state
  const [showConfirm, setShowConfirm] = useState(false);
  // Same state management as Token_list
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
        if (result.status === 'success' && Array.isArray(result.data)) {
          setUsers(result.data);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        showError(error.message);
      }
    };

    fetchUsers();
  }, []);

  // Add initial data fetch
  useEffect(() => {
    // Fetch initial data when component mounts
    fetchDeletedTokens();
  }, []);

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

  // Error handling and submit functions
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000);
  };

  // Update handleSubmit to show confirmation
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  // Update formatDateTime function to handle timezone
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata' // Add IST timezone
    });
  };

  // Update fetchDeletedTokens function
  const fetchDeletedTokens = async (searchParams = {}) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Build query string manually to ensure proper formatting
      let queryString = 'deleted=true';
      if (searchParams.fromDate) queryString += `&fromDate=${searchParams.fromDate.toISOString()}`;
      if (searchParams.toDate) queryString += `&toDate=${searchParams.toDate.toISOString()}`;
      if (searchParams.username) queryString += `&username=${searchParams.username}`;

      console.log('Query string:', queryString);

      const response = await fetch(`http://localhost:8000/api/v1/tokens?${queryString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch deleted tokens');
      }

      const result = await response.json();
      console.log('API Response:', result);

      // The response is already an array of tokens
      const tokens = result.data || [];
      
      // Filter only deleted tokens
      const deletedTokens = tokens.filter(token => token.deletedAt);
      console.log('Filtered deleted tokens:', deletedTokens);
      
      if (deletedTokens.length > 0) {
        const processedData = deletedTokens.map(token => ({
          name: token.driverName || 'N/A',
          mobileNo: token.driverMobileNo || 'N/A',
          place: token.place || 'N/A',
          quantity: token.quantity || 'N/A',
          route: token.route || 'N/A',
          tokenNo: token.tokenNo || 'N/A',
          vehicleNo: token.vehicleNo || 'N/A',
          vehicleType: token.vehicleType || token.vehicleId?.vehicleType || 'N/A', // Add vehicleType
          vehicleRate: token.vehicleRate || 'N/A', // Add vehicleRate
          challanPin: token.challanPin || 'N/A',
          username: token.userId?.username || 'N/A',
          createdAt: formatDateTime(token.createdAt),
          deletedAt: formatDateTime(token.deletedAt),
          updatedBy: token.updatedBy || 'N/A'
        }));
        setFilteredData(processedData);
      } else {
        setFilteredData([]);
      }
    } catch (error) {
      console.error('Error fetching deleted tokens:', error);
      showError(error.message);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update handleConfirm function
  const handleConfirm = async () => {
    const searchParams = {
      fromDate: fromDate,
      toDate: toDate,
      username: selectedUser || undefined // Only include if selected
    };
    await fetchDeletedTokens(searchParams);
    setShowConfirm(false);
  };

  // Define columns for DataTable
  const columns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1,
      sortable: false,
      width: '80px',
    },
    {
      name: 'Deleted Date',
      selector: row => row.deletedAt,
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
      selector: row => row.name,
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
      selector: row => row.vehicleType,
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Vehicle Rate',
      selector: row => row.vehicleRate,
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
      selector: row => row.route,
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Operator',
      selector: row => row.username,
      sortable: true,
      width: '130px',
      wrap: true,
    },
    {
      name: 'Challan Pin',
      selector: row => row.challanPin,
      sortable: true,
      width: '120px',
    },
  ];

  // Update custom styles to match other components
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

      {/* Header Section with Form */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-300 mb-4">Deleted Token Report</h1>
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
            {Array.isArray(users) && users.map((user) => (
              <option key={user._id} value={user.username}>
                {user.username} ({user.route})
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-8 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 flex items-center justify-center"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Replace Table Section with DataTable */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          customStyles={customStyles}
          pagination
          responsive
          highlightOnHover
          pointerOnHover
          progressPending={isLoading}
          progressComponent={
            <div className="py-8 text-center text-gray-500 text-lg">
              Loading...
            </div>
          }
          noDataComponent={
            <div className="py-8 text-center text-gray-500 text-lg">
              No data available
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Delete_Token_list;