import * as rfs from "rotating-file-stream";
import NodeGit from "nodegit";
import * as fs from "fs";
import shell from "shelljs";
import { RotatingFileStream } from "rotating-file-stream";
import { App } from "./app";
import { spawn, ChildProcess } from "child_process";
import { promisifyProcess } from "./promisify";

export interface ProcessResult {
    status: boolean;
    error?: Error;
}

export interface AppWrapper {
    app: App;
    path: string;
    monitor?: ChildProcess;
    logStream?: RotatingFileStream;
    errStream?: RotatingFileStream;
}

export interface IProcessManager {
    stop(app?: string): void;
    deploy(app: App): Promise<ProcessResult>;
    get(app: string): AppWrapper;
    list(): AppWrapper[];
}

const stop = (app: AppWrapper) => {
    if (app)
        shell.exec("docker-compose stop && docker-compose down", {
            cwd: app.path,
        });
};

const start = (app: AppWrapper) => {
    if (app)
        shell.exec("docker-compose up -d && docker-compose restart", {
            cwd: app.path,
        });
};

export class ProcessManager implements IProcessManager {
    protected pm: Map<string, AppWrapper> = new Map();
    protected baseDir: string;

    constructor(baseDir: string) {
        this.baseDir = baseDir;
        process.on("beforeExit", () => {
            this.stop();
        });
    }

    list(): AppWrapper[] {
        return Array.from(this.pm.values());
    }

    async stop(app?: string) {
        if (app) stop(this.pm.get(app));
        this.pm.forEach((value) => {
            stop(value);
        });
    }

    get(app: string) {
        return this.pm.get(app);
    }

    async deploy(app: App): Promise<ProcessResult> {
        const appPath = `${this.baseDir}/apps/${app.name}`;
        const logPath = `${this.baseDir}/logs/${app.name}`;

        if (!fs.existsSync(logPath)) fs.mkdirSync(logPath, { recursive: true });

        // Access log
        this.pm.get(app.name).logStream = rfs.createStream(
            `${logPath}/access.log`,
            {
                size: "10M", // rotate every 10 MegaBytes written
                interval: "1d", // rotate daily
                compress: "gzip", // compress rotated files
            }
        );

        // Error log
        this.pm.get(app.name).errStream = rfs.createStream(
            `${logPath}/error.log`,
            {
                size: "10M", // rotate every 10 MegaBytes written
                interval: "1d", // rotate daily
                compress: "gzip", // compress rotated files
            }
        );

        try {
            if (!fs.existsSync(appPath)) {
                await NodeGit.Clone.clone(app.repo.url, appPath, {
                    checkoutBranch: app.repo.branch ?? "master",
                });
            }

            this.stop(app.name);

            if (!this.pm.has(app.name))
                this.pm.set(app.name, { app, path: appPath });

            const repo = await NodeGit.Repository.open(appPath);
            await repo.fetchAll({});
            await repo.mergeBranches(
                app.repo.branch ?? "master",
                `origin/${app.repo.branch ?? "master"}`
            );
        } catch (error) {
            this.pm.get(app.name).errStream.write(error);
            return { status: false, error };
        }
        try {
            shell.exec("docker-compose build", {
                cwd: appPath,
            });
        } catch (err) {
            this.pm
                .get(app.name)
                .errStream.write(
                    `Unable to build app ${app.name}: ${err.message}`
                );
        }

        // Start the app
        try {
            this.pm.get(app.name).monitor = spawn("docker-compose up", {
                env: {
                    ...process.env,
                    ...app.env,
                },
                cwd: appPath,
                shell: true,
                windowsHide: true,
                stdio: "pipe",
            });
            this.pm
                .get(app.name)
                .monitor.stdout.pipe(this.pm.get(app.name).logStream);

            this.pm
                .get(app.name)
                .monitor.stderr.pipe(this.pm.get(app.name).errStream);
        } catch (err) {
            this.pm.get(app.name).errStream.write(err.toString());
        }
        return {
            status: !this.pm.get(app.name).monitor.killed,
        };
    }
}
