import { createSlice } from "@reduxjs/toolkit";

const ongoingGamesSlice = createSlice({
  name: "ongoingGames",
  initialState: {
    gameList: [], // Array of IndexedYahtzee objects
  },
  reducers: {
    setGames(state, action) {
      state.gameList = action.payload;
    },
    updateGame(state, action) {
      const index = state.gameList.findIndex(
        (game) => game.id === action.payload.id
      );
      if (index > -1) {
        state.gameList[index] = action.payload;
      }
    },
    upsertGame(state, action) {
      const index = state.gameList.findIndex(
        (game) => game.id === action.payload.id
      );
      if (index > -1) {
        state.gameList[index] = action.payload;
      } else {
        state.gameList.push(action.payload);
      }
    },
  },
});

export const { setGames, updateGame, upsertGame } = ongoingGamesSlice.actions;
export default ongoingGamesSlice.reducer;
