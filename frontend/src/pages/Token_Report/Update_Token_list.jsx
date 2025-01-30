import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaTimes, FaSpinner } from 'react-icons/fa';
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

  // Error handling and form submission functions
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000);
  };

  // Fetch tokens data with authentication
  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          showError('Authentication token not found');
          return;
        }

        const response = await fetch('http://localhost:8000/api/v1/tokens/updated', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Raw API Response:', result);

        if (result.status === 'success' && Array.isArray(result.data)) {
          const filteredTokens = result.data.filter(token => token.updatedBy === "dks");
          setTokens(filteredTokens);
          setFilteredData(filteredTokens);
        } else {
          showError('Invalid data format received');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        showError(error.message);
      }
      setLoading(false);
    };

    fetchTokens();
  }, []);

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
        console.log('Users API Response:', result); // Debug log

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch users');
        }

        // Check the actual structure of your API response
        if (result.data) {
          console.log('Users data:', result.data); // Debug log
          // Assuming the API returns an array of users directly or nested
          const userData = Array.isArray(result.data) ? result.data : result.data.users;
          if (Array.isArray(userData)) {
            setUsers(userData);
          } else {
            console.error('Unexpected users data structure:', userData);
            showError('Invalid user data structure');
          }
        } else {
          console.error('No data in response:', result);
          showError('No user data received');
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

  // Update handleConfirm to filter based on date range and selected user
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (!tokens.length) {
        showError('No tokens available to filter');
        return;
      }

      // Set time to start of day for fromDate and end of day for toDate
      const startDate = new Date(fromDate.setHours(0, 0, 0, 0));
      const endDate = new Date(toDate.setHours(23, 59, 59, 999));

      const filtered = tokens.filter(token => {
        const tokenDate = new Date(token.updatedAt);
        
        // Debug logs
        console.log('Token being checked:', {
          tokenDate,
          startDate,
          endDate,
          tokenUsername: token.userId?.username,
          selectedUser,
          isInDateRange: tokenDate >= startDate && tokenDate <= endDate,
          matchesUser: !selectedUser || token.userId?.username === selectedUser
        });

        const matchesDateRange = tokenDate >= startDate && tokenDate <= endDate;
        const matchesUser = !selectedUser || token.userId?.username === selectedUser;

        return matchesDateRange && matchesUser;
      });

      console.log('Filtered results:', filtered);
      setFilteredData(filtered);
      setShowConfirm(false);
    } catch (error) {
      console.error('Filter error:', error);
      showError('Error filtering data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add handleShowAll function
  const handleShowAll = () => {
    setFilteredData(tokens);
    setSelectedUser('');
    setFromDate(new Date());
    setToDate(new Date());
  };

  // Add function to check if data is filtered
  const isDataFiltered = () => {
    return filteredData.length !== tokens.length || 
           JSON.stringify(filteredData) !== JSON.stringify(tokens);
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
                  {user.username || user.name || 'Unnamed User'}
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
            className="bg-gradient-to-r from-slate-400 via-gray-500 to-black hover:from-black hover:via-gray-500 hover:to-slate-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
          >
            {loading || isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" />
                {loading ? 'Loading...' : 'Processing...'}
              </>
            ) : (
              'Submit'
            )}
          </button>
        </form>
      </div>

      {/* Updated Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Token No</th>
              <th className="py-3 px-4 text-left font-semibold">Driver Name</th>
              <th className="py-3 px-4 text-left font-semibold">Mobile No</th>
              <th className="py-3 px-4 text-left font-semibold">Vehicle No</th>
              <th className="py-3 px-4 text-left font-semibold">Vehicle Type</th>
              <th className="py-3 px-4 text-left font-semibold">Place</th>
              <th className="py-3 px-4 text-left font-semibold">Quantity</th>
              <th className="py-3 px-4 text-left font-semibold">Route</th>
              <th className="py-3 px-4 text-left font-semibold">Challan Pin</th>
              <th className="py-3 px-4 text-left font-semibold">Username</th>
              <th className="py-3 px-4 text-left font-semibold">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="11" className="py-8 text-center text-gray-500 text-lg">
                  <div className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin text-2xl" />
                    Loading data...
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="11" className="py-8 text-center text-gray-500 text-lg">
                  No data available
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition duration-200">
                  <td className="py-3 px-4">{item.tokenNo}</td>
                  <td className="py-3 px-4">{item.driverName}</td>
                  <td className="py-3 px-4">{item.driverMobileNo}</td>
                  <td className="py-3 px-4">{item.vehicleNo}</td>
                  <td className="py-3 px-4">{item.vehicleId?.vehicleType}</td>
                  <td className="py-3 px-4">{item.place}</td>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">{item.route}</td>
                  <td className="py-3 px-4">{item.challanPin}</td>
                  <td className="py-3 px-4">{item.userId?.username}</td>
                  <td className="py-3 px-4">
                    {new Date(item.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'medium'
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Update_Token_list;