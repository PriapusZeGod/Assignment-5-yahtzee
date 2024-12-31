import React, { useState } from "react";
import {
  lower_section_keys,
  lower_section_slots,
  sum_upper,
  total_upper,
  upper_section_slots,
} from "../../../models/src/model/yahtzee.score";
import { score } from "../../../models/src/model/yahtzee.slots";
import { die_values } from "../../../models/src/model/dice";
import { register } from "../model/api";
import { useDispatch } from "react-redux";
import { upsert } from "../slices/ongoing_games_slice";

// ScoreCard component
const ScoreCard = ({ game, player, enabled }) => {
  const { players, upper_sections, lower_sections } = game;
  const dispatch = useDispatch();

  // State to keep track of the currently hovered cell
  const [hoveredCell, setHoveredCell] = useState(null);

  // Handler for registering a score
  const handleRegister = (key, isUpper) => {
    if (!enabled) {
      console.warn("Registration is disabled.");
      return;
    }

    console.log("Attempting to register slot:", key, "for game ID:", game.id);

    register(game, key, player).subscribe({
      next: (updatedGame) => {
        console.log(
          "Registration successful. Updated game state:",
          updatedGame
        );
        dispatch(upsert(updatedGame));
      },
      error: (error) => {
        console.error("Registration failed:", error);
      },
    });
  };

  // Check if the current player is active
  const isActive = (p) =>
    game.players[game.playerInTurn] === player && player === p;

  // Get the potential score for a given slot
  const getPotentialScore = (key, isUpper) => {
    return isUpper
      ? score(upper_section_slots[key], game.roll)
      : score(lower_section_slots[key], game.roll);
  };

  // Display the score or a placeholder if the score is undefined
  const displayScore = (score) =>
    score === undefined || score === null ? "---" : score;

  // Get the CSS class for the active player
  const activeClass = (p) => (p === player ? "activeplayer" : undefined);

  return (
    <div className="score">
      <table className="scorecard" style={{ border: "1px solid black" }}>
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
          {die_values.map((val) => (
            <tr key={val}>
              <td>{val}s</td>
              <td>{val * 3}</td>
              {players.map((p, i) => (
                <td
                  key={p}
                  className={
                    isActive(p) && upper_sections[i]?.scores[val] === undefined
                      ? "clickable potential"
                      : activeClass(p)
                  }
                  onMouseEnter={() =>
                    isActive(p) && upper_sections[i]?.scores[val] === undefined
                      ? setHoveredCell({ key: val, isUpper: true })
                      : setHoveredCell(null)
                  }
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() =>
                    isActive(p) &&
                    upper_sections[i]?.scores[val] === undefined &&
                    handleRegister(val, true)
                  }
                >
                  {isActive(p) &&
                  hoveredCell?.key === val &&
                  hoveredCell?.isUpper
                    ? getPotentialScore(val, true)
                    : displayScore(upper_sections[i]?.scores[val])}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>Sum</td>
            <td>63</td>
            {players.map((p, i) => (
              <td key={p} className={activeClass(p)}>
                {upper_sections?.[i]?.scores
                  ? sum_upper(upper_sections[i].scores)
                  : "---"}
              </td>
            ))}
          </tr>
          <tr>
            <td>Bonus</td>
            <td>50</td>
            {players.map((p, i) => (
              <td key={p} className={activeClass(p)}>
                {upper_sections[i]?.bonus ?? "---"}
              </td>
            ))}
          </tr>
          <tr>
            <td>Total</td>
            <td></td>
            {players.map((p, i) => (
              <td key={p} className={activeClass(p)}>
                {upper_sections?.[i]?.scores
                  ? total_upper(upper_sections[i])
                  : "---"}
              </td>
            ))}
          </tr>

          {/* Lower Section */}
          <tr className="section_header">
            <td colSpan={players.length + 2}>Lower Section</td>
          </tr>
          {lower_section_keys.map((key) => (
            <tr key={key}>
              <td>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
              <td></td>
              {players.map((p, i) => (
                <td
                  key={p}
                  className={
                    isActive(p) && lower_sections[i]?.scores[key] === undefined
                      ? "clickable potential"
                      : activeClass(p)
                  }
                  onMouseEnter={() =>
                    isActive(p) && lower_sections[i]?.scores[key] === undefined
                      ? setHoveredCell({ key, isUpper: false })
                      : setHoveredCell(null)
                  }
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() =>
                    isActive(p) &&
                    lower_sections[i]?.scores[key] === undefined &&
                    handleRegister(key, false)
                  }
                >
                  {isActive(p) &&
                  hoveredCell?.key === key &&
                  !hoveredCell?.isUpper
                    ? getPotentialScore(key, false)
                    : displayScore(lower_sections[i]?.scores[key])}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>Total</td>
            <td></td>
            {players.map((p, i) => (
              <td key={p} className={activeClass(p)}>
                {lower_sections?.[i]?.scores
                  ? Object.values(lower_sections[i]?.scores).reduce(
                      (acc, score) => acc + (score ?? 0),
                      0
                    )
                  : "---"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ScoreCard;