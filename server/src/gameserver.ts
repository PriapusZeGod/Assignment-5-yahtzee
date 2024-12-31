import express, { type Express, type Request, type Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import create_api from "./api";
import { IndexedGame, PendingGame } from "./servermodel";
import { Subject } from "rxjs";
import { WebSocket } from "ws";
import { DieValue } from "models/src/model/dice";
import { LowerSectionKey } from "models/src/model/yahtzee.score";
import { all_games, all_pending_games } from "./servermodel";

// Define a typed request interface for handling request bodies
interface TypedRequest<BodyType> extends Request {
  body: BodyType;
}

// Define the possible actions that can be performed on a game
type RawAction =
  | { type: "reroll"; held: number[] }
  | { type: "register"; slot: DieValue | LowerSectionKey };

// Extend RawAction to include the player performing the action
type Action = RawAction & { player: string };

// Create an RxJS Subject to handle messages
const messageSubject = new Subject<any>();

// Function to start the game server
function start_server(ws: WebSocket) {
  const api = create_api(ws);
  const gameserver: Express = express();

  // Enable CORS for the frontend
  gameserver.use(
    cors({
      origin: "http://localhost:5173",
    })
  );

  // Set up headers for CORS
  gameserver.use((_, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH");
    next();
  });

  // Start the server and log the available games
  gameserver.listen(8080, () => {
    console.log("Gameserver listening on 8080");
    console.log("Available ongoing games at startup:", all_games());
    console.log("Available pending games at startup:", all_pending_games());
  });

  // Use body-parser to parse JSON request bodies
  gameserver.use(bodyParser.json());

  // WebSocket event handlers
  ws.onopen = () => console.log("WebSocket connection to Pub/Sub established.");
  ws.onerror = (error) => console.error("WebSocket error to Pub/Sub:", error);
  ws.onclose = () => console.log("WebSocket connection to Pub/Sub closed.");

  // Endpoint to create a new pending game
  gameserver.post(
    "/pending-games",
    async (
      req: TypedRequest<{ creator: string; number_of_players: number }>,
      res: Response<PendingGame | IndexedGame>
    ) => {
      const { creator, number_of_players } = req.body;
      const game = api.new_game(creator, number_of_players);
      res.send(game);
      messageSubject.next({ type: "gameUpdate", payload: game });
      broadcastGames(ws);
      broadcastPendingGames(ws);
    }
  );

  // Endpoint to join a pending game
  gameserver.post(
    "/pending-games/:id/players",
    async (
      req: TypedRequest<{ player: string }>,
      res: Response<PendingGame | IndexedGame>
    ) => {
      try {
        const id = parseInt(req.params.id);
        const game = api.join(id, req.body.player);
        res.send(game);
        messageSubject.next({ type: "gameUpdate", payload: game });
        broadcastGames(ws);
        broadcastPendingGames(ws);
      } catch (e: any) {
        res.status(e.message === "Not Found" ? 404 : 403).send();
      }
    }
  );

  // Endpoint to perform actions on a game
  gameserver.post(
    "/games/:id/actions",
    async (req: TypedRequest<Action>, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const game = resolve_action(id, req.body);
        res.send(game);
        messageSubject.next({ type: "gameUpdate", payload: game });
      } catch (e: any) {
        res.status(e.message === "Not Found" ? 404 : 403).send();
      }
    }
  );

  // Function to resolve actions on a game
  function resolve_action(id: number, action: Action): IndexedGame {
    switch (action.type) {
      case "reroll":
        return api.reroll(id, action.held, action.player);
      case "register":
        return api.register(id, action.slot, action.player);
    }
  }

  // Function to broadcast all games
  function broadcastGames(ws: WebSocket) {
    const games = all_games();
    console.log("[Server] Broadcasting all games:", games);
    ws.send(JSON.stringify({ type: "all_games", message: games }));
  }

  // Function to broadcast all pending games
  function broadcastPendingGames(ws: WebSocket) {
    const pendingGames = all_pending_games();
    console.log("[Server] Broadcasting all pending games:", pendingGames);
    ws.send(
      JSON.stringify({ type: "all_pending_games", message: pendingGames })
    );
  }

  // WebSocket event handlers for broadcasting game updates
  ws.onopen = () => {
    console.log("[Server] WebSocket connection to Pub/Sub established.");
    broadcastGames(ws);
    broadcastPendingGames(ws);
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data.toString());
      console.log("[Gameserver] Received message from Pub/Sub:", message);

      if (message.type === "gameUpdate") {
        console.log(
          "[Gameserver] Processing gameUpdate message:",
          message.message
        );
      } else {
        console.error("[Gameserver] Unknown message type:", message.type);
      }
    } catch (err) {
      console.error("[Gameserver] Error processing message:", err);
    }
  };

  // Subscribe to messageSubject to handle game updates
  messageSubject.subscribe({
    next: (message) => {
      console.log("[Server] Broadcasting message:", message);
      if (message.type === "gameUpdate") {
        console.log("[Server] Sending gameUpdate to Pub/Sub:", message.payload);
        api.broadcast(message.payload);
      }
    },
    error: (err) => {
      console.error("[Server] Error in messageSubject subscription:", err);
    },
  });
}

// Create a WebSocket connection to the Pub/Sub server and start the game server
const ws = new WebSocket("ws://localhost:9090/publish");
ws.onopen = (e) => start_server(e.target);