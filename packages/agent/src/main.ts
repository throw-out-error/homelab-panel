import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

export async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	// Do agent initialization

	await app.listenAsync(9990);
	return app;
}
