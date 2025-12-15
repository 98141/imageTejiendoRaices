const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true, index: true },

    customer: {
      name: { type: String, required: true, trim: true, maxlength: 80 },
      phone: { type: String, default: "", trim: true, maxlength: 30 },
      codOrder: { type: String, required: true, trim: true, maxlength: 20 },
    },

    items: [
      {
        sku: { type: String, required: true, trim: true, uppercase: true },
        name: { type: String, required: true, trim: true },
        imageUrl: { type: String, required: true },
        qty: { type: Number, required: true, min: 1, max: 50 },
      },
    ],

    notes: { type: String, default: "", maxlength: 1000 },

    status: {
      type: String,
      enum: ["RECIBIDO", "EN_PROCESO", "COMPLETADO", "CANCELADO"],
      default: "RECIBIDO",
      index: true,
    },

    statusHistory: [
      {
        status: { type: String, required: true },
        at: { type: Date, default: Date.now },
        by: { type: String, default: "system" },
        note: { type: String, default: "", maxlength: 300 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
