import { Navigate } from "react-router-dom";



interface ProtectedRouteProps {
    children: JSX.Element;
    isLoggedIn: boolean;
    role?: stringi | null;
    allowedRoles?: string[];
    redirectTo?: string;
}

export default function ProtectedRoute({
    children,
    isLoggedIn,
    role,
    allowedRoles,
    redirectTo = "/login",
} : ProtectedRouteProps) {
    if (!isLoggedIn) {
        return <Navigate to={redirectTo} />;
    }

    if (role && !allowedRoles.includes(role)) {
        return <Navigate to={redirectTo} />;
    }

    return children;
}
