export type MonitorType = "http" | "tcp" | "ping";

export interface Monitor {
    name: string;
    type: MonitorType;
    port?: number;
}
