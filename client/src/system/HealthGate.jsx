import React, { useEffect, useRef, useState } from "react";
import api from "../api/api";

export default function HealthGate({ children }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const start = async () => {
    setReady(false);
    setFailed(false);
    setSeconds(0);

    if (timerRef.current) clearInterval(timerRef.current);

    // contador visual hasta 60s
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        if (next >= 60) {
          clearInterval(timerRef.current);
          setFailed(true);
        }
        return next;
      });
    }, 1000);

    try {
      // Intento con timeout 60s (api ya tiene timeout global)
      const { data } = await api.get("/health");
      if (data?.ok) setReady(true);
      else setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    start();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (ready) return children;

  return (
    <div className="gate">
      <div className="gate__card">
        {!failed ? (
          <>
            <div className="gate__title">Cargando...</div>
            <div className="gate__subtitle">
              Esperando respuesta del servidor. Esto puede tardar si está
              iniciando.
            </div>

            <div className="gate__bar">
              <div
                className="gate__barFill"
                style={{ width: `${Math.min(100, (seconds / 60) * 100)}%` }}
              />
            </div>

            <div className="muted">Tiempo: {seconds}s / 60s</div>
          </>
        ) : (
          <>
            <div className="gate__title">Servidor no activo</div>
            <div className="gate__subtitle">
              El servidor no respondió en 60 segundos. Recarga la página o
              reintenta.
            </div>

            <div className="gate__actions">
              <button className="btn primary" onClick={start}>
                Reintentar
              </button>
              <button className="btn" onClick={() => window.location.reload()}>
                Recargar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
