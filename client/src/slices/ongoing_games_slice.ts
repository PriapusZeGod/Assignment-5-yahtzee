import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  gameList: [],
};

const ongoingGamesSlice = createSlice({
  name: "ongoingGames",
  initialState,
  reducers: {
    upsert(state, action) {
      const game = action.payload;
      console.log(
        `[Ongoing Games Slice] Upserting game for player ${state.player}:`,
        game
      );

      const index = state.gameList.findIndex((g) => g.id === game.id);
      if (index > -1) {
        // Update existing game
        state.gameList[index] = game;
        console.log(`[Ongoing Games Slice] Updated game at index ${index}`);
        console.log("Updated game state:", state.gameList[index]);
      } else {
        // Add new game
        state.gameList.push(game);
        console.log("[Ongoing Games Slice] Added new game:", game);
      }
    },
  },
});

export const { upsert } = ongoingGamesSlice.actions;

// Selectors
export const selectGames = (state) => state.ongoingGames.gameList;
export const selectGameById = (state, id) =>
  state.ongoingGames.gameList.find((g) => g.id === id);

export default ongoingGamesSlice.reducer;
