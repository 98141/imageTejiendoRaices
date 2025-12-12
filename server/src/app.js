const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const morgan = require("morgan");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const adminCategoryRoutes = require("./routes/adminCategoryRoutes");
const adminSubcategoryRoutes = require("./routes/adminSubcategoryRoutes");
const adminDesignRoutes = require("./routes/adminDesignRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();

/* Trust proxy (Render / reverse proxies) */
app.set("trust proxy", 1);

/* Core parsing */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* Security hardening */
app.use(helmet());
app.use(hpp());
app.use(mongoSanitize());

/* Compression */
app.use(compression());

/* Logging */
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

/* Rate limit (general) */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* CORS */
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

/* Health */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

/* Routes */
app.use("/api/auth", authRoutes);

app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/subcategories", adminSubcategoryRoutes);
app.use("/api/admin/designs", adminDesignRoutes);

app.use("/api/public", publicRoutes);

/* Errors */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
