const { z } = require("zod");
const Order = require("../models/Order");
const { cleanText } = require("../utils/sanitize");

exports.list = async (req, res, next) => {
  try {
    const { status, q } = req.query;

    const filter = {};
    if (status && status !== "TODOS") filter.status = status;
    if (q) filter.orderCode = { $regex: cleanText(q), $options: "i" };

    const items = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ items });
  } catch (e) {
    next(e);
  }
};

const statusSchema = z.object({
  status: z.enum(["RECIBIDO", "EN_PROCESO", "COMPLETADO", "CANCELADO"]),
  note: z
    .string()
    .max(300)
    .optional()
    .transform((v) => cleanText(v || "")),
});

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = statusSchema.parse(req.body);

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Pedido no encontrado");
    }

    order.status = status;
    order.statusHistory.push({
      status,
      at: new Date(),
      by: req.admin?.email || "admin",
      note: note || "",
    });

    await order.save();
    res.json({ ok: true, item: order });
  } catch (e) {
    next(e);
  }
};
