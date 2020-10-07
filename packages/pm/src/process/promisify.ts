import { ChildProcess } from "child_process";

export function promisifyProcess(child: ChildProcess) {
    return new Promise((resolve, reject) => {
        child.addListener("error", reject);
        child.addListener("exit", resolve);
    });
}
