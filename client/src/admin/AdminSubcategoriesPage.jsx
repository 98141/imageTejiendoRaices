import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";

export default function AdminSubcategoriesPage() {
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    const [c1, s1] = await Promise.all([
      api.get("/admin/categories"),
      api.get("/admin/subcategories", {
        params: categoryId ? { categoryId } : {},
      }),
    ]);
    setCats(c1.data.items || []);
    setItems(s1.data.items || []);
  };

  useEffect(() => {
    load().catch(() => setErr("No se pudieron cargar subcategorías"));
  }, [categoryId]);

  const canCreate = useMemo(
    () => categoryId && name.trim(),
    [categoryId, name]
  );

  const create = async () => {
    setErr("");
    try {
      await api.post("/admin/subcategories", { categoryId, name });
      setName("");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Error creando subcategoría");
    }
  };

  const toggle = async (s) => {
    await api.put(`/admin/subcategories/${s._id}`, {
      categoryId: s.categoryId?._id || s.categoryId,
      name: s.name,
      isActive: !s.isActive,
    });
    await load();
  };

  const remove = async (id) => {
    await api.delete(`/admin/subcategories/${id}`);
    await load();
  };

  return (
    <div className="page">
      <h2>Subcategorías</h2>
      {err ? <div className="alert">{err}</div> : null}

      <div className="card formRow">
        <select
          className="input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
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
        />
        <button className="btn primary" onClick={create} disabled={!canCreate}>
          Crear
        </button>
      </div>

      <div className="card">
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
            {items.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td className="muted">{s.categoryId?.name || "—"}</td>
                <td className="muted">{s.slug}</td>
                <td>{s.isActive ? "Sí" : "No"}</td>
                <td className="actions">
                  <button className="btn" onClick={() => toggle(s)}>
                    {s.isActive ? "Desactivar" : "Activar"}
                  </button>
                  <button className="btn danger" onClick={() => remove(s._id)}>
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
