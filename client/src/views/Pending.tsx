import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { join } from "../model/api";
import { remove as removePendingGame } from "../slices/pending_games_slice";
import { upsert as upsertOngoingGame } from "../slices/ongoing_games_slice";

// Pending component
const Pending = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Select the pending game, ongoing game, and player from the Redux store
  const pendingGame = useSelector((state) =>
    state.pendingGames.gameList.find((g) => g.id === parseInt(id, 10))
  );
  const ongoingGame = useSelector((state) =>
    state.ongoingGames.gameList.find((g) => g.id === parseInt(id, 10))
  );
  const player = useSelector((state) => state.player.player);

  // Determine if the player can join the pending game
  const canJoin = useMemo(() => {
    return pendingGame && player && !pendingGame.players.includes(player);
  }, [pendingGame, player]);

  // Effect to handle navigation and game state when the component mounts or updates
  useEffect(() => {
    if (!player) {
      // If no player is logged in, navigate to the login page
      navigate(`/login?pending=${id}`);
      return;
    }

    if (!pendingGame) {
      // If the pending game is not found, check if it is an ongoing game or navigate to the home page
      if (ongoingGame) {
        navigate(`/game/${id}`);
      } else {
        navigate("/");
      }
    }
  }, [player, pendingGame, ongoingGame, navigate, id]);

  // Handler for the join button click
  const handleJoin = async () => {
    if (canJoin && pendingGame) {
      try {
        const updatedGame = await join(pendingGame, player);
        dispatch(removePendingGame({ id: pendingGame.id })); // Removing from pending
        dispatch(upsertOngoingGame(updatedGame)); // Adding to ongoing
        navigate(`/game/${updatedGame.id}`);
      } catch (err) {
        console.error("Error joining the game:", err);
      }
    }
  };

  return (
    <div className="pending">
      <h1>Game #{id}</h1>
      {pendingGame ? (
        <>
          <div>Created by: {pendingGame.creator}</div>
          <div>Players: {pendingGame.players.join(", ")}</div>
          <div>
            Available Seats:{" "}
            {pendingGame.maxPlayers - pendingGame.players.length}
          </div>
          {canJoin && <button onClick={handleJoin}>Join</button>}
        </>
      ) : (
        <div>Loading game details...</div>
      )}
    </div>
  );
};

export default Pending;