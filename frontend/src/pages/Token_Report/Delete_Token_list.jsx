import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaTimes } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";

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
    if (!selectedUser) {
      showError('Please select a user');
      return;
    }
    setShowConfirm(true);
  };

  // Add helper function to format date and time
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Add fetchDeletedTokens function
  const fetchDeletedTokens = async (searchParams = {}) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        deleted: true,
        ...(searchParams.username && { username: searchParams.username }),
        ...(searchParams.fromDate && { fromDate: searchParams.fromDate.toISOString() }),
        ...(searchParams.toDate && { toDate: searchParams.toDate.toISOString() })
      });

      const response = await fetch(`http://localhost:8000/api/v1/tokens?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deleted tokens');
      }

      const result = await response.json();
      const tokenData = result.data?.tokens || [];
      
      if (tokenData.length > 0) {
        const processedData = tokenData.map((token, index) => ({
          serialNo: index + 1,
          updatedDate: formatDateTime(token.updatedAt || token.createdAt),
          tokenNo: token.tokenNo,
          driverName: token.driverName,
          vehicleNo: token.vehicleNo || 'N/A',
          vehicleType: token.vehicleType || token.vehicleId?.vehicleType || 'N/A',
          rate: token.rate || 'N/A',
          quantity: token.quantity || 'N/A',
          place: token.place || 'N/A',
          route: token.route || 'N/A',
          operator: token.operator || 'N/A',
          chalan: token.chalanNo || 'N/A',
          deletedBy: token.deletedBy?.username || 'N/A'
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
      fromDate,
      toDate,
      ...(selectedUser && { username: selectedUser })
    };
    await fetchDeletedTokens(searchParams);
    setShowConfirm(false);
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
                {user.username}
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

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">S.N.</th>
              <th className="py-3 px-4 text-left font-semibold">Updated Date</th>
              <th className="py-3 px-4 text-left font-semibold">Token No</th>
              <th className="py-3 px-4 text-left font-semibold">Driver</th>
              <th className="py-3 px-4 text-left font-semibold">Vehicle No</th>
              <th className="py-3 px-4 text-left font-semibold">Vehicle Type</th>
              <th className="py-3 px-4 text-left font-semibold">Rate</th>
              <th className="py-3 px-4 text-left font-semibold">Quantity</th>
              <th className="py-3 px-4 text-left font-semibold">Place</th>
              <th className="py-3 px-4 text-left font-semibold">Route</th>
              <th className="py-3 px-4 text-left font-semibold">Operator</th>
              <th className="py-3 px-4 text-left font-semibold">Chalan</th>
              <th className="py-3 px-4 text-left font-semibold">Deleted By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="13" className="py-8 text-center text-gray-500 text-lg">
                  Loading...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="13" className="py-8 text-center text-gray-500 text-lg">
                  No data available
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.serialNo} className="hover:bg-gray-50 transition duration-200">
                  <td className="py-3 px-4">{item.serialNo}</td>
                  <td className="py-3 px-4">{item.updatedDate}</td>
                  <td className="py-3 px-4">{item.tokenNo}</td>
                  <td className="py-3 px-4">{item.driverName}</td>
                  <td className="py-3 px-4">{item.vehicleNo}</td>
                  <td className="py-3 px-4">{item.vehicleType}</td>
                  <td className="py-3 px-4">{item.rate}</td>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">{item.place}</td>
                  <td className="py-3 px-4">{item.route}</td>
                  <td className="py-3 px-4">{item.operator}</td>
                  <td className="py-3 px-4">{item.chalan}</td>
                  <td className="py-3 px-4">{item.deletedBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Delete_Token_list;