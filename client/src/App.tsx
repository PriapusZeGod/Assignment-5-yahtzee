import React, { useEffect, useMemo } from "react";
import { Link, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchGames, upsertGame } from "./slices/ongoing_games_slice";
import {
  fetchPendingGames,
  upsertPendingGame,
  removePendingGame,
} from "./slices/pending_games_slice";

const App = () => {
  const dispatch = useDispatch();

  const player = useSelector((state) => state.player.player);
  const ongoingGames = useSelector((state) => state.ongoingGames.gameList);
  const pendingGames = useSelector((state) => state.pendingGames.gameList);

  // Check if the current player is a participant in the game
  const isParticipant = (game) => game.players.includes(player ?? "");

  const myOngoingGames = useMemo(
    () =>
      ongoingGames.filter((game) => isParticipant(game) && !game.isFinished), // Replace `isFinished` with your logic
    [ongoingGames, player]
  );

  const myPendingGames = useMemo(
    () => pendingGames.filter((game) => isParticipant(game)),
    [pendingGames, player]
  );

  const otherPendingGames = useMemo(
    () => pendingGames.filter((game) => !isParticipant(game)),
    [pendingGames, player]
  );

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:9090/publish");
    ws.onopen = () => ws.send(JSON.stringify({ type: "subscribe" }));
    ws.onmessage = ({ data: gameJSON }) => {
      const game = JSON.parse(gameJSON);
      if (game.pending) {
        dispatch(upsertPendingGame(game));
      } else {
        dispatch(upsertGame(game));
        dispatch(removePendingGame(game.id));
      }
    };

    ws.onclose = () => ws.send(JSON.stringify({ type: "unsubscribe" }));

    // Fetch initial data
    dispatch(fetchGames());
    dispatch(fetchPendingGames());

    return () => {
      ws.close();
    };
  }, [dispatch]);

  return (
    <div id="app">
      <h1 className="header">Yahtzee!</h1>
      {player && <h2 className="subheader">Welcome player {player}</h2>}
      {player && (
        <nav>
          <Link className="link" to="/">
            Lobby
          </Link>

          <h2>My Games</h2>
          <h3>Ongoing</h3>
          {myOngoingGames.map((game) => (
            <Link className="link" key={game.id} to={`/game/${game.id}`}>
              Game #{game.id}
            </Link>
          ))}

          <h3>Waiting for players</h3>
          {myPendingGames.map((game) => (
            <Link className="link" key={game.id} to={`/pending/${game.id}`}>
              Game #{game.id}
            </Link>
          ))}

          <h2>Available Games</h2>
          {otherPendingGames.map((game) => (
            <Link className="link" key={game.id} to={`/pending/${game.id}`}>
              Game #{game.id}
            </Link>
          ))}
        </nav>
      )}
      <Outlet className="main" />
    </div>
  );
};

export default App;
