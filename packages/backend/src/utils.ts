import {
    AnyEntity,
    BaseEntity,
    EntityName,
    EntityRepository,
} from "@mikro-orm/core";
import { createLogger } from "winston";
import * as winston from "winston";

export const logger = createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            ),
        }),
    ],
});

export type RepositoryFactory = <T>(e: AnyEntity) => EntityRepository<T>;
export const nameOf = (t: any) => t.name;

export const getFormattedDate = () => {
    return new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
};

export const nanoToMilliseconds = (nanoseconds: number) =>
    Math.floor(nanoseconds / 1e6);

export const nanoToSeconds = (nanoseconds: number) =>
    Math.floor(nanoseconds / 1e9);

export type MonitorType = "tcp" | "http";
