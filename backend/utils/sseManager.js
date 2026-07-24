const clients = new Set();
const ipConnections = new Map();
const HEARTBEAT_INTERVAL = 30000;
const MAX_CONNECTIONS_PER_IP = 3;
const MAX_TOTAL_CONNECTIONS = 200;

export function addClient(res, ip) {
  if (clients.size >= MAX_TOTAL_CONNECTIONS) {
    res.writeHead(429);
    res.end();
    return false;
  }

  const currentIpConns = ipConnections.get(ip) || 0;
  if (currentIpConns >= MAX_CONNECTIONS_PER_IP) {
    res.writeHead(429);
    res.end();
    return false;
  }
  ipConnections.set(ip, currentIpConns + 1);

  clients.add(res);

  const heartbeat = setInterval(() => {
    res.write(":heartbeat\n\n");
  }, HEARTBEAT_INTERVAL);

  res.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(res);
    const count = (ipConnections.get(ip) || 0) - 1;
    if (count <= 0) ipConnections.delete(ip);
    else ipConnections.set(ip, count);
  });

  return true;
}

export function broadcast(event, data) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    client.write(message);
  }
}
