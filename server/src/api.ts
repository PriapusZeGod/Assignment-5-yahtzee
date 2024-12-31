// Importing necessary modules and types
import { WebSocket } from "ws";
import * as Game from "models/src/model/yahtzee.game";
import { IndexedGame, PendingGame } from "./servermodel";
import * as G from "./servermodel";
import { DieValue } from "models/src/model/dice";
import { LowerSectionKey } from "models/src/model/yahtzee.score";
import { Subject } from "rxjs";

// Exporting the default function that sets up the WebSocket API
export default (ws: WebSocket) => {
  // RxJS Subject to handle incoming messages
  const messageSubject = new Subject<{ type: string; payload?: any }>();

  // WebSocket connection open event
  ws.onopen = () => {
    console.log("WebSocket connection established. Sending test message.");
    ws.send(JSON.stringify({ type: "send", message: "Test broadcast" }));
  };

  // WebSocket message listener
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("Server received message:", message);
      messageSubject.next(message); // Forward message to RxJS Subject
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  });

  // Broadcast function to send messages to the PubSub
  function broadcast(game: any) {
    if (ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: "gameUpdate", message: game });
      console.log(
        `[broadcast] Broadcasting gameUpdate for game id ${game.id}. Player in turn: ${game.playerInTurn}`
      );
      ws.send(message);
    } else {
      console.error("[broadcast] WebSocket is not open. Unable to broadcast.");
    }
  }

  // Function to create a new game
  function new_game(
    creator: string,
    number_of_players: number
  ): IndexedGame | PendingGame {
    return G.add(creator, number_of_players);
  }

  // Function to handle rerolling dice in a game
  function reroll(id: number, held: number[], player: string) {
    const game = G.game(id);

    if (!game || player !== game.players[game.playerInTurn]) {
      console.error(
        `[reroll] Invalid reroll attempt. Player '${player}' is not in turn. Current player in turn: '${
          game?.players[game?.playerInTurn]
        }'`
      );
      throw new Error("Forbidden");
    }

    console.log(
      `[reroll] Rerolling for game id ${id}. Player: ${player}, Held dice: ${held}`
    );

    const updatedGame = G.update(id, (game) => Game.reroll(held, game));

    console.log(`[reroll] Reroll complete. New roll: ${updatedGame.roll}`);

    broadcast(updatedGame);

    return updatedGame;
  }

  // Function to handle registering a score in a game
  function register(
    id: number,
    slot: DieValue | LowerSectionKey,
    player: string
  ) {
    const game = G.game(id);

    if (!game || player !== game.players[game.playerInTurn]) {
      console.error(
        `[register] Invalid register attempt. Player '${player}' is not in turn. Current player in turn: '${
          game?.players[game?.playerInTurn]
        }'`
      );
      throw new Error("Forbidden");
    }

    console.log(
      `[register] Registering score for game id ${id}. Player: ${player}, Slot: ${slot}`
    );

    const updatedGame = G.update(id, (game) => Game.register(slot, game));

    console.log(
      `[register] Registration complete. Player in turn now: ${updatedGame.playerInTurn}`
    );

    broadcast(updatedGame);

    return updatedGame;
  }

  // Function to get all games
  function games(): Readonly<IndexedGame[]> {
    return G.all_games();
  }

  // Function to get all pending games
  function pending_games(): Readonly<PendingGame[]> {
    return G.all_pending_games();
  }

  // Function to join a pending game
  function join(id: number, player: string): IndexedGame | PendingGame {
    return G.join(id, player);
  }

  // Function to broadcast all game updates
  function broadcastGameUpdates() {
    const allGames = G.all_games();
    console.log("[Server] Broadcasting all games to WebSocket:", allGames);
    ws.send(JSON.stringify({ type: "all_games", message: allGames }));
  }

  // Subscribe to handle game updates
  messageSubject.subscribe({
    next: (message) => {
      switch (message.type) {
        case "gameUpdate":
          console.log("Received game update message:", message.payload);
          break;
        default:
          console.error("Unknown message type:", message.type);
      }
    },
    error: (err) => console.error("Error in messageSubject subscription:", err),
  });

  return {
    new_game,
    pending_games,
    join,
    games,
    reroll,
    register,
    broadcast,
  };
};