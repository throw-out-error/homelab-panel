import { logger } from "./log";
import yaml from "yaml";
import fs from "fs";
import cryptoRandomString from "crypto-random-string";

export const initAgent = async () => {
	logger.info("Initializing agent configuration...");
	const password = cryptoRandomString({
		length: 20,
	});
	logger.info(
		`Here is your admin password for this agent. Please do not share it with anyone you don't trust: ${password}`,
	);
	fs.writeFileSync(
		`${process.cwd()}/agent-config.yml`,
		yaml.stringify(
			{
				password,
				jwtSecret: cryptoRandomString({
					length: 20,
				}),
			},
			{ indent: 4 },
		),
		{
			encoding: "utf-8",
		},
	);
};
