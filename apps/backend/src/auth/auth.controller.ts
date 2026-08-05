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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly config: ConfigService,
    ) { }

    @Public()
    @Post('login')
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, description: 'Login successful. Returns tokens and sets HttpOnly cookies.' })
    @ApiResponse({ status: 401, description: 'Invalid credentials.' })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.login(dto);

        const isProd = this.config.get('NODE_ENV') === 'production';
        const cookieDomain = isProd ? '.allplan.net.tr' : undefined;

        res.cookie('alu_at', tokens.access_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            domain: cookieDomain,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        res.cookie('alu_rt', tokens.refresh_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/api/v1/auth/refresh',
            domain: cookieDomain,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });


        return tokens;
    }

    @Public()
    @UseGuards(RefreshGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Tokens refreshed successfully.' })
    @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
    async refresh(@Request() req: any, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.refreshTokens(req.user.sub, req.user.refreshToken);

        const isProd = this.config.get('NODE_ENV') === 'production';
        const cookieDomain = isProd ? '.allplan.net.tr' : undefined;

        res.cookie('alu_at', tokens.access_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            domain: cookieDomain,
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.cookie('alu_rt', tokens.refresh_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/api/v1/auth/refresh',
            domain: cookieDomain,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        return tokens;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout' })
    @ApiResponse({ status: 204, description: 'Logout successful. Cookies cleared.' })
    async logout(@Request() req: any, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.logout(req.user.sub, req.user.jti);

        const isProd = this.config.get('NODE_ENV') === 'production';
        const cookieDomain = isProd ? '.allplan.net.tr' : undefined;
        res.clearCookie('alu_at', { path: '/', sameSite: 'lax', secure: isProd, domain: cookieDomain });
        res.clearCookie('alu_rt', { path: '/api/v1/auth/refresh', sameSite: 'lax', secure: isProd, domain: cookieDomain });


        return result;
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
    @Get('verify-email')
    @ApiOperation({ summary: 'Verify email registration' })
    verifyEmail(@Query('token') token: string) {
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
