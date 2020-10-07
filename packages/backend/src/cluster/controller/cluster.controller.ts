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
    App,
    ProcessManager,
} from "@throw-out-error/pm";
import { ClusterService } from "../cluster.service";
import { HostCreationOptions } from "../../util/host-connection";
import { ApiBody } from "@nestjs/swagger";

import { ApiResult } from "../../util/api-result";
import { logger } from "../../util/utils";

@Controller("cluster")
export class ClusterController {
    pm: ProcessManager = new ProcessManager("../../");

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
        return this.pm.deployNodeApp(app);
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
