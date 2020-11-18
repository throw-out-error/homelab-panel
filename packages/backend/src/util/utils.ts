import { PrefixLogger } from "@toes/core";

export const logger = PrefixLogger.with({ prefix: "Main" });

export const nameOf = (t: any) => t.name;

export const getFormattedDate = () => {
	return new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
};

export const nanoToMilliseconds = (nanoseconds: number) =>
	Math.floor(nanoseconds / 1e6);

export const nanoToSeconds = (nanoseconds: number) =>
	Math.floor(nanoseconds / 1e9);

export type MonitorType = "tcp" | "http";
