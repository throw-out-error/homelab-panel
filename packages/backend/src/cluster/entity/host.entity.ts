import { Entity, Column, ObjectID, ObjectIdColumn } from "typeorm";
import { Monitor } from "../../util/monitor";

@Entity()
export class Host {
    @ObjectIdColumn()
    id: ObjectID;

    @Column({ default: "" })
    alias?: string;

    @Column()
    address: string;

    @Column()
    monitors: Monitor[];

    @Column()
    cluster: string;
}
