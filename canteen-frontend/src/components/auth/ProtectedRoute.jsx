import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute:', { loading, user, roles, path: location.pathname });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    console.log('No user - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    console.log('Role mismatch - user role:', user.role, 'required:', roles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
