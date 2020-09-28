import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class User {
    @PrimaryKey()
    id!: string;

    @Property()
    email: string;

    @Property()
    name: string;
}
