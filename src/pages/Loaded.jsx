import React from 'react';

const Loaded = () => {
  return (
    <div className="p-4">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Enter Token"
          className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Load
        </button>
      </div>
    </div>
  );
};

export default Loaded;