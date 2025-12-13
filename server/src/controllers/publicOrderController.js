const { z } = require("zod");
const Order = require("../models/Order");
const Design = require("../models/Desing");
const { nextOrderCode } = require("../utils/orderCode");
const { cleanText } = require("../utils/sanitize");
const { notifyNewOrder } = require("../services/modificationHub");

const createSchema = z.object({
  customerName: z
    .string()
    .min(2)
    .max(80)
    .transform((v) => cleanText(v)),
  customerPhone: z
    .string()
    .max(30)
    .optional()
    .transform((v) => cleanText(v || "")),
  notes: z
    .string()
    .max(1000)
    .optional()
    .transform((v) => cleanText(v || "")),
  items: z
    .array(
      z.object({
        sku: z
          .string()
          .min(1)
          .max(40)
          .transform((v) => cleanText(v).toUpperCase()),
        qty: z.number().int().min(1).max(50),
      })
    )
    .min(1)
    .max(30),
});

exports.create = async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);

    // Traer diseños por SKU y crear snapshot
    const skus = body.items.map((i) => i.sku);
    const designs = await Design.find({ sku: { $in: skus }, isActive: true })
      .select("sku name image.url")
      .lean();

    const bySku = new Map(designs.map((d) => [d.sku, d]));

    const snapshot = body.items.map((i) => {
      const d = bySku.get(i.sku);
      if (!d) {
        const err = new Error(`SKU inválido o inactivo: ${i.sku}`);
        err.statusCode = 400;
        throw err;
      }
      return {
        sku: d.sku,
        name: d.name,
        imageUrl: d.image.url,
        qty: i.qty,
      };
    });

    const orderCode = await nextOrderCode();

    const order = await Order.create({
      orderCode,
      customer: { name: body.customerName, phone: body.customerPhone || "" },
      items: snapshot,
      notes: body.notes || "",
      status: "RECIBIDO",
      statusHistory: [{ status: "RECIBIDO", by: "system", note: "" }],
    });

    // Notificar a admins conectados (SSE)
    notifyNewOrder({
      orderCode: order.orderCode,
      createdAt: order.createdAt,
      itemsCount: order.items.length,
      customerName: order.customer.name,
    });

    res.status(201).json({
      ok: true,
      orderCode: order.orderCode,
    });
  } catch (e) {
    // si lanzaste error con statusCode
    if (e.statusCode) res.status(e.statusCode);
    next(e);
  }
};
