import React, { useState, useEffect } from 'react';

const Loaded = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [tokenData, setTokenData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [tokenMap, setTokenMap] = useState(new Map()); // Token index map

  // Initialize token index
  useEffect(() => {
    const initializeTokenIndex = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:8000/api/v1/tokens', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch tokens');

        const data = await response.json();
        console.log('API Response:', data); // Log raw API response

        const tokens = Array.isArray(data) ? data : 
                      (data.data && Array.isArray(data.data)) ? data.data :
                      (data.tokens && Array.isArray(data.tokens)) ? data.tokens : [];
        
        console.log('Processed tokens:', tokens); // Log processed tokens array

        // Create index map for O(1) lookup
        const map = new Map();
        tokens.forEach(token => {
          const key = token.tokenNo.toLowerCase();
          if (!map.has(key)) {
            map.set(key, []);
          }
          map.get(key).push(token);
        });

        console.log('Token map:', Object.fromEntries(map)); // Log the map structure
        setTokenMap(map);
      } catch (err) {
        console.error('Error initializing token index:', err);
      }
    };

    initializeTokenIndex();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    setTokenInput(value);
  };

  const handleSearch = () => {
    if (!tokenInput) {
      setError('Please enter a token number');
      return;
    }
    setLoading(true);
    
    const key = tokenInput.toLowerCase();
    const matchingTokens = tokenMap.get(key) || [];
    console.log('Matching tokens for', key, ':', matchingTokens); // Log matching tokens
    
    // First check if token exists
    if (matchingTokens.length === 0) {
      setError('Token not found');
      setTokenData([]);
      setLoading(false);
      return;
    }

    // Check if token is deleted
    const activeTokens = matchingTokens.filter(t => t.deletedAt === null);
    console.log('Active tokens:', activeTokens); // Log active tokens

    if (activeTokens.length === 0) {
      setError('This token has been deleted');
      setTokenData([]);
      setLoading(false);
      return;
    }

    // Get only unloaded tokens
    const unloadedTokens = activeTokens.filter(t => {
      console.log('Token:', t.tokenNo, 'isLoaded:', t.isLoaded); // Log each token's loaded status
      return t.isLoaded === false;
    });
    
    console.log('Unloaded tokens:', unloadedTokens); // Log filtered unloaded tokens
    
    if (unloadedTokens.length === 0) {
      setError('This token has already been loaded');
      setTokenData([]);
    } else {
      setTokenData(unloadedTokens.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleClick = async (selectedToken) => {
    if (!selectedToken) {
      handleSearch();
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        _id: selectedToken._id,
        isLoaded: true
      };

      console.log('Sending payload:', payload); // Debug log

      const response = await fetch('http://localhost:8000/api/v1/tokens/loaded', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to load token');

      const responseData = await response.json();
      console.log('Response received:', responseData);

      // Update local token map
      const tokens = tokenMap.get(selectedToken.tokenNo.toLowerCase()) || [];
      const updatedTokens = tokens.map(t => 
        t._id === selectedToken._id ? { ...t, isLoaded: true } : t
      );
      tokenMap.set(selectedToken.tokenNo.toLowerCase(), updatedTokens);

      setTokenInput('');
      setTokenData([]);
      setSuccessMessage('Token loaded successfully! 🎉');
    } catch (err) {
      console.error('Error loading token:', err);
      setError(err.message || 'Failed to load token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-7 max-w-full sm:max-w-7xl mx-auto">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            value={tokenInput}
            onChange={handleInputChange}
            placeholder="Enter token"
            className="w-full sm:w-auto px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
          />
          <button
            onClick={() => handleClick(null)}
            disabled={loading}
            className="px-8 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500 flex items-center justify-center"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center my-4">{error}</div>
      )}

      {successMessage && (
        <div className="text-green-500 text-center my-4 p-3 bg-green-100 rounded-lg border border-green-200">
          {successMessage}
        </div>
      )}

      {tokenData.map((token, index) => (
        <div key={token._id} className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 mb-4">
          <table className="w-full text-gray-300">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Field</th>
                <th className="text-left p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-700 bg-gray-700 bg-opacity-40">
                <td className="p-2 font-semibold">Created Date</td>
                <td className="p-2 text-teal-300">
                  {new Date(token.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </td>
              </tr>
              <tr className="border-b border-gray-700 bg-gray-700 bg-opacity-40">
                <td className="p-2 font-semibold">Created Time</td>
                <td className="p-2 text-teal-300">
                  {new Date(token.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Driver Name</td>
                <td className="p-2">{token.driverName}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Driver Mobile</td>
                <td className="p-2">{token.driverMobileNo}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Vehicle No</td>
                <td className="p-2">{token.vehicleNo}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Vehicle Type</td>
                <td className="p-2">{token.vehicleType || 'N/A'}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Vehicle Rate</td>
                <td className="p-2">₹{token.vehicleRate || 'N/A'}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Route</td>
                <td className="p-2">{token.route}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Quantity</td>
                <td className="p-2">{token.quantity}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Place</td>
                <td className="p-2">{token.place}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Token No</td>
                <td className="p-2">{token.tokenNo}</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Status</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      token.isLoaded 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {token.isLoaded ? 'Loaded' : 'Pending'}
                    </span>
                    {token.pendency && (
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs">
                        Pendency: {token.pendency}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2" colSpan="2">
                  <button
                    onClick={() => handleClick(token)}
                    disabled={loading}
                    className="w-full px-4 py-2 rounded-md bg-gray-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500"
                  >
                    {loading ? 'Loading...' : 'Load Token'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Loaded;