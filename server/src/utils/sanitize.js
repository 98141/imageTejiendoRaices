const { z } = require("zod");

exports.cleanText = (s) =>
  String(s ?? "")
    .replace(/<script.*?>.*?<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim();

exports.zCleanString = (max) =>
  z
    .string()
    .transform((v) => exports.cleanText(v))
    .refine((v) => v.length <= max, "Texto muy largo");
