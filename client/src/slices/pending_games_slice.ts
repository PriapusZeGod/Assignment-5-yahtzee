import { createSlice } from "@reduxjs/toolkit";

const pendingGamesSlice = createSlice({
  name: "pendingGames",
  initialState: {
    gameList: [], // Array of IndexedYahtzeeSpecs objects
  },
  reducers: {
    setPendingGames(state, action) {
      state.gameList = action.payload;
    },
    updatePendingGame(state, action) {
      const index = state.gameList.findIndex(
        (game) => game.id === action.payload.id
      );
      if (index > -1) {
        state.gameList[index] = action.payload;
      }
    },
    upsertPendingGame(state, action) {
      const index = state.gameList.findIndex(
        (game) => game.id === action.payload.id
      );
      if (index > -1) {
        state.gameList[index] = action.payload;
      } else {
        state.gameList.push(action.payload);
      }
    },
    removePendingGame(state, action) {
      state.gameList = state.gameList.filter(
        (game) => game.id !== action.payload
      );
    },
  },
});

export const {
  setPendingGames,
  updatePendingGame,
  upsertPendingGame,
  removePendingGame,
} = pendingGamesSlice.actions;
export default pendingGamesSlice.reducer;
