import http from "http";
import https from "https";
import { ConnectionOptions } from "../util";
import { Monitor } from "./monitor";

export class HttpMonitor extends Monitor {
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
            const useHttps = opts.url.indexOf("https") === 0;
            const mod = useHttps ? https.request : http.request;
            const outPort = opts.port || (useHttps ? 443 : 80);
            const baseUrl = opts.url
                .replace("http://", "")
                .replace("https://", "");

            const options = { host: baseUrl, port: outPort, path: "/" };
            const startTime = Date.now();

            const pingRequest = mod(options, () => {
                this.lastHeartbeatTime = Date.now();
                if (this.timeoutTimer !== undefined) {
                    clearTimeout(this.timeoutTimer);
                }
                resolve(Date.now() - startTime);
                pingRequest.abort();
            });

            pingRequest.on("error", () => {
                if (this.timeoutTimer !== undefined) {
                    clearTimeout(this.timeoutTimer);
                }
                reject(-1);
                pingRequest.abort();
            });

            pingRequest.write("");
            pingRequest.end();
        });
    }
}
