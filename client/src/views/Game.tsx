import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { selectGameById, fetchGames } from "../slices/ongoing_games_slice";
import DiceRoll from "../components/DiceRoll";
import ScoreCard from "../components/ScoreCard";

const Game = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const game = useSelector((state) => selectGameById(state, parseInt(id)));
  const player = useSelector((state) => state.player.player);

  const [enabled, setEnabled] = useState(false);
  const [finished, setFinished] = useState(false);
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    if (!player) {
      navigate(`/login?game=${id}`);
      return;
    }
    if (!game) {
      navigate("/");
      return;
    }

    setEnabled(game && player === game.players[game.playerInTurn]);
    setFinished(game && game.isFinished); // Replace `isFinished` with the actual logic

    if (game) {
      const scores = game.scores; // Replace with the actual scoring logic
      const sortedStandings = scores
        .map((score, index) => [game.players[index], score])
        .sort((a, b) => b[1] - a[1]);
      setStandings(sortedStandings);
    }
  }, [game, player, navigate, id]);

  useEffect(() => {
    if (!game) {
      dispatch(fetchGames());
    }
  }, [dispatch, game]);

  return (
    <div className="game">
      {game && player && (
        <>
          <div className="meta">
            <h1>Game #{id}</h1>
          </div>
          <ScoreCard
            className="card"
            game={game}
            player={player}
            enabled={enabled}
          />
          {!finished && (
            <DiceRoll
              className="roll"
              game={game}
              player={player}
              enabled={enabled}
            />
          )}
          {finished && (
            <div className="scoreboard">
              <table>
                <thead>
                  <tr>
                    <td>Player</td>
                    <td>Score</td>
                  </tr>
                </thead>
                <tbody>
                  {standings.map(([playerName, score]) => (
                    <tr
                      key={playerName}
                      className={playerName === player ? "current" : ""}
                    >
                      <td>{playerName}</td>
                      <td>{score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Game;
