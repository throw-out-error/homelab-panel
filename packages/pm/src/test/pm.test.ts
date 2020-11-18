import { ProcessManager } from "../process/process-manager";
import { expect } from "chai";

export const delay = (t: number) =>
	new Promise((resolve) => setTimeout(resolve.bind(null), t));

describe("Joe", function () {
	this.timeout(60000);
	it("App should be deployed", async () => {
		const pm = new ProcessManager(`${__dirname}/deployments`, "registry.toes.tech");
		await pm.deployApp({
			name: "joe",
			port: 3000,
			repo: { url: "https://github.com/adnanrahic/express-docker-app" },
		});
		await delay(20000);
		const status = await pm.getStatus("joe");
		expect(status).to.be.true;
	});
});
