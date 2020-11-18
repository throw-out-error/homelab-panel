export interface App {
    name: string;
    repo: { url: string; branch?: string };
    env: Record<string, string>;
    ports: number[];
    domain?: string;
}
