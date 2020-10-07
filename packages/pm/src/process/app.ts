export interface App {
    name: string;
    repo: { url: string; branch?: string };
    workers?: number;
    port: number;
}
