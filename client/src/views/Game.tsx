import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { upsert as upsertOngoingGame } from "../slices/ongoing_games_slice";
import DiceRoll from "../components/DiceRoll";
import ScoreCard from "../components/ScoreCard";
import "../style.css";

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

    // Find the game in the Redux store
    const foundGame = games.find((g) => g.id === parseInt(id, 10));
    if (foundGame) {
      setGame(foundGame);
      setEnabled(player === foundGame.players[foundGame.playerInTurn]);
      setFinished(foundGame.isFinished);

      const scores = foundGame.scores || [];
      const sortedStandings = scores
        .map((score, index) => [foundGame.players[index], score])
        .sort((a, b) => b[1] - a[1]);
      setStandings(sortedStandings);
    } else {
      console.error(`Game with ID ${id} not found in the Redux store.`);
    }
  }, [games, player, id, navigate]);

  return (
    <div className="game-layout">
      {/* Header */}
      <div className="header">
        <h1>Yahtzee!</h1>
        <p>Welcome player {player}</p>
        <h2>Game #{id}</h2>
      </div>

      {/* Main Content */}
      <div className="content">
        {/* Left: Scorecard */}
        <div className="scorecard-container">
          {game && (
            <ScoreCard
              className="card"
              game={game}
              player={player}
              enabled={enabled}
            />
          )}
        </div>

        {/* Center: Dice Roll */}
        <div className="dice-container">
          {!finished && game && (
            <DiceRoll
              className="roll"
              game={game}
              player={player}
              enabled={enabled}
            />
          )}
        </div>

        {/* Right: Navigation */}
        <div className="navigation">
          <a href="/">Lobby</a>
          <h3>My Games</h3>
          <ul>
            <li>Ongoing</li>
            <li>
              <a href={`/game/${id}`}>Game #{id}</a>
            </li>
          </ul>
          <h3>Waiting for players</h3>
          <h3>Available Games</h3>
        </div>
      </div>
    </div>
  );
};

export default Game;
