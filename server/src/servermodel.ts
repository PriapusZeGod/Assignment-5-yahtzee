import { dice_roller } from "models/src/model/dice";
import {
  new_yahtzee,
  Yahtzee,
  YahtzeeSpecs,
} from "models/src/model/yahtzee.game";
import { standardRandomizer } from "models/src/utils/random_utils";

// Define the type for an indexed game
export type IndexedGame = Yahtzee & {
  readonly id: number;
  readonly pending: false;
};

// Global ID for games
let global_id = 1;

// Example game for initial state
const game0: IndexedGame = {
  id: 0,
  players: ["Alice", "Bob"],
  playerInTurn: 0,
  roll: [1, 2, 3, 2, 4],
  rolls_left: 2,
  upper_sections: [
    {
      scores: {
        [1]: 3,
        [2]: undefined,
        [3]: undefined,
        [4]: 12,
        [5]: 15,
        [6]: 18,
      },
    },
    {
      scores: {
        [1]: 3,
        [2]: undefined,
        [3]: 12,
        [4]: 12,
        [5]: 20,
        [6]: 18,
      },
    },
  ],
  lower_sections: [
    {
      scores: {
        pair: 12,
        "two pairs": 22,
        "three of a kind": 15,
        "four of a kind": 16,
        "full house": 27,
        "small straight": 0,
        "large straight": 20,
        chance: 26,
        yahtzee: 0,
      },
    },
    {
      scores: {
        pair: 10,
        "two pairs": 14,
        "three of a kind": 12,
        "four of a kind": 8,
        "full house": 18,
        "small straight": 0,
        "large straight": 0,
        chance: 22,
        yahtzee: undefined,
      },
    },
  ],
  pending: false,
  roller: dice_roller(standardRandomizer),
};

// List of all games
export const games: IndexedGame[] = [game0];

// Define the type for a pending game
export type PendingGame = YahtzeeSpecs & {
  id: number;
  readonly pending: true;
};

// List of all pending games
export const pending_games: PendingGame[] = [];

// Function to get all games
export function all_games(): Readonly<IndexedGame[]> {
  console.log("[Server] Returning all games:", games);
  return games;
}

// Function to get all pending games
export function all_pending_games(): Readonly<PendingGame[]> {
  console.log("[Server] Returning all pending games:", pending_games);
  return pending_games;
}

// Function to get a game by ID
export function game(id: number): IndexedGame | undefined {
  return games.find((g) => g.id === id);
}

// Function to add a new game
export function add(
  creator: string,
  number_of_players: number
): PendingGame | IndexedGame {
  const id = global_id++;
  const pending_game: PendingGame = {
    id,
    creator,
    players: [],
    number_of_players,
    pending: true,
  };
  pending_games.push(pending_game);
  return join(id, creator);
}

// Function to join a pending game
export function join(id: number, player: string): PendingGame | IndexedGame {
  const index = pending_games.findIndex((g) => g.id === id);
  if (index === -1) throw new Error("Not found");
  const pending_game = pending_games[index];
  pending_game.players.push(player);
  if (pending_game.players.length === pending_game.number_of_players) {
    const game = new_yahtzee({
      players: pending_game.players,
      randomizer: standardRandomizer,
    });
    pending_games.splice(index, 1);
    const newGame = { ...game, id, pending: false };
    games.push(newGame);
    return newGame;
  } else {
    return pending_game;
  }
}

// Function to update a game
export function update(
  id: number,
  reroll: (g: Yahtzee) => Yahtzee
): IndexedGame {
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) {
    console.error(`[update] Game with id ${id} not found.`);
    throw new Error("Not found");
  }

  console.log("[update] Game found:", games[index]);

  const oldPlayerInTurn = games[index].playerInTurn;
  const updatedGame = reroll(games[index]);

  console.log(
    `[update] Updating game id ${id}. Player in turn before update: ${oldPlayerInTurn}, after update: ${updatedGame.playerInTurn}`
  );

  games[index] = { ...updatedGame, id, pending: games[index].pending };

  console.log("[update] Updated game state:", games[index]);

  return games[index];
}