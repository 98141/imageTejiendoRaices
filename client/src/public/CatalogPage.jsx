import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import ImageModal from "./ImageModal";

export default function CatalogPage() {
  const { categorySlug, subcategorySlug } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    let slowTimer = setTimeout(() => setSlow(true), 7000);

    (async () => {
      setLoading(true);
      setError("");
      setSlow(false);
      try {
        const { data } = await api.get("/public/designs", {
          params: { categorySlug, subcategorySlug },
        });
        if (mounted) setItems(data.items || []);
      } catch (e) {
        const msg =
          e?.code === "ECONNABORTED"
            ? "Internet lento o servidor iniciando. Refresca y reintenta."
            : "No se pudo cargar la lista de diseños.";
        if (mounted) setError(msg);
      } finally {
        clearTimeout(slowTimer);
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      clearTimeout(slowTimer);
    };
  }, [categorySlug, subcategorySlug]);

  return (
    <section className="page">
      {loading ? (
        <div className="card">
          <div>Cargando diseños...</div>
          {slow ? (
            <div className="muted">
              Parece que el servidor está iniciando o tu internet está lento.
            </div>
          ) : null}
        </div>
      ) : error ? (
        <div className="card alert">{error}</div>
      ) : items.length === 0 ? (
        <div className="card muted">
          No hay diseños en esta categoría/subcategoría.
        </div>
      ) : (
        <div className="grid">
          {items.map((d) => (
            <button key={d.sku} className="tile" onClick={() => setSelected(d)}>
              <img
                className="tile__img"
                src={d.image.url}
                alt={d.name}
                loading="lazy"
              />
              <div className="tile__meta">
                <div className="tile__name">{d.name}</div>
                <div className="tile__sku">SKU: {d.sku}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <ImageModal design={selected} onClose={() => setSelected(null)} />
      ) : null}
    </section>
  );
}
