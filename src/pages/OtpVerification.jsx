import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const OtpVerification = () => {
  // State to store the OTP digits
  const [otp, setOtp] = useState(["", "", "", ""]);
  // State to store error messages
  const [error, setError] = useState("");
  // Refs to manage input focus
  const inputRefs = useRef([]);
  // Hook to navigate to different routes
  const navigate = useNavigate();

  // Handle change in input fields
  const handleChange = (e, index) => {
    const value = e.target.value;
    // Check if the input is a digit
    if (/^[0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Move focus to the next input field
      if (index < 3) {
        inputRefs.current[index + 1].focus();
      }
    } else if (value === "") {
      // Clear the input field
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  // Handle key down events
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      // Move focus to the previous input field
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // Handle paste events
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    // Check if the pasted value is a 4-digit number
    if (/^[0-9]{4}$/.test(paste)) {
      const newOtp = paste.split("");
      setOtp(newOtp);
      // Move focus to the last input field
      inputRefs.current[3].focus();
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    // Check if the OTP is correct
    if (otpValue === "1234") {
      console.log("OTP Verified:", otpValue);
      navigate("/");
    } else {
      // Set error message
      setError("Invalid OTP");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-black to-silver">
      <div className="bg-white p-12 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">OTP Verification</h2>
        <p className="text-center mb-6">An OTP has been sent to your registered number.</p>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-4 space-x-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                maxLength="1"
                className="w-12 h-12 text-center text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform duration-200 transform hover:scale-110"
              />
            ))}
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4"
            >
              Verify OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;