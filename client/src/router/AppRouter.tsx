import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import App from "../App";
import Login from "../views/Login";
import Lobby from "../views/Lobby";
import Game from "../views/Game";
import Pending from "../views/Pending";

// PrivateRoute component to protect authenticated routes
const PrivateRoute = ({ children }) => {
  // Get the current player from the Redux store
  const player = useSelector((state) => state.player.player);
  console.log("[AppRouter] Current player state:", player);

  // If no player is logged in, navigate to the login page
  if (!player) {
    return <Navigate to="/login" replace />;
  }

  // If a player is logged in, render the children components
  return children;
};

// AppRouter component to define the application's routing
const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <App />
            </PrivateRoute>
          }
        >
          <Route index element={<Lobby />} />
          <Route
            path="game/:id"
            element={
              <PrivateRoute>
                <Game />
              </PrivateRoute>
            }
          />
          <Route
            path="pending/:id"
            element={
              <PrivateRoute>
                <Pending />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;