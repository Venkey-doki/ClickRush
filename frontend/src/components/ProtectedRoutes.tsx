import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoutes = ({ redirectPath = "/login" }: { redirectPath?: string }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;