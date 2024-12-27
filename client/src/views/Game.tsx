import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import fetchGames from "../slices/ongoing_games_slice";
import DiceRoll from "../components/DiceRoll";
import ScoreCard from "../components/ScoreCard";

const Game = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const games = useSelector((state) => state.ongoingGames.gameList);
  const player = useSelector((state) => state.player.player);

  const [game, setGame] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [finished, setFinished] = useState(false);
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    if (!player) {
      navigate(`/login?game=${id}`);
      return;
    }

    const foundGame = games.find((game) => game.id === parseInt(id, 10));
    if (!foundGame) {
      dispatch(fetchGames());
    } else {
      setGame(foundGame);
      setEnabled(player === foundGame.players[foundGame.playerInTurn]);
      setFinished(foundGame.isFinished); // Replace `isFinished` with the actual logic

      const scores = foundGame.scores || []; // Replace with the actual scoring logic
      const sortedStandings = scores
        .map((score, index) => [foundGame.players[index], score])
        .sort((a, b) => b[1] - a[1]);
      setStandings(sortedStandings);
    }
  }, [games, player, id, navigate, dispatch]);

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
