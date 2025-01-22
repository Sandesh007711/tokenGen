import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const OtpVerification = () => {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { verifyOtp, tempCredentials } = useAuth();
  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));

  if (!tempCredentials) {
    navigate('/login');
    return null;
  }

  const handleVerify = () => {
    const combinedOtp = otpValues.join('');
    if (verifyOtp(combinedOtp)) {
      navigate('/');
    } else {
      setError('Invalid OTP');
    }
  };

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].current.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].current.focus();
    } else if (e.key === 'Enter') {
      const isComplete = otpValues.every(value => value !== '');
      if (isComplete) {
        handleVerify();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-800 to-black p-8">
      <h1 className="text-5xl font-bold text-gray-300 fade-in text-center mb-8">
        OTP Verification
      </h1>
      <div className="bg-black p-8 rounded-lg shadow-lg w-full max-w-md">
        
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2 text-center text-white">
            Enter OTP Code
          </h2>
          {error && <p className="text-red-500 text-4xs italic mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="flex justify-center space-x-2">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs.current[index]}
                    className="w-12 h-12 text-center text-black text-xl font-bold border rounded shadow appearance-none focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <button
                className="bg-white hover:bg-gray-300 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                type="submit"
              >
                Verify OTP
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;