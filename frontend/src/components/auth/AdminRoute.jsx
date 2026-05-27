import { Outlet, Navigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

// Wraps routes that require admin - redirects to / if not admin
export default function AdminRoute() {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user?.isAdmin ? <Outlet /> : <Navigate to="/" />;
}