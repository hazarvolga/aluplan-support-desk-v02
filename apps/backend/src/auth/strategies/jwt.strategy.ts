import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { RedisService } from '../../redis/redis.service';

const cookieExtractor = (req: Request): string | null => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['access_token'];
    }
    return token;
};

export type JwtPayload = {
    sub: string;
    email: string;
    fullName: string;
    role: string;
    permissions: string[];
    jti?: string;
    iat?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(config: ConfigService, private readonly redisService: RedisService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                cookieExtractor,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                ExtractJwt.fromUrlQueryParameter('token'),
            ]),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET')!,
        });
    }

    async validate(payload: JwtPayload) {
        if (payload.jti) {
            const isBlacklisted = await this.redisService.get(`jwt:blacklist:${payload.jti}`);
            if (isBlacklisted) throw new UnauthorizedException('Token has been revoked');
        }

        // GAP-07: Admin force logout — invalidate all sessions issued before force_logout_at
        const forceLogoutAt = await this.redisService.get(`user:${payload.sub}:force_logout_at`);
        if (forceLogoutAt && payload.iat && payload.iat * 1000 < Number(forceLogoutAt)) {
            throw new UnauthorizedException('Session has been invalidated by administrator');
        }

        return {
            id: payload.sub,
            sub: payload.sub,
            email: payload.email,
            fullName: payload.fullName,
            role: payload.role,
            permissions: payload.permissions || [],
            jti: payload.jti,
        };
    }
}
