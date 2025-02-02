import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaTimes } from 'react-icons/fa';
import "react-datepicker/dist/react-datepicker.css";

/**
 * LoadedList Component
 * Handles the display and filtering of loaded tokens report
 * Features: Date range selection, user filtering, and tabular display of loaded token data
 */
const Loaded_list = () => {
  // State Management
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

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

      // Handle the correct API response structure
      if (data.status === 'success' && data.data && data.data.users) {
        const usersArray = data.data.users;
        const uniqueUsers = usersArray.map(user => ({
          id: user._id,
          name: user.username
        }));
        console.log('Processed users for dropdown:', uniqueUsers);
        setUsers(uniqueUsers);
      } else {
        console.error('Invalid users data structure:', data);
        showError('Invalid users data format');
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      showError('Failed to fetch users: ' + error.message);
    }
  };

  // Add new function for initial data load
  const loadInitialData = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch('http://localhost:8000/api/v1/tokens/loaded', {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      console.log('Initial data load:', data);

      if (data.status === 'success' && Array.isArray(data.data)) {
        setFilteredData(data.data);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      showError(error.message);
    }
  };

  // Modified fetchTokenData function
  const fetchTokenData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch('http://localhost:8000/api/v1/tokens/loaded', {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Fetch data response:', data);

      if (data.status === 'success' && Array.isArray(data.data)) {
        let tokens = data.data;

        // Apply user filter if selected
        if (selectedUser && selectedUser !== '') {
          tokens = tokens.filter(token => token.driverName === selectedUser);
        }

        // Apply date filter if dates are valid
        if (fromDate && toDate) {
          const start = new Date(fromDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(toDate);
          end.setHours(23, 59, 59, 999);

          tokens = tokens.filter(token => {
            const date = new Date(token.createdAt);
            return date >= start && date <= end;
          });
        }

        setFilteredData(tokens);
      }
    } catch (error) {
      console.error('Error in fetchTokenData:', error);
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Modified useEffects
  useEffect(() => {
    fetchUsers();
    loadInitialData(); // Load initial data when component mounts
  }, []);

  // Error handling and form submission functions
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) {
      showError('Please select a user');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    fetchTokenData();
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
            <option key="default" value="">Select User</option>
            {users.map((user) => (
              <option key={`user-${user.id}`} value={user.name}>
                {user.name}
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
        {loading ? (
          <div className="py-8 text-center text-gray-500 text-lg">
            Loading data...
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Driver Name</th>
                <th className="py-3 px-4 text-left font-semibold">Mobile No</th>
                <th className="py-3 px-4 text-left font-semibold">Token No</th>
                <th className="py-3 px-4 text-left font-semibold">Challan Pin</th>
                <th className="py-3 px-4 text-left font-semibold">Place</th>
                <th className="py-3 px-4 text-left font-semibold">Route</th>
                <th className="py-3 px-4 text-left font-semibold">Quantity</th>
                <th className="py-3 px-4 text-left font-semibold">Vehicle Type</th>
                <th className="py-3 px-4 text-left font-semibold">Vehicle No</th>
                <th className="py-3 px-4 text-left font-semibold">Created By</th>
                <th className="py-3 px-4 text-left font-semibold">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-8 text-center text-gray-500 text-lg">
                    No data available
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition duration-200">
                    <td className="py-3 px-4">{item.driverName}</td>
                    <td className="py-3 px-4">{item.driverMobileNo}</td>
                    <td className="py-3 px-4">{item.tokenNo}</td>
                    <td className="py-3 px-4">{item.challanPin}</td>
                    <td className="py-3 px-4">{item.place}</td>
                    <td className="py-3 px-4">{item.route}</td>
                    <td className="py-3 px-4">{item.quantity}</td>
                    <td className="py-3 px-4">{item.vehicleId?.vehicleType}</td>
                    <td className="py-3 px-4">{item.vehicleNo}</td>
                    <td className="py-3 px-4">{item.userId?.username}</td>
                    <td className="py-3 px-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Loaded_list;
