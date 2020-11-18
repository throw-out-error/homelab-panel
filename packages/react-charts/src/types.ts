import { ApiClient } from "@flowtr/homelab-common";
import { Component, HTMLAttributes } from "react";

export interface BaseChartProps<T extends Component> extends HTMLAttributes<T> {
	/**
	 * Defaults to "line"
	 */
	chartType?:
		| "line"
		| "bar"
		| "radar"
		| "doughnut"
		| "pie"
		| "bubble"
		| "scatter"
		| string;

	chartId: string;

	/**
	 * The data label for y axis
	 */
	label: string;
	getAPI: () => Promise<ApiClient>;
}

export interface DataPoint {
	x: Date;
	y: number;
}

export interface DateRange {
	startDate: Date;
	endDate: Date;
}
