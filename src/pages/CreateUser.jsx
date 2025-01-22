import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      const updatedUsers = users.map((user, index) =>
        index === editIndex ? formData : user
      );
      setUsers(updatedUsers);
      setIsEditMode(false);
      setEditIndex(null);
    } else {
      setUsers([...users, formData]);
    }
    setFormData({
      userName: '',
      mobileNumber: '',
      password: '',
      route: ''
    });
  };

  const handleEdit = (index) => {
    setFormData(users[index]);
    setIsEditMode(true);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedUsers = users.filter((_, i) => i !== index);
    setUsers(updatedUsers);
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
    <div className="min-h-screen p-8">
      {/* Form Container */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit User' : 'Create User'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                User Name
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Mobile Number
              </label>
              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="relative" ref={passwordRef}>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <span
                className="absolute right-3 top-9 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Route
              </label>
              <input
                type="text"
                name="route"
                value={formData.route}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            {isEditMode && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {isEditMode ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>

      {/* Table Container */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">User List</h2>
        {users.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.mobileNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{'*'.repeat(user.password.length)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.route}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500">No users available</p>
        )}
      </div>
    </div>
  );
};

export default CreateUser;