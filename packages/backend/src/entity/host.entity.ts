import { BaseEntity, Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { MonitorType } from "../utils";

@Entity()
export class Host extends BaseEntity<Host, "id"> {
    @PrimaryKey()
    id!: string;

    @Property({ default: "" })
    alias?: string;

    @Property()
    address: string;

    @Property()
    monitors: [{ port?: number; service: string; type: MonitorType }];

    @Property()
    cluster: string;
}
