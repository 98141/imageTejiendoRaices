const { z } = require("zod");
const Subcategory = require("../models/SubCategory");
const Category = require("../models/Category");
const { slugify } = require("../utils/slug");
const { zCleanString } = require("../utils/sanitize");

const upsertSchema = z.object({
  categoryId: zCleanString(80),
  name: zCleanString(60),
  isActive: z.boolean().optional(),
});

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;

    const items = await Subcategory.find(filter)
      .populate("categoryId", "name")
      .sort({ name: 1 });
    res.json({ items });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { categoryId, name, isActive } = upsertSchema.parse(req.body);
    const cat = await Category.findById(categoryId);
    if (!cat) {
      res.status(400);
      throw new Error("categoryId inválido");
    }

    const slug = slugify(name);

    const created = await Subcategory.create({
      categoryId,
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
    const { categoryId, name, isActive } = upsertSchema.parse(req.body);

    const cat = await Category.findById(categoryId);
    if (!cat) {
      res.status(400);
      throw new Error("categoryId inválido");
    }

    const slug = slugify(name);

    const updated = await Subcategory.findByIdAndUpdate(
      req.params.id,
      {
        categoryId,
        name,
        slug,
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      },
      { new: true }
    );

    if (!updated) {
      res.status(404);
      throw new Error("Subcategoría no encontrada");
    }

    res.json({ item: updated });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const deleted = await Subcategory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error("Subcategoría no encontrada");
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
