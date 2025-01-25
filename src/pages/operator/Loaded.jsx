import React from 'react';

const Loaded = () => {
  return (
    <div className="p-4 sm:p-7 max-w-full sm:max-w-7xl mx-auto">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            placeholder="Enter token"
            className="w-full sm:w-auto px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
          />
          <button
            className="w-full sm:w-auto bg-gradient-to-r from-slate-400 via-gray-500 to-black hover:from-black hover:via-gray-500 hover:to-slate-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
          >
            Load
          </button>
        </div>
      </div>
    </div>
  );
};

export default Loaded;