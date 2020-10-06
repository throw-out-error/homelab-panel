import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./auth/user.entity";
import { ClusterModule } from "./cluster/cluster.module";
import { Host } from "./cluster/entity/host.entity";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "mongodb",
            name: "default",
            entities: [User, Host],
            synchronize: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            url: process.env.DB_URI || "mongodb://localhost/website",
        }),
        AuthModule,
        ClusterModule,
    ],
    controllers: [],
    providers: [AppService],
})
export class AppModule {}
