export interface SystemInfo {
    cpu: {
        cores: number;
        usage: number;
    };
    mem: number;
    hostname: string;
}
