import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizeSessionRole, resolveSessionAuthority } from '../session-authority';

const cookieExtractor = (req: Request): string | null => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['alu_at'];
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
    exp?: number;
    sessionIssuedAt?: number;
    sessionVersion?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        config: ConfigService,
        private readonly redisService: RedisService,
        private readonly prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                cookieExtractor,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET')!,
        });
    }

    async validate(payload: JwtPayload) {
        if (!payload || typeof payload.sub !== 'string' || !payload.sub.trim()
            || typeof payload.role !== 'string' || !payload.role.trim()
            || !Number.isFinite(payload.exp) || payload.exp! * 1000 <= Date.now()) {
            throw new UnauthorizedException('Session is no longer valid');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                status: true, deletedAt: true, sessionVersion: true,
                role: { select: {
                    name: true,
                    permissions: { select: { permission: { select: { name: true } } } },
                } },
            },
        });
        if (
            !user
            || user.status !== 'ACTIVE'
            || user.deletedAt
            || user.sessionVersion !== (payload.sessionVersion ?? 0)
        ) {
            throw new UnauthorizedException('Session is no longer valid');
        }
        const authority = resolveSessionAuthority(user.role);
        if (!authority || normalizeSessionRole(authority.role) !== normalizeSessionRole(payload.role)) {
            throw new UnauthorizedException('Session authority has changed');
        }

        if (payload.jti) {
            const isBlacklisted = await this.redisService.get(`jwt:blacklist:${payload.jti}`);
            if (isBlacklisted) throw new UnauthorizedException('Token has been revoked');
        }

        // GAP-07: Admin force logout — invalidate all sessions issued before force_logout_at
        const forceLogoutAt = await this.redisService.get(`user:${payload.sub}:force_logout_at`);
        const issuedAtMs = payload.sessionIssuedAt ?? (payload.iat ? payload.iat * 1000 : undefined);
        if (forceLogoutAt && (!Number.isFinite(issuedAtMs) || !Number.isFinite(Number(forceLogoutAt))
            || issuedAtMs! <= Number(forceLogoutAt))) {
            throw new UnauthorizedException('Session has been invalidated by administrator');
        }

        return {
            id: payload.sub,
            sub: payload.sub,
            email: payload.email,
            fullName: payload.fullName,
            role: authority.role,
            permissions: authority.permissions,
            jti: payload.jti,
            exp: payload.exp,
        };
    }
}
