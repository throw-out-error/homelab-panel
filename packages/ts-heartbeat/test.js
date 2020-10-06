const { SimplePingMonitor } = require("./dist");

async function main() {
    const m = new SimplePingMonitor();
    const result = await m.ping({ url: "127.0.0.1" });
    console.log(result);
}
main();
