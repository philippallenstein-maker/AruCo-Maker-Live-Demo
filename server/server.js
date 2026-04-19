import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let latestPose = {
  x: 0,
  y: 0,
  z: 0,
  yaw: 0,
  pitch: 0,
  roll: 0,
  ts: Date.now()
};

wss.on("connection", (ws) => {
  console.log("Neuer Client verbunden");

  ws.send(JSON.stringify({
    type: "pose",
    data: latestPose
  }));

  ws.on("message", (message) => {
    try {
      const parsed = JSON.parse(message.toString());

      if (parsed.type === "pose") {
        latestPose = {
          ...parsed.data,
          ts: Date.now()
        };

        for (const client of wss.clients) {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: "pose",
              data: latestPose
            }));
          }
        }
      }
    } catch (err) {
      console.error("Fehler beim Verarbeiten:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client getrennt");
  });
});

console.log("WebSocket-Server läuft auf Port 8080");