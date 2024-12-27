import React from "react";
import { register } from "../model/api";
import {
  lower_section_keys,
  lower_section_slots,
  sum_upper,
  total_upper,
  upper_section_slots,
} from "../../../models/src/model/yahtzee.score";
import { die_values } from "../../../models/src/model/dice";
import { score } from "../../../models/src/model/yahtzee.slots";

const ScoreCard = ({ game, player, enabled }) => {
  const { players, upper_sections, lower_sections } = game;

  const handleRegister = (key, isUpper) => {
    if (enabled) {
      register(game, key, player);
    }
  };

  const isActive = (p) =>
    game.players[game.playerInTurn] === player && player === p;

  const displayScore = (score) => {
    if (score === undefined || score === null) return "---";
    return score;
  };

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
              <td>{val * 3}</td> {/* Example Target */}
              {players.map((p, i) => (
                <td
                  key={p}
                  className={
                    isActive(p) && upper_sections[i]?.scores[val] === undefined
                      ? "clickable potential"
                      : activeClass(p)
                  }
                  onClick={() =>
                    isActive(p) &&
                    upper_sections[i]?.scores[val] === undefined &&
                    handleRegister(val, true)
                  }
                >
                  {displayScore(upper_sections[i]?.scores[val])}
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
              <td></td> {/* Example Target */}
              {players.map((p, i) => (
                <td
                  key={p}
                  className={
                    isActive(p) && lower_sections[i]?.scores[key] === undefined
                      ? "clickable potential"
                      : activeClass(p)
                  }
                  onClick={() =>
                    isActive(p) &&
                    lower_sections[i]?.scores[key] === undefined &&
                    handleRegister(key, false)
                  }
                >
                  {displayScore(lower_sections[i]?.scores[key])}
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
