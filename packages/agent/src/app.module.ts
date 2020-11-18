import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import yaml from "yaml";
import fs from "fs";
import { AuthGuard } from "./auth.guard";
import { JwtModule } from "@nestjs/jwt";
import { createConfigDir } from "@flowtr/homelab-common";
import { ProxyModule } from "@ffdc/nestjs-proxy";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [
                () => {
                    const configDir = createConfigDir();
                    return yaml.parse(
                        fs.readFileSync(`${configDir}/agent-config.yml`, {
                            encoding: "utf-8"
                        })
                    );
                }
            ]
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>("jwtSecret"),
                signOptions: { expiresIn: "60s" }
            })
        }),
        ProxyModule.forRootAsync({
            useFactory: (app: AppService) => {
                return {
                    services: app.listApps().map(a => ({
                        id: a.app.name,
                        url: `http://localhost:${a.app.ports[0]}`,
                        config: {
                            forward: a.app.domain
                        }
                    }))
                };
            },
            inject: [AppService]
        })
    ],
    controllers: [AppController],
    providers: [AuthGuard, AppService]
})
export class AppModule {}
