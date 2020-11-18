import fs from "fs";

/**
 * Creates the configuration folder if it doesn't exist. Then it returns the path to it.
 */
export const createConfigDir = () => {
	if (!fs.existsSync(`${process.cwd()}/config`))
		fs.mkdirSync(`${process.cwd()}/config`);
	return `${process.cwd()}/config`;
};
