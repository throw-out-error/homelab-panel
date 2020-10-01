/**
 * Wraps a promise in a timeout, allowing the promise to reject if not resolved with a specific period of time.
 *
 * @example
 * wrapPromiseWithTimeout(1000, fetch('https://courseof.life/johndoherty.json'))
 *   .then((cvData) => {
 *     alert(cvData);
 *   })
 *   .catch(() => {
 *     alert('request either failed or timedout');
 *   });
 */
export function wrapPromiseWithTimeout<T>(
    promise: Promise<T>,
    time: number,
    {
        error = () => new Error("promise timeout"),
        onTimeout,
    }: {
        error?(): Error;
        onTimeout?(): void;
    } = {},
) {
    return new Promise<T>((resolve, reject) => {
        setTimeout(() => {
            if (onTimeout) {
                onTimeout();
            }

            reject(error());
        }, time);

        promise
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
}
