import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

// Main Content component that displays operators and their details
const Content = () => {
  // State management for operators, selected operator, and loading status
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add new state for form handling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    driverName: '',
    driverMobile: '',
    vehicleNo: '',
    vehicleType: '',
    vehicleRate: '',
    quantity: '',
    place: '',
    chalaanPin: '',
    route: ''  // Add this line
  });
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [tempFormData, setTempFormData] = useState(null);
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });

  // Add form-related constants
  const vehicleTypes = [
    "Select Vehicle Type",
    "Truck",
    "Dumper",
    "Trailer",
    "Container",
    "Tanker",
    "Mini Truck",
    "Pickup Van",
    "Heavy Truck"
  ];

  const vehicleRates = [
    "Select Rate",
    "1000",
    "1500",
    "2000",
    "2500",
    "3000",
    "3500",
    "4000",
    "4500",
    "5000"
  ];

  const generateQuantityOptions = () => {
    const options = ["Select Quantity"];
    for (let i = 0; i <= 1000; i += 50) {
      options.push(i.toString());
    }
    return options;
  };

  const quantityOptions = generateQuantityOptions();

  // Add form handling functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'vehicleType' && value === 'Select Vehicle Type') return;
    if (name === 'vehicleRate' && value === 'Select Rate') return;
    if (name === 'quantity' && value === 'Select Quantity') return;

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

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => setErrorPopup({ show: false, message: '' }), 3000);
  };

  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => setSuccessPopup({ show: false, message: '' }), 3000);
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();

    // Validation checks
    if (!formData.driverName.trim()) {
      showError('Driver Name is required');
      return;
    }
    // ... add other validation checks as needed

    setTempFormData({...formData});
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    // Handle form submission
    setIsModalOpen(false);
    setFormData({
      driverName: '',
      driverMobile: '',
      vehicleNo: '',
      vehicleType: '',
      vehicleRate: '',
      quantity: '',
      place: '',
      chalaanPin: '',
      route: ''  // Add this line
    });
    setShowSubmitConfirm(false);
    showSuccess('Token generated successfully!');
  };

  // Fetch operators data when component mounts
  useEffect(() => {
    // Fetch data from API
    fetch('https://dummyjson.com/c/f07c-4e33-4a58-aa02')
      .then(response => response.json())
      .then(json => {
        console.log('Raw fetched data:', json);
        // Process data to get unique operators with their stats
        const uniqueOperators = [...new Set(json.map(item => item.Operator))].map(op => ({
          operator: op,
          totalEntries: json.filter(item => item.Operator === op).length, // Count total entries for each operator
          latestEntry: json.find(item => item.Operator === op)?.['Token No'] // Get latest token number
        }));
        console.log('Processed operators data:', uniqueOperators);
        setOperators(uniqueOperators);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching operators:', error);
        setLoading(false);
      });
  }, []);

  // Handle operator card click - toggle selection
  const handleCardClick = (operator) => {
    setSelectedOperator(operator === selectedOperator ? null : operator);
  };

  // Render component based on loading and selection state
  return (
    <div className="p-7 max-w-7xl mx-auto">
      {/* Success and Error Popups */}
      {successPopup.show && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in-top z-50">
          <FaCheckCircle />
          <span>{successPopup.message}</span>
          <button onClick={() => setSuccessPopup({ show: false, message: '' })}><FaTimes /></button>
        </div>
      )}

      {errorPopup.show && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in-top z-50">
          <span>{errorPopup.message}</span>
          <button onClick={() => setErrorPopup({ show: false, message: '' })}><FaTimes /></button>
        </div>
      )}

      {/* Add Print Token Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="mb-4 bg-gradient-to-r from-slate-400 via-gray-500 to-black hover:from-black hover:via-gray-500 hover:to-slate-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
      >
        Add Print Token
      </button>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center pt-20 z-50">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 w-[800px] max-h-[85vh] overflow-y-auto relative">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-300 mb-4">Add New Token</h2>
            <form onSubmit={handleSubmitClick} autoComplete="off">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Driver Name</label>
                  <input 
                    type="text" 
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Driver Mobile</label>
                  <input 
                    type="tel" 
                    name="driverMobile"
                    value={formData.driverMobile}
                    onChange={handleInputChange}
                    maxLength={10}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle No</label>
                  <input 
                    type="text" 
                    name="vehicleNo"
                    value={formData.vehicleNo}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  >
                    {vehicleTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Vehicle Rate</label>
                  <select
                    name="vehicleRate"
                    value={formData.vehicleRate}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  >
                    {vehicleRates.map((rate, index) => (
                      <option key={index} value={rate}>{rate}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Quantity</label>
                  <select
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  >
                    {quantityOptions.map((qty, index) => (
                      <option key={index} value={qty}>{qty}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Route</label>
                  <input 
                    type="text" 
                    name="route"
                    value={formData.route}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Place</label>
                  <input 
                    type="text" 
                    name="place"
                    value={formData.place}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-sm font-bold mb-2">Chalaan Pin</label>
                  <input 
                    type="text" 
                    name="chalaanPin"
                    value={formData.chalaanPin}
                    onChange={handleInputChange}
                    className="px-4 py-3 w-full bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show loading spinner when data is being fetched */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : !selectedOperator ? (
        // Grid layout for operator cards when no operator is selected
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {/* Map through operators and create cards */}
          {operators.map((op) => (
            <div
              key={op.operator}
              onClick={() => handleCardClick(op.operator)}
              className="cursor-pointer transform transition-transform duration-300 hover:scale-105"
            >
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl hover:bg-slate-200">
                <div className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">Operator {op.operator}</div>
                <div className="text-sm sm:text-base text-gray-600">
                  <p className="mb-2">Total Entries: {op.totalEntries}</p>
                  <p className="line-clamp-2">Latest Token: {op.latestEntry}</p>
                </div>
                <div className="mt-3 sm:mt-4 text-blue-500 text-xs sm:text-sm">Click to view details →</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show detailed view when an operator is selected
        <div className="w-full max-w-4xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => setSelectedOperator(null)}
            className="mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base"
          >
            ← Back to Operators
          </button>
          {/* Render Card component with selected operator data */}
          <Card operator={selectedOperator} />
        </div>
      )}
    </div>
  );
};

export default Content;