import { Subject, Observable, from } from "rxjs";
import { catchError, map } from "rxjs/operators";
import type { DieValue } from "../../../models/src/model/dice";
import type { IndexedYahtzee, IndexedYahtzeeSpecs } from "./game";
import type { LowerSectionKey } from "../../../models/src/model/yahtzee.score";

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const apiSubject = new Subject<any>();

// Utility function to create an Observable for fetch requests
function apiCall<T>(url: string, options: RequestInit): Observable<T> {
  return from(
    fetch(url, options).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
  ).pipe(
    catchError((error) => {
      console.error(`API call failed at ${url}:`, error);
      throw error;
    })
  );
}

// Utility function to create an Observable for POST requests
function post<T>(url: string, body: {} = {}): Observable<T> {
  return apiCall<T>(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

// API Functions
export function games(): Observable<IndexedYahtzee[]> {
  return apiCall<IndexedYahtzee[]>("http://localhost:8080/games", { headers });
}

export function pendingGames(): Observable<IndexedYahtzeeSpecs[]> {
  return apiCall<IndexedYahtzeeSpecs[]>("http://localhost:8080/pending-games", {
    headers,
  });
}

export function join(
  game: IndexedYahtzeeSpecs,
  player: string
): Observable<IndexedYahtzeeSpecs | IndexedYahtzee> {
  return post(`http://localhost:8080/pending-games/${game.id}/players`, {
    player,
  });
}

export function newGame(
  number_of_players: number,
  player: string
): Observable<IndexedYahtzeeSpecs | IndexedYahtzee> {
  return post("http://localhost:8080/pending-games", {
    creator: player,
    number_of_players,
  });
}

function performAction<T>(game: IndexedYahtzee, action: any): Observable<T> {
  return post<T>(`http://localhost:8080/games/${game.id}/actions`, action);
}

export function reroll(
  game: IndexedYahtzee,
  held: number[],
  player: string
): Observable<IndexedYahtzee> {
  return performAction<IndexedYahtzee>(game, { type: "reroll", held, player });
}

export function register(
  game: IndexedYahtzee,
  slot: DieValue | LowerSectionKey,
  player: string
): Observable<IndexedYahtzee> {
  return performAction<IndexedYahtzee>(game, {
    type: "register",
    slot,
    player,
  });
}

// Observable for API updates
export const apiUpdates$ = apiSubject.asObservable();
