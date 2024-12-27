import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "../App";
import Login from "../views/Login";
import Lobby from "../views/Lobby";
import Game from "../views/Game";
import Pending from "../views/Pending";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />}>
          <Route index element={<Lobby />} />
          <Route path="game/:id" element={<Game />} />
          <Route path="pending/:id" element={<Pending />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
