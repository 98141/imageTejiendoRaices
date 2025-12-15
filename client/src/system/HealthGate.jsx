import React, { useEffect, useRef, useState, useCallback } from "react";
import api from "../api/api";

export default function HealthGate({ children }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const timerRef = useRef(null);
  const startedRef = useRef(false); // evita doble start por StrictMode

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const start = useCallback(async () => {
    // reseteo
    setReady(false);
    setFailed(false);
    setSeconds(0);
    clearTimer();

    // contador visual hasta 60s
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        if (next >= 60) {
          clearTimer();
          setFailed(true);
        }
        return next;
      });
    }, 1000);

    // Abort manual a los 60s (por si axios no corta)
    const controller = new AbortController();
    const kill = setTimeout(() => controller.abort(), 60_000);

    try {
      // 1) intentamos la ruta esperada (si baseURL = .../api, esto pega /api/health)
      const r1 = await api.get("/health", { signal: controller.signal });
      // Si llega 200, consideramos listo aunque data.ok no venga
      if (r1?.status === 200) {
        setReady(true);
        return;
      }
    } catch (e) {
      // seguimos al fallback
    } finally {
      clearTimeout(kill);
    }

    // fallback: si alguien configuró baseURL sin /api, intentamos /api/health explícito
    const controller2 = new AbortController();
    const kill2 = setTimeout(() => controller2.abort(), 60_000);

    try {
      const r2 = await api.get("/api/health", { signal: controller2.signal });
      if (r2?.status === 200) {
        setReady(true);
        return;
      }
      setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      clearTimeout(kill2);
      clearTimer();
    }
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    start();
    return () => clearTimer();
  }, [start]);

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
