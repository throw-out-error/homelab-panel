import { SystemInfo } from "../types";

export interface ClusterControllerCreateHostBody {
	alias?: string;
	address: string;
	port?: number;
	cluster?: string;
}

export type API = {
	"/cluster/stats": {
		/**
		 * ClusterController_getHostStats
		 */
		get: {
			response: SystemInfo;
		};
	};
};
