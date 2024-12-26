import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Lobby from "../views/Lobby"; // Adjust the paths as needed
import Login from "../views/Login";
import Game from "../views/Game";
import Pending from "../views/Pending";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/login" element={<Login />} />
        <Route path="/game/:id" element={<Game />} />
        <Route path="/pending/:id" element={<Pending />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
