import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request, Query, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { Public } from './decorators/public.decorator';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../rbac/decorators/rbac.decorators';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { getLoginThrottleLimit } from './auth-throttle';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly config: ConfigService,
    ) { }

    @Public()
    @Post('login')
    @Throttle({ default: { limit: getLoginThrottleLimit(process.env.NODE_ENV), ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, description: 'Login successful. Sets HttpOnly cookies and returns non-secret user data.' })
    @ApiResponse({ status: 401, description: 'Invalid credentials.' })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.login(dto);

        const isProd = this.config.get('NODE_ENV') === 'production';
        const markerCookieDomain = isProd ? '.allplan.net.tr' : undefined;
        const persistentCookie = this.getPersistentCookieOptions(
            dto.rememberMe === true,
            tokens.remember_me_expires_at,
        );

        this.clearLegacyDomainAuthCookies(res, isProd);
        res.cookie('alu_at', tokens.access_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
        });

        res.cookie('alu_rt', tokens.refresh_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/api/v1/auth/refresh',
            ...persistentCookie,
        });
        res.cookie('alu_session', tokens.session_marker, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            ...(markerCookieDomain ? { domain: markerCookieDomain } : {}),
            ...persistentCookie,
        });

        return { user: tokens.user };
    }

    @Public()
    @UseGuards(RefreshGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'HttpOnly authentication cookies refreshed successfully.' })
    @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
    async refresh(@Request() req: any, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.refreshTokens(
            req.user.sub,
            req.user.refreshToken,
            req.user.sessionVersion ?? 0,
            req.user.rememberMe === true,
            req.user.rememberMeExpiresAt,
        );

        const isProd = this.config.get('NODE_ENV') === 'production';
        const markerCookieDomain = isProd ? '.allplan.net.tr' : undefined;
        const persistentCookie = this.getPersistentCookieOptions(
            req.user.rememberMe === true,
            tokens.remember_me_expires_at,
        );

        this.clearLegacyDomainAuthCookies(res, isProd);
        res.cookie('alu_at', tokens.access_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
        });

        res.cookie('alu_rt', tokens.refresh_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/api/v1/auth/refresh',
            ...persistentCookie,
        });
        res.cookie('alu_session', tokens.session_marker, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            ...(markerCookieDomain ? { domain: markerCookieDomain } : {}),
            ...persistentCookie,
        });

        return { success: true };
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout' })
    @ApiResponse({ status: 204, description: 'Logout successful. Cookies cleared.' })
    async logout(@Request() req: any, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.logout(
            req.user.sub,
            req.user.jti,
            req.user.exp,
            req.user.sessionVersion ?? 0,
        );

        this.clearAuthCookies(res);

        return result;
    }

    @Public()
    @UseGuards(RefreshGuard)
    @Post('refresh/logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout using a valid refresh session when access has expired' })
    @ApiResponse({ status: 200, description: 'Refresh session revoked and authentication cookies cleared.' })
    @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
    async logoutRefreshSession(
        @Request() req: any,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.logoutRefreshSession(
            req.user.sub,
            req.user.refreshToken,
            req.user.sessionVersion ?? 0,
        );

        this.clearAuthCookies(res);

        return result;
    }

    private clearAuthCookies(res: Response) {
        const isProd = this.config.get('NODE_ENV') === 'production';
        const markerCookieDomain = isProd ? '.allplan.net.tr' : undefined;
        res.clearCookie('alu_at', { path: '/', sameSite: 'lax', secure: isProd });
        res.clearCookie('alu_rt', { path: '/api/v1/auth/refresh', sameSite: 'lax', secure: isProd });
        res.clearCookie('alu_session', { path: '/', sameSite: 'lax', secure: isProd, domain: markerCookieDomain });
        this.clearLegacyDomainAuthCookies(res, isProd);
    }

    private clearLegacyDomainAuthCookies(res: Response, isProd: boolean) {
        if (!isProd) return;

        res.clearCookie('alu_at', {
            domain: '.allplan.net.tr',
            path: '/',
            secure: true,
            sameSite: 'lax',
        });
        res.clearCookie('alu_rt', {
            domain: '.allplan.net.tr',
            path: '/api/v1/auth/refresh',
            secure: true,
            sameSite: 'lax',
        });
    }

    private getPersistentCookieOptions(rememberMe: boolean, absoluteExpiry?: number) {
        if (!rememberMe) return {};
        if (typeof absoluteExpiry !== 'number' || !Number.isFinite(absoluteExpiry)) {
            throw new Error('Remember-me token is missing its absolute expiry.');
        }
        return { maxAge: Math.max(1, absoluteExpiry - Date.now()) };
    }

    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('ADMIN')
    @Post('admin/force-logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Force logout a user — invalidates all active sessions (Admin only)' })
    @ApiResponse({ status: 200, description: 'All sessions invalidated successfully.' })
    @ApiResponse({ status: 403, description: 'Forbidden — requires ADMIN role.' })
    async adminForceLogout(@Body('userId') userId: string) {
        return this.authService.forceLogout(userId);
    }

    @Public()
    @Post('lookup')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lookup email domain for intelligent registration' })
    lookup(@Body('email') email: string) {
        return this.authService.lookupEmail(email);
    }

    @Public()
    @Post('forgot-password')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request a password reset email' })
    forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Public()
    @Post('resend-verification')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Resend an email verification link' })
    resendVerification(@Body('email') email: string) {
        return this.authService.resendVerification(email);
    }

    @Public()
    @Post('reset-password')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset a forgotten password using token' })
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }


    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user' })
    me(@Request() req: any) {
        return this.authService.getProfile(req.user.id);
    }

    @Public()
    @Post('verify-email')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify email registration' })
    verifyEmail(@Body('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @UseGuards(JwtAuthGuard, RbacGuard)
    @Roles('ADMIN')
    @Get('test-email-config')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Test current email configuration state' })
    async testEmailConfig() {
        return this.authService.testEmailConfig();
    }

    @Public()
    @Get('system-requirements')
    @ApiOperation({ summary: 'Get localized system requirements for login page' })
    async getSystemRequirements(@Query('locale') locale: string = 'en') {
        return this.authService.getSystemRequirements(locale);
    }
}
