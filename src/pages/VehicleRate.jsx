import React, { useState } from 'react';

const VehicleRate = () => {
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleList, setVehicleList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

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

  const handleEditVehicle = (index) => {
    setVehicleType(vehicleList[index]);
    setEditIndex(index);
  };

  const handleDeleteVehicle = (index) => {
    const updatedList = vehicleList.filter((_, i) => i !== index);
    setVehicleList(updatedList);
  };

  return (
    <div className="flex flex-col items-start p-6">
      <h1 className="text-2xl font-bold mb-4">Vehicle Rate</h1>
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          placeholder="Enter vehicle type"
          className="p-2 border border-gray-300 rounded mr-2 w-64"
        />
        <button
          onClick={handleAddVehicle}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          {editIndex !== null ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-2">Vehicle Type List</h2>
      <table className="table-auto border-collapse border border-gray-300 w-64">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Vehicle Type</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicleList.map((vehicle, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2">{vehicle}</td>
              <td className="border border-gray-300 p-2">
                <button
                  onClick={() => handleEditVehicle(index)}
                  className="p-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteVehicle(index)}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleRate;