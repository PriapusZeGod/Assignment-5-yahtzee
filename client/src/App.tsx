import React, { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { upsert } from "./slices/ongoing_games_slice";
import {
  upsert as upsertPending,
  remove as removePending,
} from "./slices/pending_games_slice";
import {
  games as fetchGamesAPI,
  pending_games as fetchPendingGamesAPI,
} from "./model/api";

const App = () => {
  const dispatch = useDispatch();
  const player = useSelector((state) => state.player.player);
  const ongoingGames = useSelector((state) => state.ongoingGames.gameList);
  const pendingGames = useSelector((state) => state.pendingGames.gameList);

  const isParticipant = (game) => game.players.includes(player);

  const myOngoingGames = ongoingGames.filter(
    (game) => isParticipant(game) && !game.isFinished
  );

  const myPendingGames = pendingGames.filter(isParticipant);
  const otherPendingGames = pendingGames.filter((game) => !isParticipant(game));

  useEffect(() => {
    let ws; // Declare the WebSocket variable

    const setupWebSocket = () => {
      ws = new WebSocket("ws://localhost:9090/publish");

      ws.onopen = () => {
        console.log("WebSocket connection opened.");
        ws.send(JSON.stringify({ type: "subscribe" })); // Send subscribe message
      };

      ws.onmessage = ({ data }) => {
        const game = JSON.parse(data);
        if (game.pending) {
          dispatch(upsertPending(game));
        } else {
          dispatch(upsert(game));
          dispatch(removePending(game));
        }
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed.");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    const fetchGames = async () => {
      const games = await fetchGamesAPI();
      games.forEach((game) => dispatch(upsert(game)));
    };

    const fetchPendingGames = async () => {
      const pendingGames = await fetchPendingGamesAPI();
      pendingGames.forEach((game) => dispatch(upsertPending(game)));
    };

    setupWebSocket();
    fetchGames();
    fetchPendingGames();

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "unsubscribe" }));
        ws.close();
      }
    };
  }, [dispatch]);

  return (
    <div>
      <h1 className="header">Yahtzee!</h1>
      {player && <h2 className="subheader">Welcome player {player}</h2>}
      <nav>
        <Link className="link" to="/">
          Lobby
        </Link>
        {player && (
          <>
            <h2>My Games</h2>
            <h3>Ongoing</h3>
            {myOngoingGames.map((game) => (
              <Link key={game.id} className="link" to={`/game/${game.id}`}>
                Game #{game.id}
              </Link>
            ))}
            <h3>Waiting for players</h3>
            {myPendingGames.map((game) => (
              <Link key={game.id} className="link" to={`/pending/${game.id}`}>
                Game #{game.id}
              </Link>
            ))}
            <h2>Available Games</h2>
            {otherPendingGames.map((game) => (
              <Link key={game.id} className="link" to={`/pending/${game.id}`}>
                Game #{game.id}
              </Link>
            ))}
          </>
        )}
      </nav>
      <Outlet />
    </div>
  );
};

export default App;
