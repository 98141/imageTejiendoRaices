const clients = new Set();

function send(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

exports.addClient = (res) => {
  clients.add(res);
  // ping inicial
  send(res, "connected", { ok: true, ts: Date.now() });

  const ping = setInterval(() => {
    try {
      send(res, "ping", { ts: Date.now() });
    } catch {}
  }, 25000);

  res.on("close", () => {
    clearInterval(ping);
    clients.delete(res);
  });
};

exports.notifyNewOrder = (payload) => {
  for (const res of clients) {
    try {
      send(res, "order:new", payload);
    } catch {}
  }
};
