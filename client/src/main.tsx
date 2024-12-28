import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import AppRouter from "./router/AppRouter";
import store from "./slices/store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </React.StrictMode>
);
