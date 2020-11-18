import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as fs from "fs";
import express from "express";
export async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // Setup app
    const options = new DocumentBuilder()
        .setTitle("Flowtr Panel API")
        .setDescription("Flowtr homelab panel api (self hosted)")
        .setVersion("1.0.0")
        .build();
    const document = SwaggerModule.createDocument(app, options);

    app.enableCors();

    await app.listen(process.env.PORT ?? 3000);
    return app;
}
