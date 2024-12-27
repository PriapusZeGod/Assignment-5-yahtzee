import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { reroll } from "../model/api";

const DiceRoll = ({ game, player, enabled }) => {
  const [held, setHeld] = useState([true, true, true, true, true]);
  const dispatch = useDispatch();

  const rerollEnabled = useMemo(
    () => game && game.rolls_left > 0 && enabled,
    [game, enabled]
  );

  useEffect(() => {
    if (!rerollEnabled) {
      setHeld([true, true, true, true, true]);
    }
  }, [rerollEnabled]);

  const handleReroll = async () => {
    try {
      const heldIndices = held
        .map((isHeld, index) => (isHeld ? index : undefined))
        .filter((index) => index !== undefined);

      const updatedGame = await reroll(game, heldIndices, player);

      // Dispatch Redux action to update game state
      dispatch({
        type: "ongoingGames/update",
        payload: updatedGame,
      });
    } catch (error) {
      console.error("Failed to reroll:", error);
    }
  };

  const renderDiceImage = (value, index) => (
    <div key={index} className="dice-container">
      <img
        src={`/assets/${value}.png`}
        alt={`Die value ${value}`}
        className={`dice-image ${held[index] ? "selected" : ""}`}
        onClick={() => {
          if (enabled && rerollEnabled) {
            setHeld((prev) => {
              const newHeld = [...prev];
              newHeld[index] = !newHeld[index];
              return newHeld;
            });
          }
        }}
      />
      {enabled && rerollEnabled && (
        <div className="checkbox-container">
          <input
            type="checkbox"
            checked={held[index]}
            onChange={() =>
              setHeld((prev) => {
                const newHeld = [...prev];
                newHeld[index] = !newHeld[index];
                return newHeld;
              })
            }
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="dice-roll">
      <div className="dice-header">
        {enabled
          ? "Your turn to roll!"
          : `${game.players[game.playerInTurn]} is playing`}
      </div>
      <div className="dice-list">
        {game.roll.map((value, index) => renderDiceImage(value, index))}
      </div>
      {enabled && rerollEnabled && (
        <button className="reroll-button" onClick={handleReroll}>
          Re-roll
        </button>
      )}
    </div>
  );
};

export default DiceRoll;
