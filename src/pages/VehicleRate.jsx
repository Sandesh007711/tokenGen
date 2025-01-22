import React, { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const VehicleRate = () => {
  // State to store the current vehicle type input
  const [vehicleType, setVehicleType] = useState('');
  // State to store the list of vehicle types
  const [vehicleList, setVehicleList] = useState([]);
  // State to store the index of the vehicle being edited
  const [editIndex, setEditIndex] = useState(null);

  // Function to handle adding or updating a vehicle type
  const handleAddVehicle = () => {
    if (vehicleType) {
      if (editIndex !== null) {
        // Update the existing vehicle type
        const updatedList = [...vehicleList];
        updatedList[editIndex] = vehicleType;
        setVehicleList(updatedList);
        setEditIndex(null);
      } else {
        // Add a new vehicle type to the list
        setVehicleList([...vehicleList, vehicleType]);
      }
      // Clear the input field
      setVehicleType('');
    }
  };

  // Function to handle editing a vehicle type
  const handleEditVehicle = (index) => {
    // Set the vehicle type input to the selected vehicle type
    setVehicleType(vehicleList[index]);
    // Set the edit index to the selected vehicle index
    setEditIndex(index);
  };

  // Function to handle deleting a vehicle type
  const handleDeleteVehicle = (index) => {
    // Remove the selected vehicle type from the list
    const updatedList = vehicleList.filter((_, i) => i !== index);
    setVehicleList(updatedList);
  };

  return (
    <div className="flex flex-col items-start p-6">
      {/* Main heading */}
      <h1 className="text-2xl font-bold mb-4">Vehicle Rate</h1>
      {/* Input field and Add/Update button */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          placeholder="Enter vehicle type"
          className="p-2 border border-gray-300 rounded mr-2 w-64" // Input field styling
        />
        <button
          onClick={handleAddVehicle}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700" // Button styling
        >
          {editIndex !== null ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </div>
      {/* Subheading */}
      <h2 className="text-xl font-semibold mb-2">Vehicle Type List</h2>
      {/* Table to display vehicle types */}
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Vehicle Type</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicleList.map((vehicle, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b">{vehicle}</td>
              <td className="py-2 px-4 border-b">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleEditVehicle(index)}
                    className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-700 flex items-center" // Edit button styling
                  >
                    <FaEdit className="mr-1" /> {/* Edit icon */}
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(index)}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-700 flex items-center" // Delete button styling
                  >
                    <FaTrash className="mr-1" /> {/* Delete icon */}
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleRate;