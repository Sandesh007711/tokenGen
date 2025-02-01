import React, { useState } from 'react';

const Loaded = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/tokens/updated', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      // Handle different possible response structures
      let tokensArray;
      if (data.data && Array.isArray(data.data)) {
        tokensArray = data.data;
      } else if (data.tokens && Array.isArray(data.tokens)) {
        tokensArray = data.tokens;
      } else if (Array.isArray(data)) {
        tokensArray = data;
      } else {
        console.log('Unexpected data structure:', data);
        throw new Error('Invalid data structure received from server');
      }

      console.log('Tokens Array:', tokensArray); // Debug log
      console.log('Searching for token:', tokenInput); // Debug log

      const foundToken = tokensArray.find(t => t.tokenNo === tokenInput);
      console.log('Found Token:', foundToken); // Debug log

      setTokenData(foundToken || null);
      
      if (!foundToken) {
        setError('Token not found');
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'Failed to fetch token data');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Searching...';
    if (tokenData) return 'Load';
    return 'Search';
  };

  const handleClick = () => {
    if (tokenData) {
      // Handle load functionality here
      console.log('Loading token:', tokenData);
      // Add your load logic here
    } else {
      handleSearch();
    }
  };

  return (
    <div className="p-4 sm:p-7 max-w-full sm:max-w-7xl mx-auto">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Enter token"
            className="w-full sm:w-auto px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
          />
          <button
            onClick={handleClick}
            disabled={loading}
            className="px-8 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 flex items-center justify-center"
          >
            {getButtonText()}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center my-4">{error}</div>
      )}

      {tokenData && (
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6">
          <table className="w-full text-gray-300">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Field</th>
                <th className="text-left p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700">
                <td className="p-2">Driver Name</td>
                <td className="p-2">{tokenData.driverName}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Driver Mobile</td>
                <td className="p-2">{tokenData.driverMobileNo}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Vehicle No</td>
                <td className="p-2">{tokenData.vehicleNo}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Vehicle Type</td>
                <td className="p-2">{tokenData.vehicleId?.vehicleType}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Route</td>
                <td className="p-2">{tokenData.route}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Quantity</td>
                <td className="p-2">{tokenData.quantity}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Place</td>
                <td className="p-2">{tokenData.place}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Token No</td>
                <td className="p-2">{tokenData.tokenNo}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Loaded;