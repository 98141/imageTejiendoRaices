const { z } = require("zod");
const cloudinary = require("../config/cloudinary");
const Design = require("../models/Design");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const { zCleanString, cleanText } = require("../utils/sanitize");

const baseSchema = z.object({
  name: zCleanString(80),
  sku: zCleanString(40).transform((v) => v.toUpperCase()),
  categoryId: zCleanString(80),
  subcategoryId: zCleanString(80),
  internalNotes: z
    .string()
    .optional()
    .transform((v) => cleanText(v).slice(0, 2000)),
  isActive: z.preprocess(
    (v) => (v === "true" ? true : v === "false" ? false : v),
    z.boolean().optional()
  ),
});

async function validateRefs(categoryId, subcategoryId) {
  const cat = await Category.findById(categoryId);
  if (!cat) throw new Error("categoryId inválido");

  const sub = await Subcategory.findById(subcategoryId);
  if (!sub) throw new Error("subcategoryId inválido");

  if (sub.categoryId.toString() !== cat._id.toString()) {
    throw new Error("La subcategoría no pertenece a la categoría seleccionada");
  }
}

async function uploadToCloudinary(fileBuffer) {
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "catalogo-sublimacion/designs",
        resource_type: "image",
      },
      (err, res) => (err ? reject(err) : resolve(res))
    );
    stream.end(fileBuffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes || 0,
    format: result.format || "",
    width: result.width || 0,
    height: result.height || 0,
  };
}

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;
    if (req.query.subcategoryId) filter.subcategoryId = req.query.subcategoryId;

    const items = await Design.find(filter)
      .populate("categoryId", "name")
      .populate("subcategoryId", "name")
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.file?.buffer) {
      res.status(400);
      throw new Error("Imagen requerida");
    }

    const data = baseSchema.parse(req.body);
    await validateRefs(data.categoryId, data.subcategoryId);

    const image = await uploadToCloudinary(req.file.buffer);

    const created = await Design.create({
      ...data,
      image,
      internalNotes: data.internalNotes || "",
      isActive: typeof data.isActive === "boolean" ? data.isActive : true,
    });

    res.status(201).json({ item: created });
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = baseSchema.parse(req.body);
    await validateRefs(data.categoryId, data.subcategoryId);

    const existing = await Design.findById(req.params.id);
    if (!existing) {
      res.status(404);
      throw new Error("Diseño no encontrado");
    }

    let image = existing.image;

    if (req.file?.buffer) {
      // Reemplazar imagen: borrar anterior y subir nueva
      if (existing.image?.publicId) {
        await cloudinary.uploader.destroy(existing.image.publicId, {
          resource_type: "image",
        });
      }
      image = await uploadToCloudinary(req.file.buffer);
    }

    existing.name = data.name;
    existing.sku = data.sku;
    existing.categoryId = data.categoryId;
    existing.subcategoryId = data.subcategoryId;
    existing.internalNotes = data.internalNotes || "";
    if (typeof data.isActive === "boolean") existing.isActive = data.isActive;
    existing.image = image;

    await existing.save();

    res.json({ item: existing });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await Design.findById(req.params.id);
    if (!existing) {
      res.status(404);
      throw new Error("Diseño no encontrado");
    }

    if (existing.image?.publicId) {
      await cloudinary.uploader.destroy(existing.image.publicId, {
        resource_type: "image",
      });
    }

    await existing.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
