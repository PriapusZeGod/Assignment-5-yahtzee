import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { pending_games } from "../model/api"; // Adjust import to match your API utilities

// Asynchronous thunk to fetch pending games
export const fetchPendingGames = createAsyncThunk(
  "pendingGames/fetchPendingGames",
  async () => {
    const response = await pending_games();
    return response; // Assuming the API response is an array of pending games
  }
);

const pendingGamesSlice = createSlice({
  name: "pendingGames",
  initialState: {
    gameList: [], // Array of IndexedYahtzeeSpecs objects
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingGames.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPendingGames.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.gameList = action.payload;
      })
      .addCase(fetchPendingGames.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

// Selector to get a specific pending game by ID
export const selectPendingGameById = (state, id) =>
  state.pendingGames.gameList.find((game) => game.id === id);

export const {
  setPendingGames,
  updatePendingGame,
  upsertPendingGame,
  removePendingGame,
} = pendingGamesSlice.actions;
export default pendingGamesSlice.reducer;
