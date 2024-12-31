import { createSlice } from "@reduxjs/toolkit";

// Initial state for the ongoing games slice
const initialState = {
  gameList: [], // List of ongoing games
};

// Create a slice for ongoing games
const ongoingGamesSlice = createSlice({
  name: "ongoingGames", // Name of the slice
  initialState, // Initial state
  reducers: {
    // Reducer to upsert (update or insert) a game
    upsert(state, action) {
      const game = action.payload; // The game to upsert
      console.log(
        `[Ongoing Games Slice] Upserting game for player ${state.player}:`,
        game
      );

      // Find the index of the game in the gameList
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

// Export the upsert action
export const { upsert } = ongoingGamesSlice.actions;

// Selectors to get data from the state
export const selectGames = (state) => state.ongoingGames.gameList;
export const selectGameById = (state, id) =>
  state.ongoingGames.gameList.find((g) => g.id === id);

// Export the reducer to be used in the store
export default ongoingGamesSlice.reducer;