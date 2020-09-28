import { Host } from "../entity/host.entity";
import { Monitor } from "@throw-out-error/heartbeat";

export type HostContainer = {
    host: Host;
    status: string;
    userID?: string;
    connection?: HostConnection;
};

export type HostCreationOptions = {
    alias?: string;
    address: string;
    port?: number;
    cluster?: string;
};

export type HostConnection = {
    latestData?: unknown;
    monitors: Record<string, Monitor>;
};
