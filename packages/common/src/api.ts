// import { TypedAxiosInstance } from "@toes/api";
// import axios from "axios-observable";
import { API } from "./typings/openapi";
import axios, { AxiosRequestConfig } from "axios";

export interface ApiResponse<T> {
	data: T;
	status: number;
	statusText: string;
	headers: unknown;
	config: AxiosRequestConfig;
	request?: unknown;
}

export interface ApiClient {
	request<T = unknown, R = ApiResponse<T>>(
		config: AxiosRequestConfig
	): Promise<R>;
	get<T = unknown, R = ApiResponse<T>>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<R>;
	delete<T = unknown, R = ApiResponse<T>>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<R>;
	post<T = unknown, R = ApiResponse<T>>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig
	): Promise<R>;
	put<T = unknown, R = ApiResponse<T>>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig
	): Promise<R>;
	patch<T = unknown, R = ApiResponse<T>>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig
	): Promise<R>;
}

export const getAPI = async (opts: AxiosRequestConfig): Promise<ApiClient> => {
	const api = axios.create(opts);
	return api;
};
