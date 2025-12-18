import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";

function InlineSpinner({ label = "Cargando..." }) {
  return (
    <div className="spinnerRow" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = async ({ showPage = false } = {}) => {
    if (showPage) setLoadingPage(true);
    setLoadingList(true);
    setErr("");

    try {
      const { data } = await api.get("/admin/categories");
      setItems(data.items || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar categorías");
    } finally {
      setLoadingList(false);
      if (showPage) setLoadingPage(false);
    }
  };

  useEffect(() => {
    load({ showPage: true });
  }, []);

  const canCreate = useMemo(() => {
    return name.trim() && !creating;
  }, [name, creating]);

  const create = async () => {
    setErr("");
    setCreating(true);

    try {
      await api.post("/admin/categories", { name });
      setName("");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Error creando categoría");
    } finally {
      setCreating(false);
    }
  };

  const toggle = async (c) => {
    setErr("");
    setBusyId(c._id);

    try {
      await api.put(`/admin/categories/${c._id}`, {
        name: c.name,
        isActive: !c.isActive,
      });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Error actualizando categoría");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    setErr("");
    setBusyId(id);

    try {
      await api.delete(`/admin/categories/${id}`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Error eliminando categoría");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page">
      <h2>Categorías</h2>

      {err ? <div className="alert">{err}</div> : null}

      {/* Overlay carga inicial */}
      {loadingPage ? (
        <div className="overlay">
          <div className="overlayCard">
            <InlineSpinner label="Cargando categorías..." />
          </div>
        </div>
      ) : null}

      <div className="card formRow">
        <input
          className="input"
          placeholder="Nombre categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={creating}
        />

        <button className="btn primary" onClick={create} disabled={!canCreate}>
          {creating ? "Creando..." : "Crear"}
        </button>
      </div>

      {creating ? <InlineSpinner label="Guardando..." /> : null}

      <div className="card tableWrap">
        <div className="designs__listHeader">
          <h3>Listado</h3>
          {loadingList ? <InlineSpinner label="Actualizando..." /> : null}
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Slug</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 && !loadingList ? (
              <tr>
                <td colSpan={4} className="muted" style={{ padding: 16 }}>
                  No hay categorías para mostrar.
                </td>
              </tr>
            ) : null}

            {items.map((c) => {
              const rowBusy = busyId === c._id;
              return (
                <tr key={c._id} aria-busy={rowBusy ? "true" : "false"}>
                  <td>{c.name}</td>
                  <td className="muted">{c.slug}</td>
                  <td>{c.isActive ? "Sí" : "No"}</td>
                  <td className="actions">
                    <button
                      className="btn"
                      onClick={() => toggle(c)}
                      disabled={rowBusy}
                    >
                      {rowBusy
                        ? "Procesando..."
                        : c.isActive
                        ? "Desactivar"
                        : "Activar"}
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => remove(c._id)}
                      disabled={rowBusy}
                    >
                      {rowBusy ? "Eliminando..." : "Eliminar"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
