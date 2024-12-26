import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../model/api";

const Lobby = () => {
  const [numberOfPlayers, setNumberOfPlayers] = useState(2);
  const player = useSelector((state) => state.player.player);
  const navigate = useNavigate();

  const handleNewGame = async () => {
    if (player) {
      try {
        const pendingGame = await api.newGame(numberOfPlayers, player);
        navigate(`/pending/${pendingGame.id}`);
      } catch (error) {
        console.error("Error creating a new game:", error);
      }
    }
  };

  useEffect(() => {
    if (!player) {
      navigate("/login");
    }
  }, [player, navigate]);

  return (
    <div className="lobby">
      <h1>Yahtzee!</h1>
      {player && (
        <main>
          <label>
            Number of players:
            <input
              type="number"
              min="1"
              value={numberOfPlayers}
              onChange={(e) => setNumberOfPlayers(Number(e.target.value))}
            />
          </label>
          <button onClick={handleNewGame}>New Game</button>
        </main>
      )}
    </div>
  );
};

export default Lobby;
