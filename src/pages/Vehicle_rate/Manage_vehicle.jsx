import React, { useState } from 'react';
import { FaEdit, FaTrash, FaSort } from 'react-icons/fa';

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

  /**
   * Handles adding new vehicle or updating existing one
   * If in edit mode: updates existing vehicle
   * If in add mode: adds new vehicle to list
   */
  const handleAddVehicle = () => {
    if (vehicleType) {
      if (editIndex !== null) {
        const updatedList = [...vehicleList];
        updatedList[editIndex] = vehicleType;
        setVehicleList(updatedList);
        setEditIndex(null);
      } else {
        setVehicleList([...vehicleList, vehicleType]);
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
    // Reset form if currently editing or typing
    if (vehicleType || editIndex !== null) {
      setVehicleType('');
      setEditIndex(null);
    }
    const updatedList = vehicleList.filter((_, i) => i !== index);
    setVehicleList(updatedList);
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

  return (
    <div className="flex flex-col h-screen">
      {/* Header Section:
          - Contains input field for adding/editing vehicle types
          - Shows total number of entries
          - Gradient background with shadow */}
      <div className="p-6 bg-gradient-to-b from-slate-400 via-slate-300 to-slate-100 shadow-lg rounded-lg mx-5 mb-6">
        <h1 className="text-2xl font-bold mb-4">Manage Vehicle Type</h1>
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter vehicle type"
            className="p-2 border border-gray-300 rounded mr-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-100"
          />
          <button
            onClick={handleAddVehicle}
            className="bg-gradient-to-r from-slate-400 via-gray-500 to-black hover:from-black hover:via-gray-500 hover:to-slate-400 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
          >
            {editIndex !== null ? 'Update Vehicle' : 'Add Vehicle'}
          </button>
        </div>
        <div className="w-full mb-4">
          <p className="text-sm font-semibold">Total Entries: {vehicleList.length}</p>
        </div>
      </div>

      {/* Table Section:
          - Fixed header with sorting capability
          - Scrollable body
          - Action buttons for edit and delete
          - Shows "No data" message when empty */}
      <div className="flex-1 px-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-320px)]">
          {/* Fixed table header */}
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200 sticky top-0">
              <tr>
                <th className="py-3 px-4 text-left font-semibold w-2/3">
                  <div className="flex items-center cursor-pointer" onClick={handleSort}>
                    Vehicle Type
                    <FaSort className="ml-2" />
                  </div>
                </th>
                <th className="py-3 px-4 text-left font-semibold w-1/3">Actions</th>
              </tr>
            </thead>
          </table>
          
          {/* Scrollable table body */}
          <div className="overflow-y-auto h-[calc(100%-48px)]">
            <table className="w-full">
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
                      <td className="py-3 px-4 w-2/3">{vehicle}</td>
                      <td className="py-3 px-4 w-1/3">
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
      </div>
    </div>
  );
};

export default VehicleRate;