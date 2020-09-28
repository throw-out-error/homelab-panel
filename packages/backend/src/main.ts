import "reflect-metadata";
import { config } from "dotenv";
import * as express from "express";
import { ClusterService } from "./services/cluster.service";
import { logger } from "./utils";
import { AnyEntity, MikroORM } from "@mikro-orm/core";
import { Container } from "typedi";

// Configure environment variables
config({ path: `../.env` });

const port = parseInt(process.env.PORT || "8080");

// Start the app
async function bootstrap() {
    const app = express();
    // app.use(pinoHttp());
    const orm = await MikroORM.init({
        type: "mongo",
        dbName: process.env.DB_NAME || "homelab",
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        clientUrl: `mongodb://${process.env.DB_HOST || "localhost"}:${
            process.env.DB_PORT || "27017"
        }?authSource=admin`,
        entities: ["./dist/entity"],
    });

    Container.set("repo", (e: AnyEntity) => orm.em.getRepository(e.name));
    Container.set("cluster-service", new ClusterService());

    const cs = Container.get<ClusterService>("cluster-service");
    app.get("/status", async (req, res) => {
        const subscriber = cs.getOverallStatus().subscribe({
            error: (error) => {
                res.status(500).json({ error });
                subscriber.unsubscribe();
            },
            next: (result) => {
                res.json({ result });
                subscriber.unsubscribe();
            },
        });
    });

    app.listen(port, () => {
        logger.info(`Server running on http://localhost:${port}`);
    });
}

bootstrap();
