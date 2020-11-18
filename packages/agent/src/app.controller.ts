import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { AuthGuard } from "./auth.guard";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post("app/start")
    async start(
        @Query() type: string,
        @Query() app: string,
        @Query() domain?: string,
        @Body() env?: Record<string, string>
    ) {
        return this.appService.startApp(type, app, env ?? {}, domain);
    }

    @Get("app/stop")
    async stop(@Query() app: string) {
        return this.appService.stop(app);
    }

    @Get("app/list")
    async listApps() {
        return this.appService.listApps().map(a => a.app);
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
