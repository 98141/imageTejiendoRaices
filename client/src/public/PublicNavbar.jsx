import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/api";

export default function PublicNavbar() {
  const [nav, setNav] = useState([]);
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    (async () => {
      setError("");
      try {
        // Health primero ayuda con cold-start
        await api.get("/health");
        const { data } = await api.get("/public/navigation");
        if (mounted) setNav(data.items || []);
      } catch (e) {
        const msg =
          e?.code === "ECONNABORTED"
            ? "Internet lento o servidor iniciando. Refresca en unos segundos."
            : "No se pudo cargar el catálogo. Refresca la página.";
        if (mounted) setError(msg);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link className="brand" to="/">
          Catálogo Sublimación
        </Link>

        {error ? (
          <div className="alert">{error}</div>
        ) : (
          <nav className="nav">
            {nav.map((c) => (
              <div className="nav__item" key={c.id}>
                <Link className="nav__link" to={`/c/${c.slug}`}>
                  {c.name}
                </Link>
                {c.subcategories?.length ? (
                  <div className="nav__dropdown">
                    {c.subcategories.map((s) => (
                      <Link
                        key={s.id}
                        className="nav__dropdownLink"
                        to={`/c/${c.slug}/${s.slug}`}
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
        )}

        <Link className="adminLink" to="/admin/login">
          Admin
        </Link>
      </div>
    </header>
  );
}
