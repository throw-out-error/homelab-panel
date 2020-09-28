import { BaseEntity, Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Host extends BaseEntity<Host, "id"> {
    @PrimaryKey()
    id!: string;

    @Property({ default: "" })
    alias?: string;

    @Property()
    address: string;

    @Property()
    port: number;

    @Property()
    cluster: string;
}
