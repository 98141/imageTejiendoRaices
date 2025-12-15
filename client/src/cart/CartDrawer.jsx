import React, { useContext, useMemo, useState } from "react";
import api from "../api/api";
import { CartContext } from "./cartContext";

export default function CartDrawer({ open, onClose }) {
  const { items, remove, setQty, clear } = useContext(CartContext);
  const [customerName, setCustomerName] = useState("");
  const [customerCodOrder, setCustomerCodOrder] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

  const canSend = useMemo(() => {
    return items.length > 0 && customerName.trim().length >= 2 && customerCodOrder.trim().length >= 2 && !busy;
  }, [items.length, customerName, customerCodOrder, busy]);

  const buildWhatsappText = (orderCode) => {
    const lines = [
      `Hola, quiero hacer un pedido de sublimación.`,
      `Pedido: ${orderCode}`,
      `Cliente: ${customerName.trim()}`,
      customerCodOrder.trim() ? `Codigo: ${customerCodOrder.trim()}` : null,
      customerPhone.trim() ? `Tel: ${customerPhone.trim()}` : null,
      "",
      "Items:",
      ...items.map((i) => `- ${i.sku} x ${i.qty} (${i.name})`),
      notes.trim() ? `\nNota: ${notes.trim()}` : null,
    ].filter(Boolean);

    return lines.join("\n");
  };

  const send = async () => {
    setMsg("");
    setBusy(true);
    try {
      const payload = {
        customerName,
        customerCodOrder,
        customerPhone,
        notes,
        items: items.map((i) => ({ sku: i.sku, qty: i.qty })),
      };

      const { data } = await api.post("/public/orders", payload);
      const orderCode = data.orderCode;

      const text = buildWhatsappText(orderCode);
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        text
      )}`;

      window.open(url, "_blank", "noopener,noreferrer");

      clear();
      setCustomerName("");
      setCustomerCodOrder("");
      setCustomerPhone("");
      setNotes("");
      setMsg(`Pedido creado: ${orderCode}`);
      onClose?.();
    } catch (e) {
      setMsg(e?.response?.data?.message || "No se pudo crear el pedido.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal" onMouseDown={onClose}>
      <div className="modal__card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal__top">
          <div>
            <div className="modal__title">Tu carrito</div>
            <div className="muted">
              Se enviará por WhatsApp y también quedará registrado en Admin.
            </div>
          </div>
          <button className="btn" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div style={{ padding: 12 }}>
          {msg ? (
            <div className="alert" style={{ marginBottom: 10 }}>
              {msg}
            </div>
          ) : null}

          {items.length === 0 ? (
            <div className="muted">No hay items.</div>
          ) : (
            <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
              {items.map((i) => (
                <div key={i.sku} className="card" style={{ padding: 10 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "64px 1fr auto",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <img src={i.imageUrl} alt={i.name} className="thumb" />
                    <div>
                      <div style={{ fontWeight: 800 }}>{i.name}</div>
                      <div className="muted">SKU: {i.sku}</div>
                    </div>
                    <button
                      className="btn danger"
                      onClick={() => remove(i.sku)}
                    >
                      Quitar
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <div className="muted">Cantidad:</div>
                    <input
                      className="input"
                      style={{ width: 120 }}
                      type="number"
                      min={1}
                      max={50}
                      value={i.qty}
                      onChange={(e) => setQty(i.sku, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="card" style={{ padding: 12 }}>
            <div className="formGrid">
              <input
                className="input"
                placeholder="Nombre del cliente (obligatorio)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <input
                className="input"
                placeholder="Codigo compra Tejiendo Raíces (obligatorio)"
                value={customerCodOrder}
                onChange={(e) => setCustomerCodOrder(e.target.value)}
              />
              <input
                className="input"
                placeholder="Teléfono (opcional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
              <textarea
                className="input"
                rows={3}
                placeholder="Notas (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button className="btn primary" disabled={!canSend} onClick={send}>
              {busy ? "Enviando..." : "Crear pedido y enviar por WhatsApp"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
