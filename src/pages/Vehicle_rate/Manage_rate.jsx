import React, { useState } from 'react';
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

  // Mock data for vehicle types (replace with API data)
  const vehicleTypes = [
    { id: 1, type: 'Car' },
    { id: 2, type: 'Bike' },
    { id: 3, type: 'Truck' }
  ];

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

  /**
   * Handles adding or updating vehicle rates
   * Validates input before processing
   * Updates or adds new rate based on editingId
   */
  const handleAddRate = () => {
    if (!selectedVehicle) {
      showError('Please select a vehicle type');
      return;
    }
    if (!rate) {
      showError('Please enter a rate');
      return;
    }
    if (isNaN(parseFloat(rate))) {
      showError('Please enter a valid number');
      return;
    }
    
    if (selectedVehicle && rate) {
      if (editingId) {
        setRates(rates.map(item => 
          item.id === editingId 
            ? { ...item, vehicleType: selectedVehicle, rate: parseFloat(rate) }
            : item
          ));
        showSuccess('Rate updated successfully!');
      } else {
        setRates([...rates, {
          id: Date.now(),
          vehicleType: selectedVehicle,
          rate: parseFloat(rate)
        }]);
        showSuccess('New rate added successfully!');
      }
      resetForm();
      setInputError('');
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

  /**
   * Confirms deletion of a rate
   * Deletes the rate and shows success message
   */
  const confirmDelete = () => {
    const id = deleteConfirm.id;
    if (id === editingId) {
      resetForm();
    }
    setRates(rates.filter(rate => rate.id !== id));
    setDeleteConfirm({ show: false, id: null });
    showSuccess('Rate deleted successfully!');
  };

  /**
   * Resets form to initial state
   * Clears selection, input, and error message
   */
  const resetForm = () => {
    setSelectedVehicle('');
    setRate('');
    setEditingId(null);
    setInputError('');
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
          >
            <option value="">Select Vehicle Type</option>
            {vehicleTypes.map(vehicle => (
              <option key={vehicle.id} value={vehicle.type}>
                {vehicle.type}
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
          <tbody className="divide-y divide-gray-200">
            {rates.length === 0 ? (
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
        </table>
      </div>
    </div>
  );
};

export default ManageRate;