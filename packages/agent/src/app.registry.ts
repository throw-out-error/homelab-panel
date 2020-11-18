import { ProcessManager } from "@flowtr/pm";

export const mediaServer = async (
    pm: ProcessManager,
    env: { ADMIN_PASS: string }
) => {
    await pm.deploy({
        name: "media",
        repo: { url: "https://github.com/throw-out-error/flowtrpl-apps", branch: "media-server" },
        ports: [8000, 1935],
        env: env
    });
    return pm.get("media");
};
