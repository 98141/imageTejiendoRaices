import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/orders/${id}`);
      setItem(data.item);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo cargar el pedido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <div className="card">Cargando pedido...</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="page">
        <div className="card alert">{err}</div>
        <div style={{ marginTop: 10 }}>
          <Link className="btn" to="/admin/orders">
            Volver
          </Link>
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="page">
      <div className="card" style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Pedido {item.orderCode}</h2>
            <div className="muted">
              Creado: {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link className="btn" to="/admin/orders">
              Volver
            </Link>
            <button className="btn" onClick={load}>
              Refrescar
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Cliente</h3>
        <div>
          <b>Nombre:</b> {item.customer?.name}
        </div>
        <div>
          <b>Tel:</b> {item.customer?.phone || "—"}
        </div>
        <div style={{ marginTop: 8 }}>
          <b>Estado actual:</b> {item.status}
        </div>
        {item.notes ? (
          <div style={{ marginTop: 8 }}>
            <b>Notas:</b>
            <div className="muted">{item.notes}</div>
          </div>
        ) : null}
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Items</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>SKU</th>
              <th>Nombre</th>
              <th>Cant.</th>
            </tr>
          </thead>
          <tbody>
            {(item.items || []).map((it, idx) => (
              <tr key={`${it.sku}-${idx}`}>
                <td>
                  <img src={it.imageUrl} alt={it.name} className="thumb" />
                </td>
                <td style={{ fontWeight: 800 }}>{it.sku}</td>
                <td>{it.name}</td>
                <td>{it.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Historial de estados</h3>
        {(item.statusHistory || []).length === 0 ? (
          <div className="muted">Sin historial.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Por</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {item.statusHistory.map((h, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 800 }}>{h.status}</td>
                  <td className="muted">{new Date(h.at).toLocaleString()}</td>
                  <td className="muted">{h.by || "—"}</td>
                  <td className="muted">{h.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
