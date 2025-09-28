import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store.js';

export default function RequireAuth({ children }) {
  const isAuthed = useAuthStore((s) => s.isAuthenticated());
  const location = useLocation();
  if (!isAuthed) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  return children;
}


