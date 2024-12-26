import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { rerollDice } from "../redux/ongoingGamesSlice";

const DiceRoll = ({ game, player, enabled }) => {
  const [held, setHeld] = useState([false, false, false, false, false]);
  const dispatch = useDispatch();

  const rerollEnabled = useMemo(
    () => game && game.rolls_left > 0 && enabled,
    [game, enabled]
  );

  useEffect(() => {
    if (!rerollEnabled) {
      setHeld([false, false, false, false, false]);
    }
  }, [rerollEnabled]);

  const handleReroll = () => {
    const heldIndices = held
      .map((isHeld, index) => (isHeld ? index : undefined))
      .filter((index) => index !== undefined);
    dispatch(rerollDice({ gameId: game.id, heldIndices, player }));
  };

  return (
    <div className="dice">
      {!enabled && (
        <div className="diceheader">
          {game.players[game.playerInTurn]} is playing
        </div>
      )}
      <div className="die" />
      {game.roll.map((value, index) => (
        <div key={index} className={`die die${value}`}>
          {value}
        </div>
      ))}
      {enabled && rerollEnabled && <div className="caption">Hold:</div>}
      {enabled &&
        rerollEnabled &&
        game.roll.map((_, index) => (
          <input
            key={index}
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
        ))}
      {enabled && rerollEnabled && (
        <div className="reroll">
          <button onClick={handleReroll}>Re-roll</button>
        </div>
      )}
    </div>
  );
};

export default DiceRoll;
