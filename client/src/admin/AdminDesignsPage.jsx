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

export default function AdminDesignsPage() {
  const [cats, setCats] = useState([]);
  const [subs, setSubs] = useState([]);
  const [items, setItems] = useState([]);

  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterSubcategoryId, setFilterSubcategoryId] = useState("");

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [image, setImage] = useState(null);

  const [err, setErr] = useState("");

  // Loading states
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null); // para toggle/delete por fila

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
      setSubs(s1.data.items || []);

      const params = {};
      if (filterCategoryId) params.categoryId = filterCategoryId;
      if (filterSubcategoryId) params.subcategoryId = filterSubcategoryId;

      const d1 = await api.get("/admin/designs", { params });
      setItems(d1.data.items || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar diseños");
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
    // cuando cambian filtros/selecciones, recarga (sin bloquear toda la página)
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, filterCategoryId, filterSubcategoryId]);

  const canCreate = useMemo(() => {
    return (
      name.trim() &&
      sku.trim() &&
      categoryId &&
      subcategoryId &&
      !!image &&
      !creating
    );
  }, [name, sku, categoryId, subcategoryId, image, creating]);

  const create = async () => {
    setErr("");
    setCreating(true);

    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("sku", sku);
      fd.append("categoryId", categoryId);
      fd.append("subcategoryId", subcategoryId);
      fd.append("internalNotes", internalNotes || "");
      fd.append("image", image);

      await api.post("/admin/designs", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setName("");
      setSku("");
      setInternalNotes("");
      setImage(null);

      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Error creando diseño");
    } finally {
      setCreating(false);
    }
  };

  const toggle = async (d) => {
    setErr("");
    setBusyId(d._id);

    try {
      const fd = new FormData();
      fd.append("name", d.name);
      fd.append("sku", d.sku);
      fd.append("categoryId", d.categoryId?._id || d.categoryId);
      fd.append("subcategoryId", d.subcategoryId?._id || d.subcategoryId);
      fd.append("internalNotes", d.internalNotes || "");
      fd.append("isActive", String(!d.isActive));

      await api.put(`/admin/designs/${d._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Error actualizando diseño");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id) => {
    setErr("");
    setBusyId(id);

    try {
      await api.delete(`/admin/designs/${id}`);
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Error eliminando diseño");
    } finally {
      setBusyId(null);
    }
  };

  const selectedImageLabel = image
    ? `${image.name} (${Math.round(image.size / 1024)} KB)`
    : "";

  return (
    <div className="page">
      <h2>Diseños</h2>

      {err ? <div className="alert">{err}</div> : null}

      {/* Overlay de carga inicial */}
      {loadingPage ? (
        <div className="overlay">
          <div className="overlayCard">
            <InlineSpinner label="Cargando panel de diseños..." />
          </div>
        </div>
      ) : null}

      <div className="card">
        <h3 className="designs__cardTitle">Crear diseño</h3>

        <div className="formGrid">
          <input
            className="input"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={creating}
          />

          <input
            className="input"
            placeholder="SKU (único)"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            disabled={creating}
          />

          <select
            className="input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={creating}
          >
            <option value="">-- Categoría --</option>
            {cats.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            disabled={!categoryId || creating}
          >
            <option value="">-- Subcategoría --</option>
            {subs.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="fileField">
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              disabled={creating}
            />
            {selectedImageLabel ? (
              <div className="muted fileHint">{selectedImageLabel}</div>
            ) : null}
          </div>

          <textarea
            className="input"
            rows={3}
            placeholder="Notas internas (opcional)"
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            disabled={creating}
          />
        </div>

        <button className="btn primary" onClick={create} disabled={!canCreate}>
          {creating ? "Subiendo..." : "Crear"}
        </button>

        {creating ? (
          <InlineSpinner label="Procesando imagen y guardando..." />
        ) : null}

        <div className="muted designs__help">
          Límite imagen: 10MB. Formatos: jpg/png/webp.
        </div>
      </div>

      <div className="card tableWrap">
        <div className="designs__listHeader">
          <h3>Listado</h3>
          {loadingList ? (
            <InlineSpinner label="Actualizando listado..." />
          ) : null}
        </div>

        <div className="formRow designs__filters">
          <select
            className="input"
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            disabled={loadingList}
          >
            <option value="">-- Filtrar categoría --</option>
            {cats.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={filterSubcategoryId}
            onChange={(e) => setFilterSubcategoryId(e.target.value)}
            disabled={!filterCategoryId || loadingList}
          >
            <option value="">-- Filtrar subcategoría --</option>
            {subs.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>SKU</th>
              <th>Nombre</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 && !loadingList ? (
              <tr>
                <td colSpan={5} className="muted" style={{ padding: 16 }}>
                  No hay diseños para mostrar.
                </td>
              </tr>
            ) : null}

            {items.map((d) => {
              const rowBusy = busyId === d._id;
              return (
                <tr key={d._id} aria-busy={rowBusy ? "true" : "false"}>
                  <td>
                    <img src={d.image?.url} alt={d.name} className="thumb" />
                  </td>
                  <td>{d.sku}</td>
                  <td>{d.name}</td>
                  <td>{d.isActive ? "Sí" : "No"}</td>
                  <td className="actions">
                    <button
                      className="btn"
                      onClick={() => toggle(d)}
                      disabled={rowBusy}
                    >
                      {rowBusy
                        ? "Procesando..."
                        : d.isActive
                        ? "Desactivar"
                        : "Activar"}
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => remove(d._id)}
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
