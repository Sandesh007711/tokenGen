import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user has the required role
  if (user?.user?.role !== requiredRole) {
    return <Navigate to="/login" />;
  }

  // Only check OTP verification for admin routes and when not already on OTP page
  if (requiredRole === 'admin' && 
      !user?.isOtpVerified && 
      window.location.pathname !== '/otp-verification') {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
