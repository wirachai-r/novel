import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "@/store/novel-store";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { token, user, checkAuth } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setChecking(false);
        return;
      }

      await checkAuth();
      setChecking(false);
    };

    verifyUser();
  }, [location, token, checkAuth]);

  if (checking) return null;

  if (!token || !user) return <Navigate to="/login" replace />;

  if (Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
