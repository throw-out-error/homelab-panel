import { Monitor } from "./monitor";
import * as net from "net";
import { ConnectionOptions } from "../util";

export class TcpMonitor extends Monitor {
    constructor() {
        // Empty constructor
        super();
    }

    /**
     * @public
     * @function ping
     * @param url The destination url, e.g. www.google.com
     * @param port Optional: The port of the destination url
     * @returns A promise that returns the round trip time in milliseconds. Returns -1 if an error occurred.
     */
    public ping(opts: ConnectionOptions): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const outPort = opts.port || 80;

            const options: net.NetConnectOpts = {
                host: opts.url,
                port: outPort,
            };
            const startTime = Date.now();

            const pingRequest = net.createConnection(options);

            pingRequest.on("connect", () => {
                this.lastHeartbeatTime = Date.now();
                if (this.timeoutTimer !== undefined) {
                    clearTimeout(this.timeoutTimer);
                }
                resolve(Date.now() - startTime);
                pingRequest.end();
            });

            pingRequest.on("error", () => {
                if (this.timeoutTimer !== undefined) {
                    clearTimeout(this.timeoutTimer);
                }
                resolve(-1);
                pingRequest.end();
            });

            pingRequest.end();
        });
    }
}
