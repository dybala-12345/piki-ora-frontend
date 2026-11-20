import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import { useAuth } from '../context/AuthContext';

// Wraps pages that need a login (and optionally admin rights).
// The API also checks permissions - this just gives users a nicer experience.
function ProtectedRoute({ adminOnly = false }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (adminOnly && !user.is_admin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
