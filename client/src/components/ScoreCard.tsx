import React from "react";
import { useDispatch } from "react-redux";
import { register } from "../model/api";
import {
  total_upper,
  total_lower,
  upper_section_slots,
  lower_section_slots,
} from "../../../models/src/model/yahtzee.score";
import { score } from "../../../models/src/model/yahtzee.slots";

const ScoreCard = ({ game, player, enabled }) => {
  const dispatch = useDispatch();

  const dieValues = game?.die_values || [];
  const players = game?.players || [];
  const upperSections = game?.upper_sections || [];
  const lowerSections = game?.lower_sections || [];

  const handleRegister = async (key) => {
    if (enabled) {
      try {
        await register(game, key, player);
      } catch (error) {
        console.error("Error registering score:", error);
      }
    }
  };

  const isActive = (p) =>
    game?.players?.[game.playerInTurn] === player && player === p;

  const getPlayerScores = (key, isUpper) => {
    const sections = isUpper ? upperSections : lowerSections;
    return players.map((p, i) => ({
      player: p,
      score: sections[i]?.scores?.[key] ?? null,
    }));
  };

  const getPotentialScore = (key, isUpper) =>
    isUpper
      ? score(upper_section_slots[key], game?.roll || [])
      : score(lower_section_slots[key], game?.roll || []);

  const activeClass = (p) => (p === player ? "activeplayer" : undefined);

  return (
    <div className="scorecard-container">
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
          {dieValues.map((val) => (
            <tr key={val}>
              <td>
                <img
                  src={`/assets/${val}.png`}
                  alt={`${val}`}
                  className="dice-image"
                />
              </td>
              <td>{3 * val}</td>
              {getPlayerScores(val, true).map(({ player: p, score }) => (
                <td
                  key={p}
                  className={
                    isActive(p) && score === null
                      ? "clickable potential"
                      : activeClass(p)
                  }
                  onClick={() =>
                    isActive(p) && score === null && handleRegister(val)
                  }
                >
                  {score ?? (isActive(p) ? getPotentialScore(val, true) : "-")}
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
                    isActive(p) && score === null
                      ? "clickable potential"
                      : activeClass(p)
                  }
                  onClick={() =>
                    isActive(p) && score === null && handleRegister(key)
                  }
                >
                  {score ?? (isActive(p) ? getPotentialScore(key, false) : "-")}
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
