import {
    Controller,
    Get,
    Query as QueryParam,
    Post,
    Body,
} from "@nestjs/common";
import {
    HttpMonitor,
    Monitor,
    SimplePingMonitor,
    TcpMonitor,
} from "@throw-out-error/heartbeat";
import { ClusterService } from "../cluster.service";
import { HostCreationOptions } from "../../util/host-connection";
import { ApiBody } from "@nestjs/swagger";
import * as rfs from "rotating-file-stream";
import * as NodeGit from "nodegit";
import * as fs from "fs";
import { ApiResult } from "../../util/api-result";
import { logger } from "../../util/utils";
import { spawn, ChildProcess } from "child_process";
import { RotatingFileStream } from "rotating-file-stream";

export interface App {
    name: string;
    repo: { url: string; branch?: string };
    workers?: number;
    port: number;
}

export function promisifyProcesss(child: ChildProcess) {
    return new Promise((resolve, reject) => {
        child.addListener("error", reject);
        child.addListener("exit", resolve);
    });
}

@Controller("cluster")
export class ClusterController {
    pm: Map<
        string,
        {
            monitor?: ChildProcess;
            app: App;
            logStream?: RotatingFileStream;
            errStream?: RotatingFileStream;
        }
    > = new Map();

    constructor(private cluster: ClusterService) {}

    @Post("host/create")
    async createHost(@Body() host: HostCreationOptions) {
        return await this.cluster.create(host);
    }

    @Post("deploy/node")
    @ApiBody({
        type: ApiResult,
    })
    async deploy(@Body() app: App): Promise<ApiResult> {
        const appPath = `../../data/${app.name}`;
        const logPath = `../../logs/${app.name}`;

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
            await promisifyProcesss(
                spawn("npm install", {
                    cwd: appPath,
                    shell: true,
                    windowsHide: true,
                }),
            );
        } catch (error) {
            logger.error(error);
            return { status: false, error };
        }
        try {
            await promisifyProcesss(
                spawn("npm run build", {
                    cwd: appPath,
                    shell: true,
                    windowsHide: true,
                }),
            );
        } catch (err) {
            logger.log(`Unable to build app ${app.name}: ${err.message}`);
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

    @Get("deployments")
    @Get("health")
    status(@QueryParam("cluster") cluster?: string) {
        return new Promise<Record<string, number>>((resolve, reject) => {
            this.cluster
                .findByCluster(cluster ?? "default")
                .then(async (hosts) => {
                    const result: Record<string, number> = {};
                    try {
                        for (const h of hosts) {
                            for (const m of h.monitors) {
                                let data: number;
                                switch (m.type) {
                                    default:
                                        // Ping monitor
                                        data = await new SimplePingMonitor().ping(
                                            {
                                                url: h.address,
                                            },
                                        );
                                        result[h.id.toString()] = data;
                                    case "http":
                                        data = await new HttpMonitor().ping({
                                            url: h.address,
                                            port: m.port,
                                        });
                                        result[h.id.toString()] = data;
                                    case "tcp":
                                        data = await new TcpMonitor().ping({
                                            url: h.address,
                                            port: m.port,
                                        });
                                        result[h.id.toString()] = data;
                                }
                            }
                        }
                    } catch (err) {
                        reject(err);
                    }
                    resolve(result);
                });
        });
    }
}
