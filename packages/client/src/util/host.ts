export type HostContainer = {
    host: Host;
    status: string;
    userID?: string;
    connection?: HostConnection;
};

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
