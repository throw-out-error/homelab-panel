import {
	Controller,
	Get,
	Query as QueryParam,
	Post,
	Body,
	InternalServerErrorException,
} from "@nestjs/common";
import axios from "axios";
import { ClusterService } from "../cluster.service";
import { HostCreationOptions } from "../../util/host-connection";
import { ApiBody } from "@nestjs/swagger";
import { Observable } from "rxjs";
import { catchError, first } from "rxjs/operators";
import { ApiResult } from "../../util/api-result";
import { logger } from "../../util/utils";
import { ObjectID } from "mongodb";

@Controller("cluster")
export class ClusterController {
	constructor(private cluster: ClusterService) {}

	@Post("host/create")
	async createHost(@Body() host: HostCreationOptions) {
		return await this.cluster.create(host);
	}

	/*     @Post("deploy/node")
    @ApiBody({
        type: ApiResult,
    })
    async deploy(@Body() app: App): Promise<ApiResult> {
        return this.pm.deployNodeApp(app);
    } */

	@Get("clusters")
	async getHosts() {
		return this.cluster.findAll();
	}

	@Get("stats")
	getHostStats(
		@QueryParam("host") host: string,
		@QueryParam("cluster") cluster?: string
	): Observable<unknown> {
		return new Observable((observer) => {
			this.cluster.findByCluster(cluster ?? "default").then((hs) => {
				const h = hs.find(
					(h) => h.address === host || host === h.id.toString()
				);
				if (!h) return observer.error(`Could not find host ${host}`);
				axios
					.post(`http://${h.address}:9990/auth`, {
						password: h.accessToken,
					})
					.then((res) => {
						if (!res.data.accessToken)
							return observer.error(
								`Invalid access token for ${h.address}`
							);
						axios
							.get(`http://${h.address}:9990/stats`, {
								headers: {
									Authorization: res.data.accessToken,
								},
							})
							.then(({ data }) => observer.next(data))
							.catch((err) => observer.error(err));
					})
					.catch((err) => observer.error(err));
			});
		}).pipe(
			catchError((err: Error) => {
				throw new InternalServerErrorException(err.toString());
			}),
			first()
		);
	}
	/*
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
                                            }
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
    } */
}
