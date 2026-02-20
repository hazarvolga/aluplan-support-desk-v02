import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export type JwtPayload = {
    sub: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions: string[];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET')!,
        });
    }

    async validate(payload: JwtPayload) {
        return {
            id: payload.sub,
            email: payload.email,
            fullName: payload.fullName,
            roles: payload.roles,
            permissions: payload.permissions,
        };
    }
}
