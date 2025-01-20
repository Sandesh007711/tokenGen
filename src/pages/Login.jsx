import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../assets/logo.gif'; // Ensure the path is correct

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const validateUsername = (username) => {
    const re = /^[a-zA-Z]+$/;
    return re.test(username);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (!validateUsername(e.target.value)) {
      setIsValid(false);
      setError('Username must contain only letters');
    } else {
      setIsValid(true);
      setError('');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value.length < 6) {
      setIsValid(false);
      setError('Password must be at least 6 characters');
    } else {
      setIsValid(true);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setIsValid(false);
      setError('Please fill in both fields');
    } else if (!validateUsername(username)) {
      setIsValid(false);
      setError('Username must contain only letters');
    } else if (password.length < 6) {
      setIsValid(false);
      setError('Password must be at least 6 characters');
    } else {
      setIsValid(true);
      setError('');
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        navigate('/otp-verification');
      }, 2000);
    }
  };

  return (
    <div className="App">
      <div className="login-container">
        <img src={logo} alt="Logo" className="logo" />
        <h1 className="welcome-message">Welcome Back!</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">   
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className="input-field"
              placeholder="Enter your username"
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="input-field"
              placeholder="Enter your password"
            />
          </div>
          <div className="input-group remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label>Remember Me</label>
          </div>
          <a href="#" className="forgot-password">Forgot Password?</a>
          {!isValid && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? <span className="spinner"></span> : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;