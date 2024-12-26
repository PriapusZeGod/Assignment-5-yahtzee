import { configureStore } from "@reduxjs/toolkit";
import ongoingGamesReducer from "./ongoing_games_slice";
import pendingGamesReducer from "./pending_games_slice";
import playerReducer from "./player_slice";

const store = configureStore({
  reducer: {
    ongoingGames: ongoingGamesReducer,
    pendingGames: pendingGamesReducer,
    player: playerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
