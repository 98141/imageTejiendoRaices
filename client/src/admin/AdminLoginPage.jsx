import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

export default function AdminLoginPage() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(email, password);
      nav("/admin/categories");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "No se pudo iniciar sesión");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page container">
      <div className="card">
        <h2>Admin Login</h2>
        {err ? <div className="alert">{err}</div> : null}

        <form onSubmit={onSubmit} className="form">
          <label className="label">Correo</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="label">Contraseña</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn primary" disabled={busy}>
            {busy ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
