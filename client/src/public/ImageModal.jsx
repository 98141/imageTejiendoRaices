import React from "react";

export default function ImageModal({ design, onClose }) {
  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div className="modal__card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal__top">
          <div>
            <div className="modal__title">{design.name}</div>
            <div className="muted">SKU: {design.sku}</div>
          </div>
          <button className="btn" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <img className="modal__img" src={design.image.url} alt={design.name} />
      </div>
    </div>
  );
}
