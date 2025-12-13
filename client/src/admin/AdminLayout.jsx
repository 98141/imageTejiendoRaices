import React, { useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

export default function AdminLayout() {
  const { admin, logout } = useContext(AuthContext);
  const loc = useLocation();

  return (
    <div className="adminShell">
      <aside className="adminNav">
        <div className="adminNav__title">Panel Admin</div>

        <Link
          className={`adminNav__link ${
            loc.pathname.includes("/admin/categories") ? "isActive" : ""
          }`}
          to="/admin/categories"
        >
          Categorías
        </Link>
        <Link
          className={`adminNav__link ${
            loc.pathname.includes("/admin/subcategories") ? "isActive" : ""
          }`}
          to="/admin/subcategories"
        >
          Subcategorías
        </Link>
        <Link
          className={`adminNav__link ${
            loc.pathname.includes("/admin/designs") ? "isActive" : ""
          }`}
          to="/admin/designs"
        >
          Diseños
        </Link>
        <Link
          className={`adminNav__link ${
            loc.pathname.includes("/admin/orders") ? "isActive" : ""
          }`}
          to="/admin/orders"
        >
          Pedidos
        </Link>

        <div className="adminNav__footer">
          <div className="muted">{admin?.email}</div>
          <button className="btn" onClick={logout}>
            Salir
          </button>
        </div>
      </aside>

      <div className="adminMain">
        <Outlet />
      </div>
    </div>
  );
}
