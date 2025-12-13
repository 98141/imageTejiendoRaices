const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Design = require("../models/Desing");

exports.navigation = async (req, res, next) => {
  try {
    const cats = await Category.find({ isActive: true }).sort({ name: 1 });
    const subs = await Subcategory.find({ isActive: true }).sort({ name: 1 });

    const byCat = new Map();
    for (const c of cats) byCat.set(c._id.toString(), []);

    for (const s of subs) {
      const key = s.categoryId.toString();
      if (byCat.has(key))
        byCat.get(key).push({ id: s._id, name: s.name, slug: s.slug });
    }

    const items = cats.map((c) => ({
      id: c._id,
      name: c.name,
      slug: c.slug,
      subcategories: byCat.get(c._id.toString()) || [],
    }));

    res.json({ items });
  } catch (e) {
    next(e);
  }
};

exports.designs = async (req, res, next) => {
  try {
    const { categorySlug, subcategorySlug } = req.query;

    const filter = { isActive: true };

    if (categorySlug) {
      const cat = await Category.findOne({
        slug: categorySlug,
        isActive: true,
      });
      if (!cat) return res.json({ items: [] });
      filter.categoryId = cat._id;
    }

    if (subcategorySlug && filter.categoryId) {
      const sub = await Subcategory.findOne({
        categoryId: filter.categoryId,
        slug: subcategorySlug,
        isActive: true,
      });
      if (!sub) return res.json({ items: [] });
      filter.subcategoryId = sub._id;
    }

    const items = await Design.find(filter)
      .select("name sku image.url categoryId subcategoryId")
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (e) {
    next(e);
  }
};
