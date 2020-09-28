import { RemoteEventEmitter } from "@throw-out-error/better-events";
import { Host } from "../entity/host.entity";
import { Observable, interval, Subscription } from "rxjs";
import net from "net";
import { map, timeout } from "rxjs/operators";
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
import { SimplePingMonitor } from "@throw-out-error/heartbeat";

export class ClusterService {
    connections: Record<number, HostContainer> = {};

    repo: EntityRepository<Host>;

    constructor() {
        const factory = Container.get<RepositoryFactory>("repo");
        this.repo = factory(Host);
    }

    findAll(): Observable<Host[]> {
        return new Observable((subscriber) => {
            this.repo
                .find({})
                .then((data) => subscriber.next(data))
                .catch((err) => subscriber.error(err));
        });
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

    createHostConnection(host: Host): Observable<HostContainer> {
        return new Observable((subscriber) => {
            const id = `${host.cluster}-${host.id}`;
            try {
                if (this.connections[id])
                    return subscriber.next(this.connections[id]);

                const pingMonitor = new SimplePingMonitor();
                pingMonitor.setBeatInterval(15000);
                pingMonitor.start(
                    { url: host.address },
                    () => {
                        logger.info(
                            `Established connection to ${
                                host.alias || host.id
                            }`,
                        );
                        this.connections[id].status = "ok";
                        if (!subscriber.closed)
                            subscriber.next(this.connections[id]);
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

    getHostStatus(h: Host): Observable<HostContainer> {
        return this.createHostConnection(h);
    }

    getOverallStatus(): Observable<{ status: string }> {
        return new Observable((subscriber) => {
            this.findAll().subscribe({
                next: (hosts) => {
                    for (let h of hosts) {
                        this.getHostStatus(h)
                            .pipe(
                                map((v) => ({
                                    status: v.status,
                                })),
                            )
                            .pipe(timeout(15000))
                            .subscribe({
                                next: (value) => subscriber.next(value),
                                error: (err) => subscriber.error(err),
                            });
                    }
                },
                error: (err) => subscriber.error(err),
            });
        });
    }
}
