const mongoose = require("mongoose");
const crypto = require("crypto");

const AdminUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    role: { type: String, default: "admin", enum: ["admin"] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AdminUserSchema.statics.hashPassword = (plain) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(plain, salt, 120000, 64, "sha512")
    .toString("hex");
  return { salt, hash };
};

AdminUserSchema.methods.verifyPassword = function (plain) {
  const hash = crypto
    .pbkdf2Sync(plain, this.passwordSalt, 120000, 64, "sha512")
    .toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(this.passwordHash, "hex")
  );
};

module.exports = mongoose.model("AdminUser", AdminUserSchema);
