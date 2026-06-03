import { Outlet, Navigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminRoute() {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user?.isAdmin ? <Outlet /> : <Navigate to="/" />;
}