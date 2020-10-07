import * as rfs from "rotating-file-stream";
import * as NodeGit from "nodegit";
import * as fs from "fs";
import { spawn, ChildProcess } from "child_process";
import { RotatingFileStream } from "rotating-file-stream";
import { App } from "./app";
import { promisifyProcess } from "./promisify";

export interface ProcessResult {
    status: boolean;
    error?: Error;
}

export class ProcessManager {
    protected pm: Map<
        string,
        {
            monitor?: ChildProcess;
            app: App;
            logStream?: RotatingFileStream;
            errStream?: RotatingFileStream;
        }
    > = new Map();
    protected baseDir: string;

    constructor(baseDir: string) {
        this.baseDir = baseDir;
    }

    async deployNodeApp(app: App): Promise<ProcessResult> {
        const appPath = `${this.baseDir}/data/${app.name}`;
        const logPath = `${this.baseDir}/logs/${app.name}`;

        try {
            if (!fs.existsSync(appPath)) {
                fs.mkdirSync(appPath);
                await NodeGit.Clone.clone(app.repo.url, appPath, {
                    checkoutBranch: app.repo.branch ?? "master",
                });
            }
            if (this.pm.has(app.name)) this.pm.get(app.name).monitor.kill();

            if (!this.pm.has(app.name)) this.pm.set(app.name, { app });

            const repo = await NodeGit.Repository.open(appPath);
            await repo.fetchAll({});
            await repo.mergeBranches(
                app.repo.branch || "master",
                `origin/${app.repo.branch || "master"}`,
            );
            await promisifyProcess(
                spawn("npm install", {
                    cwd: appPath,
                    shell: true,
                    windowsHide: true,
                }),
            );
        } catch (error) {
            console.error(error);
            return { status: false, error };
        }
        try {
            await promisifyProcess(
                spawn("npm run build", {
                    cwd: appPath,
                    shell: true,
                    windowsHide: true,
                }),
            );
        } catch (err) {
            console.log(`Unable to build app ${app.name}: ${err.message}`);
        }

        // Access log
        this.pm.get(app.name).logStream = rfs.createStream(
            `${logPath}/access.log`,
            {
                size: "10M", // rotate every 10 MegaBytes written
                interval: "1d", // rotate daily
                compress: "gzip", // compress rotated files
            },
        );

        // Error log
        this.pm.get(app.name).errStream = rfs.createStream(
            `${logPath}/error.log`,
            {
                size: "10M", // rotate every 10 MegaBytes written
                interval: "1d", // rotate daily
                compress: "gzip", // compress rotated files
            },
        );

        // Start the app
        try {
            this.pm.get(app.name).monitor = spawn("npm run start", {
                env: { ...process.env, PORT: (app.port || 3005).toString() },
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
