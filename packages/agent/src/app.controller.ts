import { ProcessManager } from "@flowtr/pm";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { mediaServer } from "./app.registry";
import { AppService } from "./app.service";
import { AuthGuard } from "./auth.guard";

@Controller()
export class AppController {
    pm: ProcessManager;

    constructor(private readonly appService: AppService) {
        this.pm = new ProcessManager(`${process.cwd()}/pm`);
    }

    @Post("app/start")
    async start() {
        return (await mediaServer(this.pm, { ADMIN_PASS: "1234" })).app;
    }

    @Get("app/stop")
    async stop(@Query() app: string) {
        return this.pm.stop(app);
    }

    @Get("app/list")
    async listApps() {
        return this.pm.list().map(a => a.app);
    }

    @Post("auth")
    auth(@Body() { password }: { password: string }): { accessToken?: string } {
        return { accessToken: this.appService.login(password).accessToken };
    }

    @Get("stats")
    @UseGuards(AuthGuard)
    async getStats() {
        return this.appService.getSysInfo();
    }
}
