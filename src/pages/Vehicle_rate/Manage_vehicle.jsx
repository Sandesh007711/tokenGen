import React, { useState } from 'react';
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

  /**
   * Handles adding new vehicle or updating existing one
   * If in edit mode: updates existing vehicle
   * If in add mode: adds new vehicle to list
   */
  const handleAddVehicle = () => {
    if (!vehicleType.trim()) {
      showError('Please enter the vehicle type');
      return;
    }
    if (vehicleType) {
      if (editIndex !== null) {
        const updatedList = [...vehicleList];
        updatedList[editIndex] = vehicleType;
        setVehicleList(updatedList);
        setEditIndex(null);
        showSuccess('Vehicle type updated successfully!');
      } else {
        setVehicleList([...vehicleList, vehicleType]);
        showSuccess('Vehicle type added successfully!');
      }
      setVehicleType('');
    }
  };

  /**
   * Handles editing of vehicle type
   * @param {number} index - Index of vehicle to edit
   * Sets the input field with selected vehicle's value
   * Enters edit mode for that vehicle
   */
  const handleEditVehicle = (index) => {
    setVehicleType(vehicleList[index]);
    setEditIndex(index);
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
  const confirmDelete = () => {
    const index = deleteConfirm.index;
    if (vehicleType || editIndex !== null) {
      setVehicleType('');
      setEditIndex(null);
    }
    const updatedList = vehicleList.filter((_, i) => i !== index);
    setVehicleList(updatedList);
    setDeleteConfirm({ show: false, index: null });
    showSuccess('Vehicle type deleted successfully!');
  };

  /**
   * Handles sorting of vehicle list
   * Toggles between ascending and descending order
   * Uses localeCompare for string comparison
   */
  const handleSort = () => {
    const sortedList = [...vehicleList].sort((a, b) => {
      return sortOrder === 'asc' 
        ? a.localeCompare(b)
        : b.localeCompare(a);
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
            {vehicleList.length === 0 ? (
              <tr>
                <td colSpan="2" className="py-8 text-center text-gray-500 text-lg">
                  No data available
                </td>
              </tr>
            ) : (
              vehicleList.map((vehicle, index) => (
                <tr key={index} className="hover:bg-gray-50 transition duration-200">
                  <td className="py-3 px-4">{vehicle}</td>
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