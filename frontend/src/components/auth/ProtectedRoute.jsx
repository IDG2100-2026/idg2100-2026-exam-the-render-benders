import { Outlet, Navigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

// Wraps routes that require a logged in user - redirects to /login if not authenticated
export default function ProtectedRoute() {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Outlet /> : <Navigate to="/login" />;
}