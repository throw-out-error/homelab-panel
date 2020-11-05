import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const verified = this.jwtService.verify(request.headers.authorization);
		return (
			request.headers.authorization &&
			verified !== undefined &&
			verified !== null
		);
	}
}
