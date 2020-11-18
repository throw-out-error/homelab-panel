export interface App {
    name: string;
    repo: { url: string; branch?: string };
    env: Record<string, unknown>;
    ports: number[];
}
