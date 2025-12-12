const mongoose = require("mongoose");

const SubcategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 80,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SubcategorySchema.index({ categoryId: 1, slug: 1 }, { unique: true });
SubcategorySchema.index({ categoryId: 1, name: 1 });

module.exports = mongoose.model("Subcategory", SubcategorySchema);
