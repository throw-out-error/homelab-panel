import Chart from "chart.js";
import React, { Component } from "react";
import { ChartData } from "chart.js";
import { Button } from "react-bootstrap";
import { AxiosInstance } from "axios";
import { BaseChartProps, DataPoint, DateRange } from "../types";
import DateRangePicker from "react-bootstrap-daterangepicker";
import isWithin from "date-fns/isWithinInterval";
import addHours from "date-fns/addHours";
import { stringify } from "@toes/core";

export interface DateChartProps extends BaseChartProps<DateChart> {
	/**
	 * The interval in milliseconds to make requests to the backend at.
	 */
	requestInterval: number;

	requestUrl: string;
}

export class DateChart extends Component<
	DateChartProps,
	{
		data: ChartData;
		range: DateRange;
		chartId: string;
	}
> {
	chartRef: React.RefObject<HTMLCanvasElement>;
	chart!: Chart;

	constructor(props: DateChartProps) {
		super(props);
		this.state = {
			data: {
				labels: [this.props.label],
				datasets: [
					{
						label: this.props.label,
						data: [],
					},
				],
			},
			range: {
				startDate: new Date(),
				endDate: addHours(new Date(), 24),
			},
			chartId: props.chartId,
		};
		this.chartRef = React.createRef();
	}

	componentDidMount() {
		const ctx = this.chartRef.current?.getContext("2d");
		if (!ctx) return;

		this.chart = new Chart(ctx, {
			type: this.props.chartType ?? "line",
			data: this.state.data,
			options: {
				scales: {
					xAxes: [
						{
							type: "linear",
							time: {
								unit: "second",
								unitStepSize: this.props.requestInterval / 1000,
							},
						},
					],
					yAxes: [
						{
							type: "linear",
						},
					],
				},
			},
		});
		this.props.getAPI().then((api) => {
			this.updateChart(api as AxiosInstance);
			setInterval(() => {
				this.updateChart(api as AxiosInstance);
			}, this.props.requestInterval);
		});
	}

	/*
	save() {
		localStorage.setItem(
			`chart-${this.state.chartId}`,
			stringify({ data: this.state.data, range: this.state.range })
		);
	}

	load() {
		if (localStorage.getItem(`chart-${this.state.chartId}`)) {
			const parsed = JSON.parse(
				localStorage.getItem(`chart-${this.state.chartId}`) ?? "{}"
			);
			this.setState({
				data: parsed.data,
				range: parsed.range,
			});
		}
	} */

	updateChart(api: AxiosInstance) {
		api.get(this.props.requestUrl)
			.then((r) => {
				const result = r.data as Record<string, unknown>;
				if (result) {
					this.setState((prev) => {
						(prev.data?.datasets ?? [])[0].data = [
							...((prev.data?.datasets ?? [])[0].data as Record<
								string,
								unknown
							>[]),
							{
								x:
									(Date.now() -
										this.state.range.startDate?.getTime()) /
									1000,
								y: (result.cpu as Record<string, unknown>)
									.usage as number,
							},
						];

						return prev;
					});
				}
			})
			.catch((err) => console.error(err));
	}

	handleSelect(start: Date, end: Date) {
		this.setState((prev) => ({
			range: {
				startDate: start ?? prev.range.startDate,
				endDate: end ?? prev.range.endDate,
			},
		}));
		if (
			this.state.data &&
			this.state.data.datasets &&
			this.state.data.datasets[0] &&
			this.chart.data &&
			this.chart.data.datasets &&
			this.chart.data.datasets[0]
		) {
			(((this.chart.data?.datasets ?? [])[0].data = (this.state.data
				?.datasets ?? [])[0].data) as DataPoint[]).filter(
				(d: DataPoint) =>
					isWithin(d.x, {
						start: this.state.range.startDate,
						end: this.state.range.endDate,
					})
			);

			this.chart.update();
		}
	}

	render() {
		return (
			<div>
				<DateRangePicker
					onCallback={this.handleSelect}
					initialSettings={{
						timePicker: true,
						startDate: new Date(),
						endDate: addHours(new Date(), 24),
					}}
				>
					<Button variant="success">Select Date Range</Button>
				</DateRangePicker>
				{this.state.data && <canvas ref={this.chartRef} />}
			</div>
		);
	}
}
