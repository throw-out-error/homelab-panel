import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClusterService } from "./cluster.service";
import { Host } from "./entity/host.entity";
import { ClusterController } from "./controller/cluster.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Host])],
    providers: [ClusterService, ClusterController],
    controllers: [ClusterController],
})
export class ClusterModule {}
