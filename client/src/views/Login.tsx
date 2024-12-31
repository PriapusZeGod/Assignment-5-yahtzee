import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setPlayer } from "../slices/player_slice";

// Login component
const Login = () => {
  // Local state for the username input
  const [username, setUsername] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handler for the login button click
  const handleLogin = () => {
    if (username.trim()) {
      // If the username is not empty, dispatch the setPlayer action and navigate to the home page
      dispatch(setPlayer(username));
      navigate("/");
    } else {
      // If the username is empty, log a message to the console
      console.log("Username cannot be empty.");
    }
  };

  console.log("Login component rendering...");

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;