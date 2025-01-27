import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSort, FaTimes, FaCheckCircle } from 'react-icons/fa';

/**
 * VehicleRate Component
 * Purpose: Manages vehicle types with CRUD operations and sorting functionality
 * Features: Add, Edit, Delete, Sort vehicle types with responsive design
 */
const VehicleRate = () => {
  // State for managing input field value
  const [vehicleType, setVehicleType] = useState('');
  // State for storing list of vehicle types
  const [vehicleList, setVehicleList] = useState([]);
  // State for tracking which vehicle is being edited (-1 means none)
  const [editIndex, setEditIndex] = useState(null);
  // State for managing sort direction (ascending/descending)
  const [sortOrder, setSortOrder] = useState('asc');
  // State for managing error popup
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  // State for managing success popup
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });
  // Add new state for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, index: null });
  // State for managing loading state
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null); // Add this for tracking vehicle ID during edit

  // Add function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token'); // or however you store your auth token
  };

  // API Functions
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:7002/api/v1/vehicles', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const result = await response.json();
      
      // Debug log
      console.log('API Response:', result);

      // Handle the specific response structure
      if (result.status === 'success' && result.data && result.data.vehicles) {
        setVehicleList(result.data.vehicles);
      } else {
        console.error('Unexpected data structure:', result);
        throw new Error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showError(error.message);
      setVehicleList([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const createVehicle = async (vehicleType) => {
    try {
      const response = await fetch('http://localhost:7002/api/v1/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ vehicleType }),
      });
      if (!response.ok) throw new Error('Failed to create vehicle');
      await fetchVehicles();
      showSuccess('Vehicle added successfully!');
    } catch (error) {
      showError(error.message);
      throw error;
    }
  };

  const updateVehicle = async (id, vehicleType) => {
    try {
      const response = await fetch(`http://localhost:7002/api/v1/vehicles/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ vehicleType }),
      });
      if (!response.ok) throw new Error('Failed to update vehicle');
      await fetchVehicles();
      showSuccess('Vehicle updated successfully!');
    } catch (error) {
      showError(error.message);
      throw error;
    }
  };

  const deleteVehicle = async (id) => {
    try {
      const response = await fetch(`http://localhost:7002/api/v1/vehicles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete vehicle');
      await fetchVehicles();
      showSuccess('Vehicle deleted successfully!');
    } catch (error) {
      showError(error.message);
      throw error;
    }
  };

  // Add useEffect to fetch data on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  /**
   * Handles adding new vehicle or updating existing one
   * If in edit mode: updates existing vehicle
   * If in add mode: adds new vehicle to list
   */
  const handleAddVehicle = async () => {
    if (!vehicleType.trim()) {
      showError('Please enter the vehicle type');
      return;
    }

    try {
      if (editId !== null) {
        await updateVehicle(editId, vehicleType);
        setEditId(null);
      } else {
        await createVehicle(vehicleType);
      }
      setVehicleType('');
      setEditIndex(null);
    } catch (error) {
      // Error already handled in API functions
    }
  };

  /**
   * Handles editing of vehicle type
   * @param {number} index - Index of vehicle to edit
   * Sets the input field with selected vehicle's value
   * Enters edit mode for that vehicle
   */
  const handleEditVehicle = (index) => {
    const vehicle = vehicleList[index];
    setVehicleType(vehicle.vehicleType || vehicle.type);
    setEditIndex(index);
    setEditId(vehicle._id || vehicle.id);
  };

  /**
   * Handles deletion of vehicle type
   * @param {number} index - Index of vehicle to delete
   * Resets form if currently editing
   * Removes vehicle from list
   */
  const handleDeleteVehicle = (index) => {
    setDeleteConfirm({ show: true, index });
  };

  // Add confirm delete handler
  const confirmDelete = async () => {
    const vehicle = vehicleList[deleteConfirm.index];
    try {
      await deleteVehicle(vehicle._id || vehicle.id);
      setDeleteConfirm({ show: false, index: null });
      if (editIndex !== null) {
        setVehicleType('');
        setEditIndex(null);
        setEditId(null);
      }
    } catch (error) {
      // Error already handled in API function
    }
  };

  /**
   * Handles sorting of vehicle list
   * Toggles between ascending and descending order
   * Uses localeCompare for string comparison
   */
  const handleSort = () => {
    const sortedList = [...vehicleList].sort((a, b) => {
      const typeA = a.vehicleType || a.type || '';
      const typeB = b.vehicleType || b.type || '';
      return sortOrder === 'asc' 
        ? typeA.localeCompare(typeB)
        : typeB.localeCompare(typeA);
    });
    setVehicleList(sortedList);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  /**
   * Handles keyboard events
   * @param {Event} e - Keyboard event
   * Triggers add/update when Enter key is pressed
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddVehicle();
    }
  };

  // Add popup error handler
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000); // Hide after 3 seconds
  };

  // Add popup success handler
  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => {
      setSuccessPopup({ show: false, message: '' });
    }, 3000); // Hide after 3 seconds
  };

  // Add cancel edit handler
  const handleCancelEdit = () => {
    setVehicleType('');
    setEditIndex(null);
  };

  // Add loading spinner component
  const LoadingSpinner = () => (
    <tr>
      <td colSpan="2" className="py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-3 text-gray-600 font-medium">Loading vehicle types...</p>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-7 max-w-7xl mx-auto">
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

      {/* Add Delete Confirmation Popup */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this vehicle type?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, index: null })}
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
        <h1 className="text-2xl font-bold text-gray-300 mb-4">Manage Vehicle Type</h1>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter vehicle type"
            className="px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
          />
          <button
            onClick={handleAddVehicle}
            className="bg-gradient-to-r from-slate-400 via-gray-500 to-black hover:from-black hover:via-gray-500 hover:to-slate-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
          >
            {editIndex !== null ? 'Update Vehicle' : 'Add Vehicle'}
          </button>
          {editIndex !== null && (
            <button
              onClick={handleCancelEdit}
              className="bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-600 hover:to-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
            >
              Cancel
            </button>
          )}
          <p className="text-sm font-semibold text-gray-300">Total Entries: {vehicleList.length}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">
                <div className="flex items-center cursor-pointer" onClick={handleSort}>
                  Vehicle Type
                  <FaSort className="ml-2" />
                </div>
              </th>
              <th className="py-3 px-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <LoadingSpinner />
            ) : vehicleList.length === 0 ? (
              <tr>
                <td colSpan="2" className="py-8 text-center text-gray-500 text-lg">
                  No data available
                </td>
              </tr>
            ) : (
              vehicleList.map((vehicle, index) => (
                <tr key={vehicle._id || vehicle.id} className="hover:bg-gray-50 transition duration-200">
                  <td className="py-3 px-4">{vehicle.vehicleType || vehicle.type}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditVehicle(index)}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-600 hover:to-yellow-400 text-white px-3 py-1 rounded-full flex items-center transition duration-300 transform hover:scale-105"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(index)}
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
        </table>
      </div>
    </div>
  );
};

export default VehicleRate;