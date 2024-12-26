import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setPlayer } from "../slices/player_slice";

const Login = () => {
  const [playerName, setPlayerName] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPlayer = useSelector((state) => state.player.player);

  // Enable login button if a name is entered
  const isLoginEnabled = playerName.trim() !== "";

  const handleLogin = () => {
    if (isLoginEnabled) {
      dispatch(setPlayer(playerName));

      const queryParams = new URLSearchParams(location.search);
      const gameId = queryParams.get("game");
      const pendingId = queryParams.get("pending");

      if (gameId) {
        navigate(`/game/${gameId}`);
      } else if (pendingId) {
        navigate(`/pending/${pendingId}`);
      } else {
        navigate("/");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isLoginEnabled) {
      e.preventDefault();
      handleLogin();
    }
  };

  useEffect(() => {
    if (currentPlayer) {
      navigate("/");
    }
  }, [currentPlayer, navigate]);

  return (
    <div className="login">
      <h1>Login</h1>
      <div>
        Username:{" "}
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button disabled={!isLoginEnabled} onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
