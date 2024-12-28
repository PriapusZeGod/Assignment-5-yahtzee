import { WebSocketServer, WebSocket } from "ws";
import { Subject } from "rxjs";
import { all_games } from "../../server/src/servermodel";

const PORT = 9090;
const webSocketServer = new WebSocketServer({ port: PORT, path: "/publish" });

console.log(`Pub/Sub server listening on port ${PORT}`);

// Clients set
const clients = new Set<WebSocket>();

// RxJS Subject to manage incoming messages
const messageSubject = new Subject<{ type: string; message?: any }>();

// Rate-limiting for logs
let lastBroadcastLogTime = 0;
const LOG_RATE_LIMIT_MS = 5000; // Log at most every 5 seconds

// Function to broadcast messages to all connected clients
const broadcast = (message: any) => {
  const now = Date.now();
  if (now - lastBroadcastLogTime > LOG_RATE_LIMIT_MS) {
    console.log("[PubSub] Broadcasting message to clients:", message);
    lastBroadcastLogTime = now;
  }
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
};

// Handle incoming WebSocket connections
webSocketServer.on("connection", (ws) => {
  clients.add(ws);
  console.log("New client connected.");

  // Handle incoming messages
  ws.on("message", (data) => {
    try {
      const command = JSON.parse(data.toString());
      if (command.type === "subscribe") {
        console.log("[PubSub] Client subscribed, sending all_games update.");
        ws.send(
          JSON.stringify({
            type: "all_games",
            message: all_games(),
          })
        );
      } else {
        messageSubject.next(command);
      }
    } catch (error) {
      console.error("[PubSub] Error parsing WebSocket message:", error);
    }
  });

  // Handle connection close
  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected.");
  });

  // Handle errors
  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

// Subscribe to the Subject to handle message broadcasting and commands
messageSubject.subscribe({
  next: (command) => {
    if (command.type === "gameUpdate") {
      broadcast(command.message);
    }
  },
  error: (err) => console.error("Error in messageSubject subscription:", err),
});
