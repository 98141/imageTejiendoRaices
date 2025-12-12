const { z } = require("zod");
const Category = require("../models/Category");
const { slugify } = require("../utils/slug");
const { zCleanString } = require("../utils/sanitize");

const upsertSchema = z.object({
  name: zCleanString(60),
  isActive: z.boolean().optional(),
});

exports.list = async (req, res, next) => {
  try {
    const items = await Category.find().sort({ name: 1 });
    res.json({ items });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, isActive } = upsertSchema.parse(req.body);
    const slug = slugify(name);

    const created = await Category.create({
      name,
      slug,
      isActive: isActive ?? true,
    });
    res.status(201).json({ item: created });
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, isActive } = upsertSchema.parse(req.body);
    const slug = slugify(name);

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, slug, ...(typeof isActive === "boolean" ? { isActive } : {}) },
      { new: true }
    );

    if (!updated) {
      res.status(404);
      throw new Error("Categoría no encontrada");
    }

    res.json({ item: updated });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("Categoría no encontrada");
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
