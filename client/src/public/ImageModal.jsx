import React, { useEffect } from "react";

export default function ImageModal({ design, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, []);

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div className="modal__card" onMouseDown={(e) => e.stopPropagation()}>
        <img className="modal__img" src={design.image.url} alt={design.name} />
      </div>
    </div>
  );
}
