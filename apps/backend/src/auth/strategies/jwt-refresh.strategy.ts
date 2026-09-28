import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

const cookieExtractor = (req: Request): string | null => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['alu_rt'];
    }
    return token;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                cookieExtractor,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_REFRESH_SECRET')!,
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: any) {
        let refreshToken = null;
        if (req && req.cookies && req.cookies['alu_rt']) {
            refreshToken = req.cookies['alu_rt'];
        } else {
            const authHeader = req.get('Authorization');
            refreshToken = authHeader?.replace('Bearer ', '').trim();
        }
        return { ...payload, sessionVersion: payload.sessionVersion ?? 0, refreshToken };
    }
}
