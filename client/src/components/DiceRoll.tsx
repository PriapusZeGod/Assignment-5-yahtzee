import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { reroll } from "../model/api";
import { upsert as upsertOngoingGame } from "../slices/ongoing_games_slice";

// Define the props for the DiceRoll component
interface DiceRollProps {
  game: any;
  player: any;
  enabled: boolean;
}

// DiceRoll component
const DiceRoll: React.FC<DiceRollProps> = ({ game, player, enabled }) => {
  // State to keep track of which dice are held
  const [held, setHeld] = useState([false, false, false, false, false]);
  const dispatch = useDispatch();

  // Memoized value to determine if reroll is enabled
  const rerollEnabled = useMemo(() => {
    const isPlayerTurn = game?.players[game?.playerInTurn] === player;
    console.log("Reroll enabled check:", game?.rolls_left > 0, isPlayerTurn);
    return game && game.rolls_left > 0 && isPlayerTurn;
  }, [game?.rolls_left, game?.playerInTurn, player]);

  // Effect to reset held state when a new roll occurs
  useEffect(() => {
    if (game?.roll?.length === 5 && held.length !== 5) {
      setHeld([false, false, false, false, false]);
    }
    console.log("Player in turn:", game?.players[game?.playerInTurn]);
    console.log("Current player:", player);
    console.log("Game rolls_left:", game?.rolls_left);
    console.log("Is rerollEnabled:", game && game.rolls_left > 0 && enabled);
  }, [game, held.length]);

  // Handler for reroll button click
  const handleReroll = () => {
    console.log("Reroll button clicked");
    if (enabled && game && player) {
      // Get indices of held dice
      const heldIndices = held
        .map((isHeld, index) => (isHeld ? index : null))
        .filter((index) => index !== null);

      console.log("Sending reroll request with:", {
        gameId: game.id,
        heldIndices,
        player,
      });

      // Call reroll API and handle response
      reroll(game, heldIndices, player).subscribe({
        next: (updatedGame) => {
          console.log("Reroll response:", updatedGame);
          const newHeld = held.map((isHeld, index) =>
            heldIndices.includes(index) ? true : false
          );
          setHeld(newHeld);
          dispatch(upsertOngoingGame(updatedGame));
        },
        error: (error) => console.error("Reroll error:", error),
      });
    } else {
      console.log("Reroll action not allowed");
    }
  };

  // Props for rendering a single dice image
  interface RenderDiceImageProps {
    value: number;
    index: number;
  }

  // Function to render a single dice image
  const renderDiceImage = useCallback(
    ({ value, index }: RenderDiceImageProps) => (
      <div key={index} className="dice-container">
        <img
          src={`/assets/${value}.png`}
          alt={`Die value ${value}`}
          className={`dice-image ${held[index] ? "selected" : ""}`}
          onClick={() => {
            if (enabled) {
              setHeld((prev) => {
                const newHeld = [...prev];
                newHeld[index] = !newHeld[index];
                return newHeld;
              });
            }
          }}
        />
      </div>
    ),
    [held, enabled]
  );

  // Memoized list of dice images
  const diceList = useMemo(
    () => game.roll.map((value: number, index: number) => renderDiceImage({ value, index })),
    [game?.roll, renderDiceImage]
  );

  return (
    <div className="dice-roll">
      <div className="dice-header">
        {enabled
          ? "Your turn to roll!"
          : `${game.players[game.playerInTurn]} is playing`}
      </div>
      <div className="dice-list">{diceList}</div>
      {enabled && rerollEnabled && (
        <button
          onClick={handleReroll}
          disabled={!enabled || game.rolls_left === 0}
        >
          Reroll
        </button>
      )}
    </div>
  );
};

export default DiceRoll;