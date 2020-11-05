import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as fs from "fs";
import yaml from "yaml";

export async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	// Setup app
	const options = new DocumentBuilder()
		.setTitle("Flowtr Panel API")
		.setDescription("Flowtr homelab panel api (self hosted)")
		.setVersion("1.0.0")
		.build();
	const document = SwaggerModule.createDocument(app, options);

	fs.writeFileSync(
		`${process.cwd()}/swagger-spec.yml`,
		yaml.stringify(document, { indent: 4 })
	);

	await app.listen(process.env.PORT ?? 3000);
	return app;
}
