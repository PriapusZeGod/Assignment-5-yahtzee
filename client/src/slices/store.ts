import { configureStore, Middleware } from "@reduxjs/toolkit";
import ongoingGamesReducer from "./ongoing_games_slice";
import pendingGamesReducer from "./pending_games_slice";
import playerReducer from "./player_slice";

// Logging middleware for debugging
const loggerMiddleware: Middleware<{}, any> = (store) => (next) => (action) => {
  console.log("[Middleware] Dispatching:", action);
  const result = next(action);
  console.log("[Middleware] Next state:", store.getState());
  return result;
};

// Store configuration
const store = configureStore({
  reducer: {
    ongoingGames: ongoingGamesReducer,
    pendingGames: pendingGamesReducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggerMiddleware),
});

export default store;

// TypeScript Types for State and Dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
