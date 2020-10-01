import "reflect-metadata";
import { config } from "dotenv";
import * as express from "express";
import { ClusterService, stripHostContainer } from "./services/cluster.service";
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
    app.get("/cluster/status", async (req, res) => {
        if (!req.query.cluster) {
            cs.getClusters()
                .then((result) => {
                    res.json({
                        result: result.map(stripHostContainer),
                    });
                })
                .catch((error) => {
                    console.trace(error);
                    return res.status(500).json({ error });
                });
        }
    });

    app.listen(port, () => {
        logger.info(`Server running on http://localhost:${port}`);
    });
}

bootstrap();
