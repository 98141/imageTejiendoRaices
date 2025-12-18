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

export default function AdminSubcategoriesPage() {
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);

  const [categoryId, setCategoryId] = useState("");
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
      const [c1, s1] = await Promise.all([
        api.get("/admin/categories"),
        api.get("/admin/subcategories", {
          params: categoryId ? { categoryId } : {},
        }),
      ]);

      setCats(c1.data.items || []);
      setItems(s1.data.items || []);
    } catch (e) {
      setErr(
        e?.response?.data?.message || "No se pudieron cargar subcategorías"
      );
    } finally {
      setLoadingList(false);
      if (showPage) setLoadingPage(false);
    }
  };

  useEffect(() => {
    load({ showPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // recarga al cambiar categoría (sin overlay global)
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const canCreate = useMemo(() => {
    return categoryId && name.trim() && !creating;
  }, [categoryId, name, creating]);

  const create = async () => {
    setErr("");
    setCreating(true);

    try {
      await api.post("/admin/subcategories", { categoryId, name });
      setName("");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Error creando subcategoría");
    } finally {
      setCreating(false);
    }
  };

  const toggle = async (s) => {
    setErr("");
    setBusyId(s._id);

    try {
      await api.put(`/admin/subcategories/${s._id}`, {
        categoryId: s.categoryId?._id || s.categoryId,
        name: s.name,
        isActive: !s.isActive,
      });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Error actualizando subcategoría");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    setErr("");
    setBusyId(id);

    try {
      await api.delete(`/admin/subcategories/${id}`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Error eliminando subcategoría");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page">
      <h2>Subcategorías</h2>

      {err ? <div className="alert">{err}</div> : null}

      {/* Overlay carga inicial */}
      {loadingPage ? (
        <div className="overlay">
          <div className="overlayCard">
            <InlineSpinner label="Cargando subcategorías..." />
          </div>
        </div>
      ) : null}

      <div className="card formRow formRow--3 adminSubcats__row">
        <select
          className="input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={creating}
        >
          <option value="">-- Selecciona categoría --</option>
          {cats.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          className="input"
          placeholder="Nombre subcategoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={creating}
        />

        <button className="btn primary" onClick={create} disabled={!canCreate}>
          {creating ? "Creando..." : "Crear"}
        </button>
      </div>

      {creating ? <InlineSpinner label="Guardando..." /> : null}

      <div className="card tableWrap adminSubcats__table">
        <div className="designs__listHeader">
          <h3>Listado</h3>
          {loadingList ? <InlineSpinner label="Actualizando..." /> : null}
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Subcategoría</th>
              <th>Categoría</th>
              <th>Slug</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 && !loadingList ? (
              <tr>
                <td colSpan={5} className="muted" style={{ padding: 16 }}>
                  No hay subcategorías para mostrar.
                </td>
              </tr>
            ) : null}

            {items.map((s) => {
              const rowBusy = busyId === s._id;
              return (
                <tr key={s._id} aria-busy={rowBusy ? "true" : "false"}>
                  <td>{s.name}</td>
                  <td className="muted">{s.categoryId?.name || "—"}</td>
                  <td className="muted">{s.slug}</td>
                  <td>{s.isActive ? "Sí" : "No"}</td>
                  <td className="actions">
                    <button
                      className="btn"
                      onClick={() => toggle(s)}
                      disabled={rowBusy}
                    >
                      {rowBusy
                        ? "Procesando..."
                        : s.isActive
                        ? "Desactivar"
                        : "Activar"}
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => remove(s._id)}
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
