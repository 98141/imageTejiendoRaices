const { addClient } = require("../services/modificationHub");

exports.stream = async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  addClient(res);
};
