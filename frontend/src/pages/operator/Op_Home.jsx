import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const Op_Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    route: '',
    driverName: '',
    driverMobile: '',
    vehicleNo: '',
    vehicleType: '',
    vehicleRate: '',
    quantity: '',
    place: '',
    chalaanPin: ''
  });
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [tempFormData, setTempFormData] = useState(null);
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  const [vehicleRates, setVehicleRates] = useState([]);
  const [apiTokens, setApiTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateRandomToken = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleAddToken = () => {
    setIsModalOpen(true);
  };

  const buttonStyle = {
    appearance: 'none',
    backgroundColor: 'transparent',
    border: '0.125em solid #1A1A1A',
    borderRadius: '0.9375em',
    boxSizing: 'border-box',
    color: '#3B3B3B',
    cursor: 'pointer',
    display: 'inline-block',
    fontFamily: 'Roobert, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: 'normal',
    margin: '0',
    minHeight: '3.75em',
    minWidth: '0',
    outline: 'none',
    padding: '1em 2.3em',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 300ms cubic-bezier(.23, 1, 0.32, 1)',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    willChange: 'transform'
  };

  const buttonHoverStyle = {
    color: '#fff',
    backgroundColor: '#1A1A1A',
    boxShadow: 'rgba(0, 0, 0, 0.25) 0 8px 15px',
    transform: 'translateY(-2px)'
  };

  const buttonActiveStyle = {
    boxShadow: 'none',
    transform: 'translateY(0)'
  };

  // Add quantity options generator
  const generateQuantityOptions = () => {
    const options = ["Select Quantity"];
    for (let i = 0; i <= 1000; i += 50) {
      options.push(i.toString());
    }
    return options;
  };

  const quantityOptions = generateQuantityOptions();

  useEffect(() => {
    const setLoggedInUserData = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.error('No user data in localStorage');
          return;
        }

        const userData = JSON.parse(userStr);
        console.log('Raw user data:', userData);

        // Handle the case where user data is nested in data property
        const currentUser = userData.data || userData.user || userData;
        console.log('Processed user data:', currentUser);

        if (currentUser) {
          setFormData(prev => ({
            ...prev,
            userId: currentUser._id || '',
            username: currentUser.username || '',
            route: currentUser.route || ''
          }));

          setUsers([{
            id: currentUser._id || '',
            name: currentUser.username || '',
            route: currentUser.route || ''
          }]);
        } else {
          showError('Invalid user data structure');
        }
      } catch (error) {
        console.error('Error setting user data:', error);
        showError('Error loading user data');
      }
    };

    setLoggedInUserData();
  }, []);

  useEffect(() => {
    const fetchVehicleRates = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          showError('User not authenticated');
          return;
        }

        const userData = JSON.parse(userStr);
        const authToken = userData.token;

        const response = await axios.get('http://localhost:8000/api/v1/vehicles/get-rates', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Vehicle Rates Response:', response.data);

        // Updated to handle the nested response structure
        if (response.data?.status === 'success' && response.data?.data?.rates) {
          const rates = response.data.data.rates;
          console.log('Available rates:', rates);
          setVehicleRates(rates);
        } else {
          console.log('Invalid response structure:', response.data);
          showError('Failed to load vehicle rates');
        }
      } catch (error) {
        console.error('Error fetching vehicle rates:', error);
        showError(error.response?.data?.message || 'Error loading vehicle rates');
      }
    };

    fetchVehicleRates();
  }, []);

  useEffect(() => {
    const fetchUserTokens = async () => {
      setLoading(true);
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          showError('User not authenticated');
          return;
        }

        const userData = JSON.parse(userStr);
        const authToken = userData.token;
        const currentUser = userData.data || userData.user || userData;

        if (!currentUser) {
          console.error('Invalid user data structure:', userData);
          showError('Invalid user data structure');
          return;
        }

        console.log('Current user for token fetch:', currentUser);

        const response = await axios.get('http://localhost:8000/api/v1/tokens', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Tokens Response:', response.data);

        if (response.data?.status === 'success' && Array.isArray(response.data.data)) {
          // Filter tokens for current user, accounting for nested userId structure
          const userTokens = response.data.data.filter(token => {
            return token.userId?.username === currentUser.username;
          });

          console.log('Filtered user tokens:', userTokens);
          setApiTokens(userTokens);
          setEntries(userTokens);
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
        showError(error.response?.data?.message || 'Error loading tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTokens();
  }, []); // Run once on component mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Prevent changes to userId and route
    if (name === 'userId' || name === 'route') {
      return;
    }

    if (name === 'vehicleType') {
      console.log('Selected vehicle type:', value);
      console.log('Available rates:', vehicleRates);
      
      const selectedVehicle = vehicleRates.find(v => v.vehicleType === value);
      console.log('Selected vehicle data:', selectedVehicle);
      
      if (selectedVehicle) {
        setFormData(prev => ({
          ...prev,
          vehicleType: value,
          vehicleId: selectedVehicle.vehicleId,
          vehicleRate: selectedVehicle.rate.toString()
        }));
      } else {
        showError('Invalid vehicle selection');
      }
      return;
    }

    if (name === 'vehicleRate' && value === 'Select Rate') {
      return; // Don't update state if default option is selected
    }

    if (name === 'quantity' && value === 'Select Quantity') {
      return; // Don't update state if default option is selected
    }

    if (name === 'driverMobile') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums !== value) {
        showError('Please enter numbers only for mobile number');
      }
      setFormData(prev => ({
        ...prev,
        [name]: onlyNums.slice(0, 10)
      }));
      return;
    }

    if (name === 'driverName' || name === 'vehicleNo' || name === 'place' || name === 'chalaanPin') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
      return;
    }

    if ((name === 'vehicleRate' || name === 'quantity') && value < 0) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();

    // Updated validation checks
    if (!formData.driverName.trim()) {
      showError('Driver Name is required');
      return;
    }
    if (!formData.driverMobile.trim()) {
      showError('Driver Mobile is required');
      return;
    }
    if (formData.driverMobile.length !== 10) {
      showError('Mobile number must be 10 digits');
      return;
    }
    if (!formData.vehicleNo.trim()) {
      showError('Vehicle Number is required');
      return;
    }
    if (!formData.vehicleType || formData.vehicleType === 'Select Vehicle Type') {
      showError('Please select a Vehicle Type');
      return;
    }
    if (!formData.vehicleRate || formData.vehicleRate === 'Select Rate') {
      showError('Please select a Vehicle Rate');
      return;
    }
    // Update quantity validation to allow '0'
    if (formData.quantity === 'Select Quantity') {
      showError('Please select a Quantity');
      return;
    }
    // Note: Removed the check for !formData.quantity since '0' is falsy

    setTempFormData({...formData});
    setShowSubmitConfirm(true);
  };

  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => {
      setSuccessPopup({ show: false, message: '' });
    }, 3000);
  };

  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000);
  };

  const confirmSubmit = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        showError('User not authenticated');
        return;
      }

      const userData = JSON.parse(userStr);
      const currentUser = userData.data || userData.user || userData;
      const authToken = userData.token;

      if (!currentUser || !currentUser._id) {
        showError('Invalid user data');
        return;
      }

      const tokenData = {
        userId: currentUser._id,
        route: currentUser.route,
        driverName: tempFormData.driverName,
        driverMobileNo: tempFormData.driverMobile,
        vehicleNo: tempFormData.vehicleNo,
        vehicleId: tempFormData.vehicleId, // From vehicle selection
        vehicleType: tempFormData.vehicleType,
        vehicleRate: tempFormData.vehicleRate,
        quantity: tempFormData.quantity,
        place: tempFormData.place,
        challanPin: tempFormData.chalaanPin
      };
  
      console.log('Sending token data:', tokenData);
  
      const response = await axios.post(
        'http://localhost:8000/api/v1/tokens',
        tokenData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('API Response:', response.data);
  
      if (response.data && response.data.status === 'success') {
        // Fetch updated tokens after creation
        const updatedTokensResponse = await axios.get('http://localhost:8000/api/v1/tokens', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (updatedTokensResponse.data?.status === 'success' && Array.isArray(updatedTokensResponse.data.data)) {
          const userTokens = updatedTokensResponse.data.data.filter(token => 
            token.userId?.username === currentUser.username
          );
          setApiTokens(userTokens);
          setEntries(userTokens);
        }

        setIsModalOpen(false);
        setFormData({
          userId: '',
          route: '',
          driverName: '',
          driverMobile: '',
          vehicleNo: '',
          vehicleType: '',
          vehicleRate: '',
          quantity: '',
          place: '',
          chalaanPin: ''
        });
        setShowSubmitConfirm(false);
        showSuccess('Token generated successfully!');
      } else {
        showError(response.data?.message || 'Error creating token');
      }
    } catch (error) {
      console.error('Error submitting token:', error);
      showError(error.response?.data?.message || 'Error creating token');
    }
  };
  

  const handleCancelClick = () => {
    if (Object.values(formData).some(value => value !== '')) {
      setShowCancelConfirm(true);
    } else {
      setIsModalOpen(false);
    }
  };

  const handlePrint = (entry) => {
    const printContent = `
      <div style="padding: 20px; font-family: Arial;">
        <h2 style="text-align: center;">Token Details</h2>
        <hr style="margin: 20px 0;"/>
        <div style="margin: 10px 0;"><strong>Token No:</strong> ${entry.tokenNo}</div>
        <div style="margin: 10px 0;"><strong>Date/Time:</strong> ${formatDateTime(entry.createdAt)}</div>
        <div style="margin: 10px 0;"><strong>Driver Name:</strong> ${entry.driverName}</div>
        <div style="margin: 10px 0;"><strong>Driver Mobile:</strong> ${entry.driverMobileNo}</div>
        <div style="margin: 10px 0;"><strong>Vehicle No:</strong> ${entry.vehicleNo}</div>
        <div style="margin: 10px 0;"><strong>Vehicle Type:</strong> ${entry.vehicleId?.vehicleType || 'N/A'}</div>
        <div style="margin: 10px 0;"><strong>Vehicle Rate:</strong> ${entry.vehicleRate}</div>
        <div style="margin: 10px 0;"><strong>Route:</strong> ${entry.route || 'N/A'}</div>
        <div style="margin: 10px 0;"><strong>Quantity:</strong> ${entry.quantity}</div>
        <div style="margin: 10px 0;"><strong>Place:</strong> ${entry.place}</div>
        <div style="margin: 10px 0;"><strong>Challan Pin:</strong> ${entry.challanPin || 'N/A'}</div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const [users, setUsers] = useState([]);

  const [routes] = useState([
    'Route A',
    'Route B',
    'Route C',
    'Route D',
    'Route E'
  ]);

  // Add this sorting function before the return statement
  const sortedEntries = entries.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Add formatDateTime function if not already present
const formatDateTime = (dateString) => {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

  return (
    <div className="p-7 max-w-7xl mx-auto">
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

      <button 
        onClick={handleAddToken}
        style={buttonStyle}
        onMouseOver={(e) => Object.assign(e.target.style, buttonHoverStyle)}
        onMouseOut={(e) => Object.assign(e.target.style, buttonStyle)}
        onMouseDown={(e) => Object.assign(e.target.style, buttonActiveStyle)}
        onMouseUp={(e) => Object.assign(e.target.style, buttonHoverStyle)}
      >
        Add Print Token
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pt-20">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 w-[800px] max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-300 mb-4">Add New Token</h2>
            <form 
              onSubmit={handleSubmitClick} 
              autoComplete="off" 
              id={`form-${Math.random()}`}
            >
              <div className="grid grid-cols-2 gap-4">
                {/* Update all input containers to have consistent styling */}
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">User</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text"
                      value={formData.username || ''}
                      className="block w-full px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none cursor-not-allowed opacity-70"
                      disabled
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Route</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text"
                      value={formData.route || ''}
                      className="block w-full px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none cursor-not-allowed opacity-70"
                      disabled
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Driver Name</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text" 
                      name="driverName"
                      value={formData.driverName}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                      required
                      autoComplete="nope"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readOnly')}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Driver Mobile</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="tel" 
                      name="driverMobile"
                      value={formData.driverMobile}
                      onChange={handleInputChange}
                      maxLength={10}
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                      className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                      required
                      autoComplete="nope"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readOnly')}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle No</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text" 
                      name="vehicleNo"
                      value={formData.vehicleNo}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                      required
                      autoComplete="nope"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readOnly')}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle Type</label>
                  <div className="inline-block relative w-full">
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300 appearance-none"
                      required
                    >
                      <option value="">Select Vehicle Type</option>
                      {vehicleRates.map((vehicle, index) => (
                        <option 
                          key={index} 
                          value={vehicle.vehicleType}
                          className="text-gray-300 bg-gray-900"
                        >
                          {vehicle.vehicleType}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle Rate</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text"
                      value={formData.vehicleRate}
                      className="block w-full px-4 py-3 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none cursor-not-allowed opacity-70"
                      disabled
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Quantity</label>
                  <div className="inline-block relative w-full">
                    <select
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300 appearance-none"
                      required
                    >
                      {quantityOptions.map((qty, index) => (
                        <option 
                          key={index} 
                          value={qty}
                          disabled={qty === "Select Quantity"}
                          className={`${qty === "Select Quantity" ? "text-gray-500" : "text-gray-300"} bg-gray-900`}
                        >
                          {qty}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Place</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text" 
                      name="place"
                      value={formData.place}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                      autoComplete="nope"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readOnly')}
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Chalaan Pin</label>
                  <div className="inline-block relative w-full">
                    <input 
                      type="text" 
                      name="chalaanPin"
                      value={formData.chalaanPin}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                      autoComplete="nope"
                      readOnly
                      onFocus={(e) => e.target.removeAttribute('readOnly')}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button 
                  type="button"
                  onClick={handleCancelClick}
                  className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  onClick={handleSubmitClick}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to submit this token?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Cancel</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel? All entered data will be lost.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                No, Keep Editing
              </button>
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-x-auto mt-6"> {/* Added mt-6 here */}
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading tokens...</div>
        ) : (
          <table className="w-full min-w-[640px]">
            <thead className="bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold">Sr No.</th>
                <th className="py-3 px-4 text-left font-semibold">Token No.</th>
                <th className="py-3 px-4 text-left font-semibold">Date/Time</th>
                <th className="py-3 px-4 text-left font-semibold">Driver Name</th>
                <th className="py-3 px-4 text-left font-semibold">Driver Mobile</th>
                <th className="py-3 px-4 text-left font-semibold">Vehicle Type</th>
                <th className="py-3 px-4 text-left font-semibold">Vehicle Rate</th>
                <th className="py-3 px-4 text-left font-semibold">Vehicle No</th>
                <th className="py-3 px-4 text-left font-semibold">Place</th>
                <th className="py-3 px-4 text-left font-semibold">Route</th>
                <th className="py-3 px-4 text-left font-semibold">Challan Pin</th>
                <th className="py-3 px-4 text-left font-semibold">Quantity</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
                <th className="py-3 px-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="14" className="py-8 text-center text-gray-500">
                    No tokens found
                  </td>
                </tr>
              ) : (
                sortedEntries.map((entry, index) => (
                  <tr key={entry._id || index} className="hover:bg-gray-50 transition duration-200">
                    <td className="py-3 px-4 whitespace-nowrap">{index + 1}</td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-blue-600">
                      {entry.tokenNo || 'N/A'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {formatDateTime(entry.createdAt)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{entry.driverName}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{entry.driverMobileNo}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{entry.vehicleId?.vehicleType || 'N/A'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{entry.vehicleRate}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{entry.vehicleNo}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{entry.place || 'N/A'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{entry.route || 'N/A'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{entry.challanPin || 'N/A'}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{entry.quantity}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.isLoaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.isLoaded ? 'Loaded' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handlePrint(entry)}
                        className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-600 hover:to-green-400 text-white px-3 py-1 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-105"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Op_Home