import { BadRequestException, Injectable, Param } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import si from "systeminformation";
import { SystemInfo } from "@flowtr/homelab-common";
import { App, AppWrapper, ProcessManager } from "@flowtr/pm";
import { registry } from "./app.registry";

@Injectable()
export class AppService {
    protected pm: ProcessManager;
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {
        this.pm = new ProcessManager(`${process.cwd()}/pm`);
    }

    async startApp(
        type: string,
        name: string,
        env: Record<string, string>,
        domain?: string
    ): Promise<App> {
        return (await registry[type](this.pm, name, env, domain)).app;
    }

    listApps(): AppWrapper[] {
        return this.pm.list();
    }

    stop(app?: string) {
        return this.pm.stop(app);
    }

    async getDiskUsed(@Param() diskId: number): Promise<number[]> {
        const data = await si.fsSize();
        let res = data.map(d => d.used / (1024 * 1024 * 1024));
        if (diskId && diskId >= 0) res = [res[diskId]];
        return res;
    }

    login(password: string) {
        const payload = {};
        const result = this.configService.get<string>("password") === password;
        if (!result) throw new BadRequestException("Invalid password.");

        return {
            accessToken: this.jwtService.sign(payload)
        };
    }

    async getSysInfo(): Promise<SystemInfo> {
        const [cpu, mem, os, disks, load] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.osInfo(),
            si.fsSize(),
            si.currentLoad()
        ]);
        return {
            cpu: {
                cores: cpu.cores,
                usage: load.currentload
            },
            mem: (mem.active / mem.total) * 100,
            hostname: os.hostname
        };
    }
}
