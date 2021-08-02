import React from "react";
import ReactDOM from "react-dom";
import { reportWebVitals, sendToGoogleAnalytics } from "./reportWebVitals";
import App from "./app";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root"),
);

reportWebVitals(sendToGoogleAnalytics, console.debug);
