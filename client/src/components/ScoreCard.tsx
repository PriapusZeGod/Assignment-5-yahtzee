import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { rerollDice } from "../slices/ongoing_games_slice";

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

// Converted ScoreCard Component (React)

import React, { useMemo } from "react";
import { useDispatch } from "react-redux";
import { registerScore } from "../redux/ongoingGamesSlice";
import {
  calculateScores,
  calculatePotentialScore,
  formatScore,
} from "../utils/scoreUtils";

const ScoreCard = ({ game, player, enabled }) => {
  const dispatch = useDispatch();

  const players = game.players;
  const upperSections = game.upper_sections;
  const lowerSections = game.lower_sections;

  const handleRegister = (key) => {
    if (enabled) {
      dispatch(registerScore({ gameId: game.id, key, player }));
    }
  };

  const isActive = (p) =>
    game.players[game.playerInTurn] === player && player === p;

  const getPlayerScores = (key, isUpper) => {
    const sections = isUpper ? upperSections : lowerSections;
    return players.map((p, i) => ({
      player: p,
      score: sections[i].scores[key],
    }));
  };

  const getPotentialScore = (key, isUpper) =>
    calculatePotentialScore(key, game.roll, isUpper);

  const activeClass = (p) => (p === player ? "activeplayer" : undefined);

  return (
    <div className="score">
      <table className="scorecard">
        <tbody>
          {/* Upper Section */}
          <tr className="section_header">
            <td colSpan={players.length + 2}>Upper Section</td>
          </tr>
          <tr>
            <td>Type</td>
            <td>Target</td>
            {players.map((p) => (
              <td key={p} className={activeClass(p)}>
                {p}
              </td>
            ))}
          </tr>
          {game.die_values.map((val) => (
            <tr key={val}>
              <td>{val}s</td>
              <td>{3 * val}</td>
              {getPlayerScores(val, true).map(({ player: p, score }) => (
                <td
                  key={p}
                  className={
                    isActive(p) && score === undefined
                      ? "clickable potential"
                      : activeClass(p)
                  }
                  onClick={() =>
                    isActive(p) && score === undefined && handleRegister(val)
                  }
                >
                  {formatScore(
                    isActive(p) && score === undefined
                      ? getPotentialScore(val, true)
                      : score
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>Sum</td>
            <td>63</td>
            {players.map((p, i) => (
              <td key={p} className={activeClass(p)}>
                {calculateScores(upperSections[i].scores, true)}
              </td>
            ))}
          </tr>
          <tr>
            <td>Bonus</td>
            <td>50</td>
            {players.map((p, i) => (
              <td key={p} className={activeClass(p)}>
                {formatScore(upperSections[i].bonus)}
              </td>
            ))}
          </tr>
          <tr>
            <td>Total</td>
            <td></td>
            {players.map((p, i) => (
              <td key={p} className={activeClass(p)}>
                {calculateScores(upperSections[i], true)}
              </td>
            ))}
          </tr>
          {/* Lower Section */}
          <tr className="section_header">
            <td colSpan={players.length + 2}>Lower Section</td>
          </tr>
          {game.lower_section_keys.map((key) => (
            <tr key={key}>
              <td>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
              <td></td>
              {getPlayerScores(key, false).map(({ player: p, score }) => (
                <td
                  key={p}
                  className={
                    isActive(p) && score === undefined
                      ? "clickable potential"
                      : activeClass(p)
                  }
                  onClick={() =>
                    isActive(p) && score === undefined && handleRegister(key)
                  }
                >
                  {formatScore(
                    isActive(p) && score === undefined
                      ? getPotentialScore(key, false)
                      : score
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>Total</td>
            <td></td>
            {players.map((p, i) => (
              <td key={p} className={activeClass(p)}>
                {calculateScores(game, false)[i]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ScoreCard;
