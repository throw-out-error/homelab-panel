import {
	Body,
	Controller,
	Get,
	Post,
	UseGuards,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { AuthGuard } from "./auth.guard";

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

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
