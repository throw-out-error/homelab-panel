import { AppWrapper, ProcessManager } from "@flowtr/pm";

export const registry: Record<
    string,
    (
        pm: ProcessManager,
        appName: string,
        env: Record<string, string>,
        domain?: string
    ) => Promise<AppWrapper>
> = {
    mediaServer: async (
        pm: ProcessManager,
        appName: string,
        env: Record<string, string>,
        domain?: string
    ) => {
        await pm.deploy({
            name: appName,
            repo: {
                url: "https://github.com/throw-out-error/flowtrpl-apps",
                branch: "media-server"
            },
            ports: [8000, 1935],
            env: env,
            domain
        });
        return pm.get(appName);
    }
};
