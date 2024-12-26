import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { games } from "../model/api"; // Adjusted to use named import

// Asynchronous thunk to fetch ongoing games
export const fetchGames = createAsyncThunk(
  "ongoingGames/fetchGames",
  async () => {
    const response = await games();
    return response; // Assuming the API response is an array of ongoing games
  }
);

const ongoingGamesSlice = createSlice({
  name: "ongoingGames",
  initialState: {
    gameList: [], // Array of IndexedYahtzee objects
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.gameList = action.payload;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

// Selector to get a specific ongoing game by ID
export const selectGameById = (state, id) =>
  state.ongoingGames.gameList.find((game) => game.id === id);

export const { setGames, updateGame, upsertGame } = ongoingGamesSlice.actions;
export default ongoingGamesSlice.reducer;
