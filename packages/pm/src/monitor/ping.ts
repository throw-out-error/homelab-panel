import { Monitor } from "./monitor";
import { ConnectionOptions } from "../util";
import ping from "pingman";

export class SimplePingMonitor extends Monitor {
    /**
     * @public
     * @function ping
     * @param url The destination url, e.g. www.google.com
     * @param port Optional: The port of the destination url
     * @returns A promise that returns the round trip time in milliseconds. Returns -1 if an error occurred.
     */
    public ping(opts: ConnectionOptions): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            ping(opts.url === "localhost" ? "127.0.0.1" : opts.url)
                .then((response) => {
                    resolve(response.time);
                })
                .catch((err) => reject(err));
        });
    }
}
