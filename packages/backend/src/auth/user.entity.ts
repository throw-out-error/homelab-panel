import { Entity, Column, ObjectID, ObjectIdColumn } from "typeorm";

@Entity()
export class User {
    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    name: string;

    @Column()
    username: string;

    @Column()
    password: string;
}

export type AuthCredentials = {
    username: string;
    password: string;
};
