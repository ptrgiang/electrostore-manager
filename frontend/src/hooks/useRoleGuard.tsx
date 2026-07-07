import { Navigate, useLocation } from "react-router-dom";
import type { Role } from "../api/types";
import { useAuth } from "./useAuth";

export function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { isLoading, token, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-steel">Loading session...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
