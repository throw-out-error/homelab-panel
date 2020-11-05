import yargs from "yargs";
import { logger } from "./log";
import { listen } from "@flowtr/homelab-client";
import { bootstrap as runBackend } from "@flowtr/homelab-backend";
import { bootstrap as runAgent } from "@flowtr/homelab-agent";
import { initAgent } from "./init-agent";

async function main() {
  yargs.scriptName("Flowtr Homelab CLI").version("0.0.1");

  yargs.command("run <server>", "runs the specified server", (yargs) => {
    yargs.positional("server", {
      describe: "The server to run",
      choices: ["agent", "backend", "frontend"],
    });
  });

  yargs.command("init <type>", "initializes configuration", (yargs) => {
    yargs.positional("type", {
      describe: "The module to initialize",
      choices: ["agent"],
    });
  });

  const { server, type } = yargs.parse();
  if (server) {
    switch (server) {
      case "backend":
        await runBackend();
        break;
      case "agent":
        await runAgent();
        break;
      case "frontend":
        await runFrontend();
    }
  } else if (type) {
    await initAgent();
  }
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
