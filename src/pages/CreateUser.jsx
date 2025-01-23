import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FaEdit, FaTrash, FaTimes, FaCheckCircle } from 'react-icons/fa';

const CreateUser = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    userName: '',
    mobileNumber: '',
    password: '',
    route: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const passwordRef = useRef(null);

  // Add new state for popups
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
  const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });

  // Add new state for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, index: null });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Add number validation for mobile number
    if (name === 'mobileNumber') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (value !== onlyNums) {
        showError('Please enter numbers only');
      }
      setFormData({
        ...formData,
        [name]: onlyNums
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Add popup handlers
  const showError = (message) => {
    setErrorPopup({ show: true, message });
    setTimeout(() => {
      setErrorPopup({ show: false, message: '' });
    }, 3000);
  };

  const showSuccess = (message) => {
    setSuccessPopup({ show: true, message });
    setTimeout(() => {
      setSuccessPopup({ show: false, message: '' });
    }, 3000);
  };

  // Update handleSubmit to include success messages
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.userName.trim() || !formData.mobileNumber.trim() || !formData.password.trim() || !formData.route.trim()) {
      showError('Please fill in all fields');
      return;
    }

    if (formData.mobileNumber.length !== 10) {
      showError('Mobile number must be 10 digits');
      return;
    }

    if (isEditMode) {
      const updatedUsers = users.map((user, index) =>
        index === editIndex ? formData : user
      );
      setUsers(updatedUsers);
      setIsEditMode(false);
      setEditIndex(null);
      showSuccess('User updated successfully!');
    } else {
      setUsers([...users, formData]);
      showSuccess('User created successfully!');
    }
    
    setFormData({
      userName: '',
      mobileNumber: '',
      password: '',
      route: ''
    });
  };

  // Update handleDelete to show confirmation
  const handleDelete = (index) => {
    setDeleteConfirm({ show: true, index });
  };

  // Add confirm delete handler
  const confirmDelete = () => {
    const index = deleteConfirm.index;
    const updatedUsers = users.filter((_, i) => i !== index);
    setUsers(updatedUsers);
    setDeleteConfirm({ show: false, index: null });
    showSuccess('User deleted successfully!');
  };

  const handleEdit = (index) => {
    setFormData(users[index]);
    setIsEditMode(true);
    setEditIndex(index);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditIndex(null);
    setFormData({
      userName: '',
      mobileNumber: '',
      password: '',
      route: ''
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (passwordRef.current && !passwordRef.current.contains(event.target)) {
        setShowPassword(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [passwordRef]);

  return (
    <div className="p-7 max-w-7xl mx-auto">
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

      {/* Add Delete Confirmation Popup */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this user?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, index: null })}
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

      {/* Form Container */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">{isEditMode ? 'Edit User' : 'Create User'}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  User Name
                </label>
                <div className="inline-block relative">
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="Enter user name"
                    autoComplete="off"
                    className="px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Mobile Number
                </label>
                <div className="inline-block relative">
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    maxLength={10}
                    placeholder="Enter 10 digit number"
                    className="px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  />
                </div>
              </div>
              <div className="relative" ref={passwordRef}>
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Password
                </label>
                <div className="inline-block relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    autoComplete="new-password"
                    className="px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-lg" />
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-gray-300 text-sm font-bold mb-2">
                  Route
                </label>
                <div className="inline-block relative">
                  <input
                    type="text"
                    name="route"
                    value={formData.route}
                    onChange={handleInputChange}
                    placeholder="Enter route details"
                    className="px-4 py-3 pr-10 bg-gray-900 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end mt-4 space-y-2 sm:space-y-0 sm:space-x-2">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full sm:w-auto bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-slate-400 via-gray-500 to-black hover:from-black hover:via-gray-500 hover:to-slate-400 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
              >
                {isEditMode ? 'Update' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gradient-to-r from-slate-400 via-slate-300 to-slate-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">User Name</th>
              <th className="py-3 px-4 text-left font-semibold">Mobile Number</th>
              <th className="py-3 px-4 text-left font-semibold">Password</th>
              <th className="py-3 px-4 text-left font-semibold">Route</th>
              <th className="py-3 px-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 text-lg">
                  No users available
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50 transition duration-200">
                  <td className="py-3 px-4 whitespace-nowrap">{user.userName}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{user.mobileNumber}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{'*'.repeat(user.password.length)}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{user.route}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleEdit(index)}
                        className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-600 hover:to-yellow-400 text-white px-3 py-1 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-105"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="w-full sm:w-auto bg-gradient-to-r from-red-400 to-red-600 hover:from-red-600 hover:to-red-400 text-white px-3 py-1 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-105"
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

export default CreateUser;