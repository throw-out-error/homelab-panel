import { RemoteEventEmitter } from "@throw-out-error/better-events";
import { Host } from "../entity/host.entity";
import { Observable, interval, Subscription } from "rxjs";
import net from "net";
import { map, take, timeout, toArray } from "rxjs/operators";
import Container, { Inject } from "typedi";
import { logger, RepositoryFactory } from "../utils";
import { EntityRepository } from "@mikro-orm/core";
import axios from "axios";
import { HttpError } from "routing-controllers";
import {
    HostContainer,
    HostCreationOptions,
    HostConnection,
} from "../util/host-connection";
import {
    HttpMonitor,
    SimplePingMonitor,
    TcpMonitor,
} from "@throw-out-error/heartbeat";
import { wrapPromiseWithTimeout } from "@throw-out-error/homelab-common";
import { ImprovedError } from "@throw-out-error/throw-out-utils";

export const stripHostContainer = (
    hc: HostContainer,
): { status: string; host: Host } => ({
    status: hc.status,
    host: hc.host,
});

export class ClusterService {
    connections: Record<number, HostContainer> = {};

    repo: EntityRepository<Host>;

    constructor() {
        const factory = Container.get<RepositoryFactory>("repo");
        this.repo = factory(Host);
    }

    async findAll(): Promise<Host[]> {
        return await this.repo.find({});
    }

    async findOne(id: string): Promise<Host> {
        return await this.repo.findOne(id);
    }

    async remove(id: string): Promise<void> {
        this.repo.remove({ id });
    }

    async create(h: HostCreationOptions): Promise<Host> {
        try {
            const host = this.repo.create({
                ...h,
                cluster: h.cluster || "default",
                port: h.port || 3030,
            });
            return host;
        } catch (err) {
            throw new HttpError(500, err);
        }
    }

    createHostConnection(host: Host): Promise<HostContainer> {
        return new Promise((resolve, reject) => {
            const id = `${host.cluster}-${host.id}`;
            try {
                if (this.connections[id]) {
                    this.connections[id].host = host;
                    return resolve(this.connections[id]);
                }

                const pingMonitor = new SimplePingMonitor();
                pingMonitor.setBeatInterval(15000);
                pingMonitor.setBeatTimeout(5000);
                pingMonitor.setOnTimeout(() => {
                    this.connections[id].status = "not ok";
                    reject("Unable to ping this host.");
                });
                pingMonitor.start(
                    { url: host.address },
                    () => {
                        if (this.connections[id].status !== "ok")
                            logger.info(
                                `Established connection to ${
                                    host.alias || host.id
                                }`,
                            );
                        this.connections[id].status = "ok";
                        resolve(this.connections[id]);
                    },
                    () => {
                        this.connections[id].status = "not ok";
                        reject(new Error("Unable to ping this host."));
                    },
                    true,
                );

                const connection: HostConnection = {
                    monitors: {
                        ping: pingMonitor,
                    },
                };

                host.monitors.forEach((m) => {
                    let portMonitor: TcpMonitor | HttpMonitor;
                    switch (m.type) {
                        case "tcp":
                            portMonitor = new TcpMonitor();
                            break;
                        case "http":
                            portMonitor = new HttpMonitor();
                            break;
                        default:
                            portMonitor = new SimplePingMonitor();
                    }
                    portMonitor.setBeatInterval(10000);
                    portMonitor.setBeatTimeout(5000);
                    portMonitor.setOnTimeout(() => {
                        this.connections[id].status = "not ok";
                        reject("Unable to ping this host.");
                    });
                    portMonitor.start(
                        { url: host.address, port: m.port },
                        () => {
                            this.connections[id].status = "ok";
                            this.connections[id].connection.host.monitors[
                                m.service
                            ].status = "ok";
                        },
                        () => {
                            this.connections[id].status = "not ok";
                            this.connections[id].connection.host.monitors[
                                m.service
                            ].status = "not ok";
                        },
                        true,
                    );
                    connection.monitors[m.service] = portMonitor;
                });

                const result: HostContainer = {
                    host: host,
                    connection,
                    // TODO: implement status
                    status: "not ok",
                };

                this.connections[id] = result;
            } catch (err) {
                reject(
                    new Error(
                        `The connection to the host ${
                            host.alias || host.id
                        } failed: ${err}`,
                    ),
                );
            }
        });
    }

    async getClusters(): Promise<HostContainer[]> {
        const hosts = await this.findAll();
        const hcs: HostContainer[] = [];
        for (let h of hosts) {
            hcs.push(
                await wrapPromiseWithTimeout(
                    this.createHostConnection(h),
                    5000,
                    {
                        error: () =>
                            new ImprovedError(
                                `The connection to the host ${
                                    h.alias || h.address
                                } has timed out!`,
                                "timeout",
                            ),
                    },
                ),
            );
        }
        return hcs;
    }

    /*     createHostConnection(host: Host): Observable<HostContainer> {
        return new Observable((subscriber) => {
            const id = `${host.cluster}-${host.id}`;
            try {
                if (this.connections[id])
                    return subscriber.next(this.connections[id]);

                const pingMonitor = new SimplePingMonitor();
                pingMonitor.setBeatInterval(15000);
                pingMonitor.setBeatTimeout(5000);
                pingMonitor.setOnTimeout(() => {
                    this.connections[id].status = "not ok";
                    subscriber.error("Unable to ping this host.");
                });
                pingMonitor.start(
                    { url: host.address },
                    () => {
                        this.connections[id].status = "ok";
                        if (!subscriber.closed) {
                            subscriber.next(this.connections[id]);
                            logger.info(
                                `Established connection to ${
                                    host.alias || host.id
                                }`,
                            );
                        }
                    },
                    () => {
                        this.connections[id].status = "not ok";
                        subscriber.error("Unable to ping this host.");
                    },
                    true,
                );
                const connection: HostConnection = {
                    monitors: {
                        ping: pingMonitor,
                    },
                };
                const result: HostContainer = {
                    host,
                    connection,
                    // TODO: implement status
                    status: "ok",
                };

                this.connections[id] = result;
            } catch (err) {
                subscriber.error(
                    `The connection to the host ${
                        host.alias || host.id
                    } failed: ${err}`,
                );
            }
        });
    }

    getClusters(): Observable<HostContainer> {
        return new Observable<HostContainer>((subscriber) => {
            this.findAll().subscribe({
                next: (hosts) => {
                    for (let h of hosts) {
                        this.createHostConnection(h).subscribe({
                            next: (value) => subscriber.next(value),
                            error: (err) => subscriber.error(err),
                        });
                    }
                },
                error: (err) => subscriber.error(err),
            });
        });
    } */
}
