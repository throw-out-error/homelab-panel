import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route } from "react-router-dom";
import "./style.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import { Header } from "./components/header";

console.log("Hello from tsx!");

ReactDOM.render(
    <p>
        <Header></Header>
        <BrowserRouter>
            <Route></Route>
        </BrowserRouter>
    </p>,
    document.getElementById("root"),
);
