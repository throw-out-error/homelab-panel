import { Host } from "./entity/host.entity";
import { HostContainer, HostCreationOptions } from "../util/host-connection";
import { wrapPromiseWithTimeout } from "@throw-out-error/homelab-common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { CodeError } from "@throw-out-error/throw-out-utils";

export const stripHostContainer = (
    hc: HostContainer,
): { status: string; host: Host } => ({
    status: hc.status,
    host: hc.host,
});

export class ClusterService {
    connections: Record<number, HostContainer> = {};

    constructor(
        @InjectRepository(Host)
        private hostRepository: Repository<Host>,
    ) {}

    async findAll(): Promise<Host[]> {
        return await this.hostRepository.find({});
    }

    async findByCluster(cluster: string): Promise<Host[]> {
        return await this.hostRepository.find({ cluster });
    }

    async findOne(id: string): Promise<Host> {
        return await this.hostRepository.findOne(id);
    }

    async remove(id: string): Promise<DeleteResult> {
        return await this.hostRepository.delete({ id });
    }

    async create(h: HostCreationOptions): Promise<Host> {
        try {
            await this.hostRepository.insert({
                ...h,
                cluster: h.cluster || "default",
                monitors: [
                    {
                        name: "ping",
                        type: "ping",
                    },
                ],
            });
            const host = this.hostRepository.findOne({
                cluster: h.cluster || "default",
            });
            return host;
        } catch (err) {
            throw new CodeError("500", err);
        }
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
