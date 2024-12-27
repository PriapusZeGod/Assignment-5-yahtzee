import React from "react";
import { useDispatch } from "react-redux";
import { upsert } from "../slices/ongoing_games_slice";
import {
  total_upper,
  total_lower,
  upper_section_slots,
  lower_section_slots,
} from "../../../models/src/model/yahtzee.score";
import { score } from "../../../models/src/model/yahtzee.slots";

const ScoreCard = ({ game, player, enabled }) => {
  const dispatch = useDispatch();

  // Fallback for game.die_values
  const dieValues = game?.die_values || [];
  const players = game?.players || [];
  const upperSections = game?.upper_sections || [];
  const lowerSections = game?.lower_sections || [];

  console.log("Debugging ScoreCard:", {
    dieValues,
    players,
    upperSections,
    lowerSections,
  });

  const handleRegister = (key) => {
    if (enabled) {
      dispatch(
        upsert({
          ...game,
          id: game.id,
          slot: key,
          player,
        })
      );
    }
  };

  const isActive = (p) =>
    game?.players?.[game.playerInTurn] === player && player === p;

  const getPlayerScores = (key, isUpper) => {
    const sections = isUpper ? upperSections : lowerSections;
    return players.map((p, i) => ({
      player: p,
      score: sections[i]?.scores?.[key],
    }));
  };

  const getPotentialScore = (key, isUpper) =>
    isUpper
      ? score(upper_section_slots[key], game?.roll || [])
      : score(lower_section_slots[key], game?.roll || []);

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
          {dieValues.map((val) => (
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
                  {isActive(p) && score === undefined
                    ? getPotentialScore(val, true)
                    : score ?? "-"}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>Sum</td>
            <td>63</td>
            {players.map((p, i) => (
              <td key={p} className={activeClass(p)}>
                {total_upper(upperSections[i])}
              </td>
            ))}
          </tr>
          <tr>
            <td>Bonus</td>
            <td>50</td>
            {players.map((p, i) => (
              <td key={p} className={activeClass(p)}>
                {upperSections[i]?.bonus ?? "-"}
              </td>
            ))}
          </tr>
          <tr>
            <td>Total</td>
            <td></td>
            {players.map((p, i) => (
              <td key={p} className={activeClass(p)}>
                {total_upper(upperSections[i])}
              </td>
            ))}
          </tr>
          {/* Lower Section */}
          <tr className="section_header">
            <td colSpan={players.length + 2}>Lower Section</td>
          </tr>
          {game?.lower_section_keys?.map((key) => (
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
                  {isActive(p) && score === undefined
                    ? getPotentialScore(key, false)
                    : score ?? "-"}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td>Total</td>
            <td></td>
            {players.map((p, i) => (
              <td key={p} className={activeClass(p)}>
                {total_lower(lowerSections[i])}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ScoreCard;
