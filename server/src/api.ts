// server/api
import { WebSocket } from "ws";
import * as Game from "models/src/model/yahtzee.game";
import { IndexedGame, PendingGame } from "./servermodel";
import * as G from "./servermodel";
import { DieValue } from "models/src/model/dice";
import { LowerSectionKey } from "models/src/model/yahtzee.score";
import { Subject } from "rxjs";

export default (ws: WebSocket) => {
  // RxJS Subject to handle incoming messages
  const messageSubject = new Subject<{ type: string; payload?: any }>();

  ws.onopen = () => {
    console.log("WebSocket connection established. Sending test message."); // Add this line
    ws.send(JSON.stringify({ type: "send", message: "Test broadcast" })); // Test message
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

  function new_game(
    creator: string,
    number_of_players: number
  ): IndexedGame | PendingGame {
    return G.add(creator, number_of_players);
  }

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

    broadcast(updatedGame); // Ensure this propagates to the WebSocket.

    return updatedGame;
  }

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

    broadcast(updatedGame); // Ensure this propagates to the WebSocket.

    return updatedGame;
  }

  function games(): Readonly<IndexedGame[]> {
    return G.all_games();
  }

  function pending_games(): Readonly<PendingGame[]> {
    return G.all_pending_games();
  }

  function join(id: number, player: string): IndexedGame | PendingGame {
    return G.join(id, player);
  }

  function broadcastGameUpdates() {
    const allGames = G.all_games();
    console.log("[Server] Broadcasting all games to WebSocket:", allGames);
    ws.send(JSON.stringify({ type: "all_games", message: allGames }));
  }

  // Subscribe to handle specific messages
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
