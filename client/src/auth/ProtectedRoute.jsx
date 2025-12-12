import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useContext(AuthContext);

  if (loading)
    return (
      <div className="page">
        <div className="card">Cargando sesión...</div>
      </div>
    );
  if (!admin) return <Navigate to="/admin/login" replace />;

  return children;
}
