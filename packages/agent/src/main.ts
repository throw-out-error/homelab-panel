import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

export async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService: ConfigService = app.get(ConfigService);
	// Do agent initialization



	await app.listenAsync(configService.get<number>("port"));
	return app;
}
