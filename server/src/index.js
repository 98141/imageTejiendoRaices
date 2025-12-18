require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
})();

console.log("[BOOT]", {
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
  COOKIE_SECURE: process.env.COOKIE_SECURE,
  COOKIE_NAME: process.env.COOKIE_NAME,
});
