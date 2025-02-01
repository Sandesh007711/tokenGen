import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OtpVerification = () => {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));
  const { user, login } = useAuth();

  const TWILIO_CONFIG = {
    accountSid: 'ACc4b3865be895160dc15dfd4dcb4a11fb',
    authToken: 'f03eec8f68781072f11238330a341780',
    serviceSid: 'VA79e86e21767cab44b0e80dcad7dc3db2',
    phoneNumber: '+919508694942'
  };

  const sendOtp = async () => {
    setSendingOtp(true);
    setError('');
    
    try {
      const response = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_CONFIG.serviceSid}/Verifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`)
        },
        body: new URLSearchParams({
          'To': TWILIO_CONFIG.phoneNumber,
          'Channel': 'sms'
        })
      });

      const data = await response.json();
      
      if (data.status === 'pending') {
        setOtpSent(true);
        setError('');
      } else {
        setError('Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      console.error('Send OTP error:', err);
    } finally {
      setSendingOtp(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeOtp = async () => {
      if (mounted && !otpSent) {
        await sendOtp();
      }
    };

    initializeOtp();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array

  const handleVerify = async () => {
    const combinedOtp = otpValues.join('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_CONFIG.serviceSid}/VerificationCheck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`)
        },
        body: new URLSearchParams({
          'To': TWILIO_CONFIG.phoneNumber,
          'Code': combinedOtp
        })
      });

      const data = await response.json();

      if (data.valid && data.status === 'approved') {
        console.log('Verification successful:', data);
        sessionStorage.setItem('isVerified', 'true');
        sessionStorage.setItem('verificationSid', data.sid);
        login({
          ...user,
          isOtpVerified: true,
          verificationDetails: {
            sid: data.sid,
            dateVerified: data.date_updated,
            channel: data.channel
          }
        });
        navigate('/');
      } else {
        setError(data.message || 'Invalid OTP code. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
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
          {sendingOtp && (
            <p className="text-blue-500 text-sm text-center mb-4">Sending OTP...</p>
          )}
          {otpSent && (
            <p className="text-green-500 text-sm text-center mb-4">
              OTP sent to +919508694942
            </p>
          )}
          {error && <p className="text-red-500 text-sm italic mb-4 text-center">{error}</p>}
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
                    disabled={loading}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <button
                className={`bg-white hover:bg-gray-300 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                type="submit"
                disabled={loading}
              >

                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={sendOtp}
              disabled={sendingOtp}
              className="text-blue-500 hover:text-blue-700 underline text-sm"
              type="button"
            >
              {sendingOtp ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;