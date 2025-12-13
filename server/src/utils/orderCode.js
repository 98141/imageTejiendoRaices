const Counter = require("../models/Counter");

exports.nextOrderCode = async () => {
  const year = new Date().getFullYear();
  const c = await Counter.findOneAndUpdate(
    { key: `orders_${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const num = String(c.seq).padStart(6, "0");
  return `SBL-${year}-${num}`;
};
