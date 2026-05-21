import { Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children }) {
	const { isLoggedIn, loading } = useAuth();

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!isLoggedIn) {
		return <Navigate to="/login" replace />;
	}

	return children;
}
