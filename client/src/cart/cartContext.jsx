import React, { createContext, useEffect, useMemo, useState } from "react";

const LS_KEY = "sbl_cart_v1";
// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext(null);

const clamp = (n) => Math.max(1, Math.min(50, Number(n) || 1));

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const add = (design) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.sku === design.sku);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: clamp(copy[idx].qty + 1) };
        return copy;
      }
      return [
        ...prev,
        {
          sku: design.sku,
          name: design.name,
          imageUrl: design.image.url,
          qty: 1,
        },
      ];
    });
  };

  const remove = (sku) => setItems((prev) => prev.filter((x) => x.sku !== sku));
  const setQty = (sku, qty) =>
    setItems((prev) =>
      prev.map((x) => (x.sku === sku ? { ...x, qty: clamp(qty) } : x))
    );
  const clear = () => setItems([]);

  const count = useMemo(
    () => items.reduce((a, b) => a + (Number(b.qty) || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, add, remove, setQty, clear, count }),
    [items, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
