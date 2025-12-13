const mongoose = require("mongoose");

const DesignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      maxlength: 40,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
      index: true,
    },

    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      bytes: { type: Number, default: 0 },
      format: { type: String, default: "" },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },

    internalNotes: { type: String, default: "", maxlength: 2000 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

DesignSchema.index({ categoryId: 1, subcategoryId: 1 });
DesignSchema.index({ name: 1 });

module.exports = mongoose.model("Design", DesignSchema);
