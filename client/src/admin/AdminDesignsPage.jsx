import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";

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

  const load = async () => {
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
  };

  useEffect(() => {
    load().catch(() => setErr("No se pudieron cargar diseños"));
  }, [categoryId, filterCategoryId, filterSubcategoryId]);

  const canCreate = useMemo(() => {
    return name.trim() && sku.trim() && categoryId && subcategoryId && image;
  }, [name, sku, categoryId, subcategoryId, image]);

  const create = async () => {
    setErr("");
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
    }
  };

  const toggle = async (d) => {
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
  };

  const remove = async (id) => {
    await api.delete(`/admin/designs/${id}`);
    await load();
  };

  return (
    <div className="page">
      <h2>Diseños</h2>
      {err ? <div className="alert">{err}</div> : null}

      <div className="card">
        <h3>Crear diseño</h3>
        <div className="formGrid">
          <input
            className="input"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input"
            placeholder="SKU (único)"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />

          <select
            className="input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
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
            disabled={!categoryId}
          >
            <option value="">-- Subcategoría --</option>
            {subs.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
          <textarea
            className="input"
            rows={3}
            placeholder="Notas internas (opcional)"
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
          />
        </div>

        <button className="btn primary" onClick={create} disabled={!canCreate}>
          Crear
        </button>
        <div className="muted">
          Límite imagen: 10MB. Formatos: jpg/png/webp.
        </div>
      </div>

      <div className="card">
        <h3>Listado</h3>
        <div className="formRow">
          <select
            className="input"
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
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
            disabled={!filterCategoryId}
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
            {items.map((d) => (
              <tr key={d._id}>
                <td>
                  <img src={d.image?.url} alt={d.name} className="thumb" />
                </td>
                <td>{d.sku}</td>
                <td>{d.name}</td>
                <td>{d.isActive ? "Sí" : "No"}</td>
                <td className="actions">
                  <button className="btn" onClick={() => toggle(d)}>
                    {d.isActive ? "Desactivar" : "Activar"}
                  </button>
                  <button className="btn danger" onClick={() => remove(d._id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
