import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { join } from "../model/api"; // Correctly import the `join` API function

const Pending = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get pending game and ongoing game by ID
  const pendingGame = useSelector((state) =>
    state.pendingGames.game(parseInt(id))
  );
  const ongoingGame = useSelector((state) =>
    state.ongoingGames.game(parseInt(id))
  );
  const player = useSelector((state) => state.player.player);

  const canJoin = useMemo(() => {
    return pendingGame && player && !pendingGame.players.includes(player);
  }, [pendingGame, player]);

  useEffect(() => {
    if (!player) {
      navigate(`/login?pending=${id}`);
      return;
    }

    if (!pendingGame) {
      if (ongoingGame) {
        navigate(`/game/${id}`);
      } else {
        navigate("/");
      }
    }
  }, [player, pendingGame, ongoingGame, navigate, id]);

  const handleJoin = async () => {
    if (canJoin && pendingGame) {
      try {
        await join(pendingGame, player); // Use the correct API function
        dispatch({
          type: "pendingGames/remove",
          payload: { id: pendingGame.id }, // Use the teacher's "remove" logic
        });
      } catch (error) {
        console.error("Error joining the game:", error);
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
            {pendingGame.number_of_players - pendingGame.players.length}
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
