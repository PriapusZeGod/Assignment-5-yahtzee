// Converted Pending Component (React)

import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  selectPendingGameById,
  removePendingGame,
} from "../slices/pending_games_slice";
import { selectGameById } from "../slices/ongoing_games_slice";
import api from "../model/api";

const Pending = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const pendingGame = useSelector((state) =>
    selectPendingGameById(state, parseInt(id))
  );
  const ongoingGame = useSelector((state) =>
    selectGameById(state, parseInt(id))
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
        await api.joinGame(pendingGame.id, player);
        dispatch(removePendingGame(pendingGame.id));
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
