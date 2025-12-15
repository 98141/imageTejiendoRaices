import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

const statuses = ["TODOS", "RECIBIDO", "EN_PROCESO", "COMPLETADO", "CANCELADO"];

// Reglas de transición (no retroceder)
const canTransition = (current, next) => {
  if (!current || !next) return false;
  if (current === next) return false;

  // Estados terminales: no se mueven
  if (current === "COMPLETADO" || current === "CANCELADO") return false;

  // Solo se puede cancelar en RECIBIDO (según tu requerimiento)
  if (current === "RECIBIDO")
    return next === "EN_PROCESO" || next === "CANCELADO";

  // EN_PROCESO solo puede ir a COMPLETADO (y NO cancelar)
  if (current === "EN_PROCESO") return next === "COMPLETADO";

  return false;
};

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // SSE: alerta cuando llega pedido nuevo
  useEffect(() => {
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
        load().catch(() => {});
        setTimeout(() => setToast(""), 6000);
      } catch {}
    });

    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const qq = q.trim().toLowerCase();
    return items.filter((o) => (o.orderCode || "").toLowerCase().includes(qq));
  }, [items, q]);

  const patchStatus = async (id, currentStatus, newStatus) => {
    setErr("");

    // Bloqueo UI: no retroceder ni permitir transiciones inválidas
    if (!canTransition(currentStatus, newStatus)) {
      setErr("Transición no permitida para el estado actual.");
      return;
    }

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

      <div className="orders__alerts">
        {toast ? <div className="alert">{toast}</div> : null}
        {err ? <div className="alert">{err}</div> : null}
      </div>

      <div className="card formRow formRow--3 orders__filters">
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

      <div className="card tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>CódigoTR</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
              <th>Detalles</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => {
              const current = o.status;
              const isReceived = current === "RECIBIDO";

              const btnClass = (s) =>
                `btn orders__stepBtn ${current === s ? "isActive" : ""}`;

              return (
                <tr key={o._id}>
                  <td className="orders__code">{o.orderCode}</td>
                  <td className="orders__code">
                    {o.customer?.codOrder || "—"}
                  </td>

                  <td>
                    <div>{o.customer?.name}</div>
                    <div className="muted">{o.customer?.phone || "—"}</div>
                  </td>

                  <td className="muted">{o.items?.length || 0}</td>

                  <td>
                    <span className={`statusPill statusPill--${current}`}>
                      {current}
                    </span>
                  </td>

                  <td className="muted">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>

                  <td className="actions orders__actions">
                    <button
                      className={btnClass("RECIBIDO")}
                      disabled // nunca retroceder; si ya está recibido, no hace nada
                      title="No se permite retroceder estados."
                    >
                      RECIBIDO
                    </button>

                    <button
                      className={btnClass("EN_PROCESO")}
                      disabled={!canTransition(current, "EN_PROCESO")}
                      onClick={() => patchStatus(o._id, current, "EN_PROCESO")}
                    >
                      EN PROCESO
                    </button>

                    <button
                      className={btnClass("COMPLETADO")}
                      disabled={!canTransition(current, "COMPLETADO")}
                      onClick={() => patchStatus(o._id, current, "COMPLETADO")}
                    >
                      COMPLETADO
                    </button>

                    {/* CANCELAR solo aparece si está en RECIBIDO */}
                    {isReceived ? (
                      <button
                        className="btn danger orders__stepBtn"
                        disabled={!canTransition(current, "CANCELADO")}
                        onClick={() => patchStatus(o._id, current, "CANCELADO")}
                      >
                        CANCELAR
                      </button>
                    ) : null}
                  </td>
                  <td>
                    <Link className="btn" to={`/admin/orders/${o._id}`}>
                      Ver detalles
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 ? (
          <div className="muted">No hay pedidos.</div>
        ) : null}
      </div>
    </div>
  );
}
