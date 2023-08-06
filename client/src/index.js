import App from "./App";
import "./index.scss";
import React from "react";
import ReactDOM from "react-dom/client";
import AuthContextProvider from "./context/AuthContextProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
        <link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet"></link>
        <link href="https://fonts.googleapis.com/css2?family=Roboto" rel="stylesheet"></link>
        <AuthContextProvider>
            <App />
        </AuthContextProvider>
	</React.StrictMode>
);
