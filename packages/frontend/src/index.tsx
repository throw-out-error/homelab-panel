import { DashboardPage } from "./pages/dashboard";
import React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";

const Application: React.FunctionComponent = () => (
	<Router>
		<Container>
			<Route exact path="/">
				<DashboardPage />
			</Route>
		</Container>
	</Router>
);

render(<Application />, document.getElementById("root"));
