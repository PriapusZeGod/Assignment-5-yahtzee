import React, { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

// App component
const App = () => {
  // Get the current player, ongoing games, and pending games from the Redux store
  const player = useSelector((state) => state.player.player);
  const ongoingGames = useSelector((state) => state.ongoingGames.gameList);
  const pendingGames = useSelector((state) => state.pendingGames.gameList);

  // Effect to log the Redux state when the component mounts or updates
  useEffect(() => {
    console.log("[App] Redux state on mount:", {
      player,
      ongoingGames,
      pendingGames,
    });
  }, [player, ongoingGames, pendingGames]);

  return (
    <div>
      <h1 className="header">Yahtzee!</h1>
      {player && <h2 className="subheader">Welcome player {player}</h2>}
      <nav>
        <Link className="link" to="/">
          Lobby
        </Link>
        {player && (
          <>
            <h2>My Games</h2>
            <h3>Ongoing</h3>
            {ongoingGames.map((game) => (
              <Link key={game.id} className="link" to={`/game/${game.id}`}>
                Game #{game.id}
              </Link>
            ))}
            <h3>Waiting for players</h3>
            {pendingGames.map((game) => (
              <Link key={game.id} className="link" to={`/pending/${game.id}`}>
                Game #{game.id}
              </Link>
            ))}
          </>
        )}
      </nav>
      <Outlet />
    </div>
  );
};

export default App;