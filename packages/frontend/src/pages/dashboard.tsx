import { Line } from "react-chartjs-2";
import React, { Component } from "react";
import { ChartData } from "chart.js";
import { getAPI } from "@flowtr/homelab-common";
import { AxiosInstance } from "axios";
import { DateChart } from "@flowtr/react-charts";

const api = getAPI({
	baseURL: process.env.API ?? "http://localhost:3000",
});

export class DashboardPage extends Component {
	render() {
		return (
			<DateChart
				id="cpu-usage-chart"
				getAPI={() => api}
				label={"CPU"}
				chartId={"cpu-usage"}
				requestInterval={2500}
				requestUrl={"/cluster/stats?cluster=default&host=10.0.0.88"}
			/>
		);
	}
}
