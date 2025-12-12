const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|webp/;
  const extname = allowedExt.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedExt.test(file.mimetype);
  if (extname && mimetype) cb(null, true);
  else cb(new Error("Solo se permiten imágenes (jpg, png, webp)."));
};

exports.uploadImage10mb = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
