import { BadRequestException, Injectable, Param } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import si from "systeminformation";
import {SystemInfo} from "@flowtr/homelab-common"

@Injectable()
export class AppService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	async getDiskUsed(@Param() diskId: number): Promise<number[]> {
		const data = await si.fsSize();
		let res = data.map((d) => d.used / (1024 * 1024 * 1024));
		if (diskId && diskId >= 0) res = [res[diskId]];
		return res;
	}

	login(password: string) {
		const payload = {};
		const result = this.configService.get<string>("password") === password;
		if (!result) throw new BadRequestException("Invalid password.");

		return {
			accessToken: this.jwtService.sign(payload),
		};
	}

	async getSysInfo(): Promise<SystemInfo> {
		const [cpu, mem, os, disks, load] = await Promise.all([
			si.cpu(),
			si.mem(),
			si.osInfo(),
			si.fsSize(),
			si.currentLoad(),
		]);
		return {
			cpu: {
				cores: cpu.cores,
				usage: load.currentload,
			},
			mem: (mem.active / mem.total) * 100,
			hostname: os.hostname,
		};
	}
}
