import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/api";

const statuses = ["TODOS", "RECIBIDO", "EN_PROCESO", "COMPLETADO", "CANCELADO"];

export default function AdminOrdersPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("TODOS");
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");
  const esRef = useRef(null);

  const load = async () => {
    const { data } = await api.get("/admin/orders", { params: { status, q } });
    setItems(data.items || []);
  };

  useEffect(() => {
    load().catch((e) =>
      setErr(e?.response?.data?.message || "No se pudieron cargar pedidos")
    );
  }, [status]);

  // SSE: alerta cuando llega pedido nuevo
  useEffect(() => {
    // cerrar anterior
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const url = `${
      import.meta.env.VITE_API_BASE_URL
    }/admin/notifications/stream`;

    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    es.addEventListener("order:new", (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        setToast(
          `Nuevo pedido: ${payload.orderCode} (${payload.itemsCount} items) - ${payload.customerName}`
        );
        // refresca listado
        load().catch(() => {});
        // auto hide
        setTimeout(() => setToast(""), 6000);
      } catch {}
    });

    es.onerror = () => {
      // no spamear; SSE puede reconectar solo
    };

    return () => {
      es.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const qq = q.trim().toLowerCase();
    return items.filter((o) => (o.orderCode || "").toLowerCase().includes(qq));
  }, [items, q]);

  const patchStatus = async (id, newStatus) => {
    setErr("");
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudo actualizar el estado");
    }
  };

  return (
    <div className="page">
      <h2>Pedidos</h2>

      {toast ? (
        <div className="alert" style={{ marginBottom: 10 }}>
          {toast}
        </div>
      ) : null}
      {err ? (
        <div className="alert" style={{ marginBottom: 10 }}>
          {err}
        </div>
      ) : null}

      <div
        className="card formRow"
        style={{ gridTemplateColumns: "220px 1fr auto" }}
      >
        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          className="input"
          placeholder="Buscar por código (SBL-YYYY-XXXXXX)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <button
          className="btn"
          onClick={() => load().catch(() => setErr("No se pudo refrescar"))}
        >
          Refrescar
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o._id}>
                <td style={{ fontWeight: 800 }}>{o.orderCode}</td>
                <td>
                  <div>{o.customer?.name}</div>
                  <div className="muted">{o.customer?.phone || "—"}</div>
                </td>
                <td className="muted">{o.items?.length || 0}</td>
                <td>{o.status}</td>
                <td className="muted">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td className="actions">
                  <button
                    className="btn"
                    onClick={() => patchStatus(o._id, "RECIBIDO")}
                  >
                    RECIBIDO
                  </button>
                  <button
                    className="btn"
                    onClick={() => patchStatus(o._id, "EN_PROCESO")}
                  >
                    EN PROCESO
                  </button>
                  <button
                    className="btn"
                    onClick={() => patchStatus(o._id, "COMPLETADO")}
                  >
                    COMPLETADO
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => patchStatus(o._id, "CANCELADO")}
                  >
                    CANCELAR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 ? (
          <div className="muted" style={{ marginTop: 10 }}>
            No hay pedidos.
          </div>
        ) : null}
      </div>
    </div>
  );
}
