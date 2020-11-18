import { program } from "commander";
import { logger } from "./log";
import { listen as runFrontend } from "@flowtr/homelab-client";
import { bootstrap as runBackend } from "@flowtr/homelab-backend";
import { bootstrap as runAgent } from "@flowtr/homelab-agent";
import { initAgent } from "./init-agent";

// These are the types of servers that we are able to run via the cli
export type ModuleType = "agent" | "backend" | "frontend";

async function main() {
	program.name("Flowtr Homelab CLI").version("0.0.1");

	program
		.command("run <server>")
		.description("runs the specified server - choices: [backend, frontend, agent]")
		.action(async (server: ModuleType) => {
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
		});
	program
		.command("init <type>")
		.description("initializes configuration - choices: [backend, frontend, agent]")
		.action(async (type: ModuleType) => {
			switch (type) {
				case "agent":
					await initAgent();
					break;
			}
		});

	await program.parseAsync();
}
main().catch((err) => {
	console.error(err);
	process.exit(1);
});
