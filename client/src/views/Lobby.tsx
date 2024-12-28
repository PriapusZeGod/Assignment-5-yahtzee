import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { upsert as upsertPendingGame } from "../slices/pending_games_slice";
import { upsert as upsertOngoingGame } from "../slices/ongoing_games_slice";

const Lobby = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const player = useSelector((state) => state.player.player);
  const pendingGames = useSelector((state) => state.pendingGames.gameList);
  const ongoingGames = useSelector((state) => state.ongoingGames.gameList);

  useEffect(() => {
    if (!player) {
      navigate("/login");
      return;
    }

    console.log("[Lobby] Redux state on mount:", {
      player,
      pendingGames,
      ongoingGames,
    });

    let ws = new WebSocket("ws://localhost:9090/publish");

    ws.onopen = () => {
      console.log("[Lobby] WebSocket connection opened.");
      ws.send(JSON.stringify({ type: "subscribe" }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("[Lobby] Received WebSocket message:", message);

        switch (message.type) {
          case "all_pending_games":
            message.message.forEach((game) => {
              dispatch(upsertPendingGame(game));
              console.log("[Lobby] Updated pending games:", pendingGames);
            });
            break;

          case "all_games":
            message.message.forEach((game) => {
              dispatch(upsertOngoingGame(game));
              console.log("[Lobby] Updated ongoing games:", ongoingGames);
            });
            break;

          case "gameUpdate":
            dispatch(upsertOngoingGame(message.message));
            console.log("[Lobby] Updated game from gameUpdate:", ongoingGames);
            break;

          default:
            console.warn("[Lobby] Unknown WebSocket message type:", message);
        }
      } catch (error) {
        console.error("[Lobby] Error processing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("[Lobby] WebSocket error:", error);
      setTimeout(() => {
        ws = new WebSocket("ws://localhost:9090/publish");
      }, 5000);
    };

    ws.onclose = () => {
      console.log("[Lobby] WebSocket connection closed. Retrying...");
    };

    return () => {
      console.log("[Lobby] Cleaning up WebSocket connection.");
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [dispatch, player, navigate, pendingGames, ongoingGames]);

  return (
    <div>
      <h1>Lobby</h1>
      <div>
        <h2>Pending Games</h2>
        <ul>
          {pendingGames.map((game) => (
            <li key={game.id}>
              Game #{game.id} - Players: {game.players.join(", ")}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Ongoing Games</h2>
        <ul>
          {ongoingGames.map((game) => (
            <li key={game.id}>
              Game #{game.id} - Players: {game.players.join(", ")}
              <button onClick={() => navigate(`/game/${game.id}`)}>
                Go to Game
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Lobby;
