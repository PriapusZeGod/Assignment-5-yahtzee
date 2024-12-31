import { createSlice } from "@reduxjs/toolkit";

// Initial state for the player slice
const initialState = {
  player: undefined, // The current player, initially undefined
};

// Create a slice for the player
const playerSlice = createSlice({
  name: "player", // Name of the slice
  initialState, // Initial state
  reducers: {
    // Reducer to set the player
    setPlayer(state, action) {
      state.player = action.payload; // Set the player to the payload of the action
    },
  },
});

// Export the setPlayer action
export const { setPlayer } = playerSlice.actions;

// Export the reducer to be used in the store
export default playerSlice.reducer;