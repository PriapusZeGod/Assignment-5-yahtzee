import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  gameList: [],
};

const ongoingGamesSlice = createSlice({
  name: "ongoingGames",
  initialState,
  reducers: {
    games(state) {
      return state.gameList;
    },
    game(state, action) {
      const id = action.payload;
      return state.gameList.find((g) => g.id === id);
    },
    update(state, action) {
      const game = action.payload;
      const index = state.gameList.findIndex((g) => g.id === game.id);
      if (index > -1) {
        state.gameList[index] = game;
        return game;
      }
    },
    upsert(state, action) {
      const game = action.payload;
      if (state.gameList.some((g) => g.id === game.id)) {
        const index = state.gameList.findIndex((g) => g.id === game.id);
        state.gameList[index] = game;
      } else {
        state.gameList.push(game);
      }
    },
  },
});

export const { games, game, update, upsert } = ongoingGamesSlice.actions;
export default ongoingGamesSlice.reducer;
