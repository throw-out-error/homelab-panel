import { ConnectionOptions } from "../util";

export abstract class Monitor {
    protected DEFAULT_TIMEOUT: number = 5000;
    protected DEFAULT_INTERVAL: number = 3000;

    protected lastHeartbeatTime: number;
    protected timer: NodeJS.Timer | undefined;
    protected timeoutTimer: NodeJS.Timer | undefined;
    protected timeoutFn = () => {
        // User defined
    };

    protected interval: number = this.DEFAULT_INTERVAL;
    protected timeout: number = this.DEFAULT_TIMEOUT;

    /**
     * @public
     * @function getBeatInterval
     * @description Returns the current heartbeat interval
     */
    getBeatInterval(): number {
        return this.interval;
    }

    /**
     * @public
     * @function setBeatInterval
     * @param number newInterval The new interval period
     * @description Sets the current heartbeat interval to the given one
     */
    setBeatInterval(newInterval: number): void {
        this.interval = newInterval;
    }

    /**
     * @public
     * @function getBeatTimeout
     * @description Returns the current heartbeat timeout period
     */
    getBeatTimeout(): number {
        return this.timeout;
    }

    /**
     * @public
     * @function setBeatTimeout
     * @param number newTimeout The new timeout period
     * @description Sets the current timeout to the given one.
     * Setting the timeout this way will immediately affect the <code>hasTimedOut</code> method without the need to restart the heartbeat object.
     * Invoking this method <b>does</b> restart the timer controlling the <code>onTimeout</code> event.
     */
    setBeatTimeout(newTimeout: number): void {
        this.timeout = newTimeout;
        if (this.timeoutTimer !== undefined) {
            clearTimeout(this.timeoutTimer);
        }
        this.timeoutTimer = setTimeout(this.timeoutFn, this.timeout);
    }

    /**
     * @public
     * @function hasTimedOut
     * @description Used to detected if a heartbeat has timed out
     */
    hasTimedOut(): boolean {
        return Date.now() - this.lastHeartbeatTime > this.timeout;
    }

    /**
     * @public
     * @function setOnTimeout
     * @param function fn The function to be executed when a timeout occurs.
     * @description Runs the given function when the heartbeat detects a timeout.
     */
    setOnTimeout(fn: () => void): void {
        this.timeoutFn = fn;
    }

    /**
     * @public
     * @function isBeating
     * @returns boolean <code>true</code> if the heartbeat is active, <code>false</code> otherwise
     * @description Returns <code>true</code> if the heartbeat is active, <code>false</code> otherwise.
     * A heartbeat is considered active if it was started and has not been stopped yet.
     */
    isBeating(): boolean {
        return this.timer !== undefined;
    }

    /**
     * @public
     * @function stop
     * @description Stops the heartbeat object and clears all internal states
     */
    stop(): void {
        this.lastHeartbeatTime = -1;
        if (this.timer !== undefined) {
            clearInterval(this.timer);
        }
        this.timer = undefined;
        if (this.timeoutTimer !== undefined) {
            clearTimeout(this.timeoutTimer);
        }
        this.timeoutTimer = undefined;
    }

    /**
     * @public
     * @function start
     * @param url The destination url, e.g. www.google.com
     * @param port Optional: The port of the destination url
     * @param function successFn The function to be executed on a successful ping
     * @param function failedFn The function to be executed on a failed ping
     * @description Starts the heartbeat object, executing the a ping function at the defined interval
     */
    start(
        conn: ConnectionOptions,
        successFn: (time: number) => void,
        failedFn: () => void,
        initial = false,
    ): void {
        this.lastHeartbeatTime = Date.now();
        if (initial) this.ping(conn).then(successFn).catch(failedFn);
        this.timer = setInterval(() => {
            this.timeoutTimer = setTimeout(this.timeoutFn, this.timeout);
            this.ping(conn).then(successFn).catch(failedFn);
        }, this.interval);
    }

    /**
     * @public
     * @function reset
     * @description Stops the heartbeat if it is beating, and resets all properties to the original default values.
     */
    reset(): void {
        this.stop();
        this.interval = this.DEFAULT_INTERVAL;
        this.timeout = this.DEFAULT_TIMEOUT;
        this.timeoutFn = () => {
            // Reset timeout function
        };
    }

    abstract ping(opts: ConnectionOptions): Promise<number>;
}
