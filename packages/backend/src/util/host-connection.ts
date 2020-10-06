import { Host } from "../cluster/entity/host.entity";

export interface HostContainer {
    host: Host;
    status: string;
    userID?: string;
}

export class HostCreationOptions {
    alias?: string;
    address: string;
    port?: number;
    cluster?: string;
}
