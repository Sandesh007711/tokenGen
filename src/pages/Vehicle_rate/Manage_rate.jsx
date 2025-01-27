import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaEdit, FaTrash, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

/**
 * ManageRate Component
 * Handles the management of vehicle rates including adding, editing, and deleting rates
 * Features: Vehicle type selection, rate input with validation, and tabular display of rates
 */
const ManageRate = () => {
  // State Management
  const [selectedVehicle, setSelectedVehicle] = useState('');  // Selected vehicle from dropdown
  const [rate, setRate] = useState('');                        // Rate input value
  const [rates, setRates] = useState([]);                      // List of all vehicle rates
  const [editingId, setEditingId] = useState(null);           // ID of rate being edited
  const [inputError, setInputError] = useState('');           // Error message for validation
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' }); // Error popup state
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' }); // Success popup state
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null }); // Add this state
  const [vehicles, setVehicles] = useState([]); // New state for vehicles from API
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Add mounting ref to prevent unnecessary fetches
  const isMounted = useRef(true);
  const fetchTimeoutRef = useRef(null);

  // Improved debounce utility with cleanup
  const debounce = useCallback((func, wait) => {
    return (...args) => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      fetchTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          func.apply(null, args);
        }
      }, wait);
    };
  }, []);

  // Modified fetchAllRates function
  const fetchAllRates = async (vehiclesList) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      // Get existing rates from vehicles
      const currentRates = await Promise.all(
        vehiclesList.map(async (vehicle) => {
          try {
            const response = await fetch(`http://localhost:7002/api/v1/vehicles/${vehicle._id}/rate`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            // If rate exists, use it
            if (response.ok) {
              const data = await response.json();
              if (data.data?.vehicleRate) {
                return {
                  id: vehicle._id,
                  vehicleType: vehicle.vehicleType,
                  rate: data.data.vehicleRate,
                  vehicleData: vehicle
                };
              }
            }
            return null;
          } catch (error) {
            return null;
          }
        })
      );

      // Filter out null values and set rates
      const validRates = currentRates.filter(rate => rate !== null);
      setRates(validRates);
    } catch (error) {
      console.error('Error in fetchAllRates:', error);
      showError('Failed to fetch rates');
    }
  };

  // Modified fetchVehicles function
  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:7002/api/v1/vehicles', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch vehicles: ${response.status}`);
      }

      const result = await response.json();
      const vehiclesList = result.data?.vehicles || [];

      // Initialize vehicles with correct property name
      setVehicles(vehiclesList);
      
      // Initialize rates with correct property name
      const initialRates = vehiclesList.map(vehicle => ({
        id: vehicle._id,
        vehicleType: vehicle.vehicleType,
        rate: 0
      }));
      setRates(initialRates);
    } catch (error) {
      console.error('Fetch Error:', error);
      showError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Modified fetchRatesList function to handle correct response format
  const fetchRatesList = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:7002/api/v1/vehicles/rates', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch rates');

      const result = await response.json();
      console.log('Rates response:', result);

      // Check if data exists in the response with correct structure
      if (result.status === 'success' && result.data && Array.isArray(result.data.rates)) {
        const formattedRates = result.data.rates.map(rate => ({
          id: rate._id,
          vehicleType: rate.vehicleType,
          rate: rate.rate,
          active: true
        }));
        console.log('Formatted rates:', formattedRates);
        setRates(formattedRates);
      } else {
        console.error('Invalid rates format:', result);
        setRates([]);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      showError('Failed to fetch rates');
    }
  };

  // Modified useEffect to fetch vehicles and rates
  useEffect(() => {
    const initializeData = async () => {
      await fetchVehicles();
      await fetchRatesList();
      setIsLoading(false);
    };
    initializeData();
  }, []);

  /**
   * Handles rate input changes with validation
   * Only allows numbers and decimal points
   * @param {Event} e - Input change event
   */
  const handleRateChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setRate(value);
      setErrorPopup({ show: false, message: '' });
    } else {
      showError('Please enter numbers only');
    }
  };

  // Add new rate
  const addRate = async (vehicleId, rate) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`http://localhost:7002/api/v1/vehicles/${vehicleId}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vehicleRate: rate })
      });

      if (!response.ok) throw new Error('Failed to add rate');

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(error.message || 'Failed to add rate');
    }
  };

  // Update existing rate
  const updateRate = async (vehicleId, rate) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`http://localhost:7002/api/v1/vehicles/${vehicleId}/rate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vehicleRate: rate })
      });

      if (!response.ok) throw new Error('Failed to update rate');

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(error.message || 'Failed to update rate');
    }
  };

  // Delete rate
  const deleteRate = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`http://localhost:7002/api/v1/vehicles/${vehicleId}/rate`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete rate');

      return true;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete rate');
    }
  };

  // Modified handleAddRate function
  const handleAddRate = async () => {
    if (!selectedVehicle || !rate) {
      showError('Please fill in all fields');
      return;
    }

    try {
      const vehicle = vehicles.find(v => v.vehicleType === selectedVehicle);
      if (!vehicle) {
        showError('Vehicle not found');
        return;
      }

      if (editingId) {
        await updateRate(editingId, parseFloat(rate));
      } else {
        await addRate(vehicle._id, parseFloat(rate));
      }

      // Refresh rates list after add/update
      await fetchRatesList();
      resetForm();
      showSuccess(editingId ? 'Rate updated successfully!' : 'Rate added successfully!');
    } catch (error) {
      console.error('Error in handleAddRate:', error);
      showError(error.message);
    }
  };

  /**
   * Handles editing an existing rate
   * Populates form with selected rate data
   * @param {Object} item - Rate item to edit
   */
  const handleEdit = (item) => {
    setSelectedVehicle(item.vehicleType);
    setRate(item.rate.toString());
    setEditingId(item.id);
  };

  /**
   * Handles deleting a rate
   * Resets form if deleting currently edited item
   * @param {number} id - ID of rate to delete
   */
  const handleDelete = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  // Modified confirmDelete function to refresh rates after deletion
  const confirmDelete = async () => {
    try {
      await deleteRate(deleteConfirm.id);
      await fetchRatesList(); // Refresh rates after deletion
      setDeleteConfirm({ show: false, id: null });
      showSuccess('Rate deleted successfully!');
      if (deleteConfirm.id === editingId) {
        resetForm();
      }
    } catch (error) {
      showError(error.message);
    }
  };

  /**
   * Resets form to initial state
   * Clears selection, input, and error message
   */
  const resetForm = () => {
    setRate('');
    setEditingId(null);
    setInputError('');
    // Don't reset selectedVehicle here
  };

  /**
   * Shows error popup with message
   * @param {string} message - Error message to display
   */
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000); // Hide after 3 seconds
  };

  /**
   * Shows success popup with message
   * @param {string} message - Success message to display
   */
  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => {
      setSuccessPopup({ show: false, message: '' });
    }, 3000); // Hide after 3 seconds
  };

  // Add loading spinner component
  const LoadingSpinner = () => (
    <tr>
      <td colSpan="3" className="py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-3 text-gray-600 font-medium">Loading rates data...</p>
        </div>
      </td>
    </tr>
  );

  // Modified table body section
  const tableBody = (
    <tbody className="divide-y divide-gray-200">
      {isLoading ? (
        <LoadingSpinner />
      ) : rates.length === 0 ? (
        <tr>
          <td colSpan="3" className="py-8 text-center text-gray-500 text-lg">
            No vehicle rates available
          </td>
        </tr>
      ) : (
        rates.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 transition duration-200">
            <td className="py-3 px-4">{item.vehicleType}</td>
            <td className="py-3 px-4">₹{item.rate}</td>
            <td className="py-3 px-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-600 hover:to-yellow-400 text-white px-3 py-1 rounded-full flex items-center transition duration-300 transform hover:scale-105"
                >
                  <FaEdit className="mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-gradient-to-r from-red-400 to-red-600 hover:from-red-600 hover:to-red-400 text-white px-3 py-1 rounded-full flex items-center transition duration-300 transform hover:scale-105"
                >
                  <FaTrash className="mr-1" />
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  );

  return (
    <div className="p-7 max-w-7xl mx-auto">
      {/* Success Popup */}
      {successPopup.show && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in-top z-50">
          <FaCheckCircle />
          <span>{successPopup.message}</span>
          <button
            onClick={() => setSuccessPopup({ show: false, message: '' })}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes />
          </button>
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

      {/* Delete Confirmation Popup */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center text-yellow-500 mb-4">
              <FaExclamationTriangle className="text-2xl mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this rate? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section with Form */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-300 mb-4">Manage Vehicle Rates</h1>
        <div className="flex flex-wrap items-center gap-4">
          {/* Vehicle Type Dropdown */}
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300 min-w-[200px]"
            disabled={isLoading}
          >
            <option value="">
              {isLoading ? "Loading vehicles..." : "Select Vehicle Type"}
            </option>
            {!isLoading && vehicles && vehicles.map(vehicle => (
              <option 
                key={vehicle._id} 
                value={vehicle.vehicleType}
              >
                {vehicle.vehicleType}
              </option>
            ))}
          </select>
          
          {/* Rate Input Field */}
          <input
            type="text"
            value={rate}
            onChange={handleRateChange}
            placeholder="Enter Rate Amount"
            className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
          />
          
          {/* Add/Update Button and Error Display */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddRate}
              className="bg-gradient-to-r from-slate-400 via-gray-500 to-black hover:from-black hover:via-gray-500 hover:to-slate-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
            >
              {editingId ? 'Update Rate' : 'Add Rate'}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
              >
                Cancel
              </button>
            )}
            {inputError && (
              <span className="text-red-400 text-sm font-medium">{inputError}</span>
            )}
          </div>
        </div>
      </div>

      {/* Rates Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Vehicle Type</th>
              <th className="py-3 px-4 text-left font-semibold">Rate Amount</th>
              <th className="py-3 px-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          {/* Table Body */}
          {tableBody}
        </table>
      </div>
    </div>
  );
};

export default ManageRate;