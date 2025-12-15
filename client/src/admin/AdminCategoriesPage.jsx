import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    const { data } = await api.get("/admin/categories");
    setItems(data.items || []);
  };

  useEffect(() => {
    load().catch(() => setErr("No se pudieron cargar categorías"));
  }, []);

  const create = async () => {
    setErr("");
    try {
      await api.post("/admin/categories", { name });
      setName("");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Error creando categoría");
    }
  };

  const toggle = async (c) => {
    await api.put(`/admin/categories/${c._id}`, {
      name: c.name,
      isActive: !c.isActive,
    });
    await load();
  };

  const remove = async (id) => {
    await api.delete(`/admin/categories/${id}`);
    await load();
  };

  return (
    <div className="page">
      <h2>Categorías</h2>
      {err ? <div className="alert">{err}</div> : null}

      <div className="card formRow">
        <input
          className="input"
          placeholder="Nombre categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="btn primary"
          onClick={create}
          disabled={!name.trim()}
        >
          Crear
        </button>
      </div>

      <div className="card tableWrap">
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
            {items.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td className="muted">{c.slug}</td>
                <td>{c.isActive ? "Sí" : "No"}</td>
                <td className="actions">
                  <button className="btn" onClick={() => toggle(c)}>
                    {c.isActive ? "Desactivar" : "Activar"}
                  </button>
                  <button className="btn danger" onClick={() => remove(c._id)}>
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
