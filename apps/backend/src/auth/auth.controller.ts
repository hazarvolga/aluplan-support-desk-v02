import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { Public } from './decorators/public.decorator';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Public()
    @UseGuards(RefreshGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    refresh(@Request() req: any) {
        return this.authService.refreshTokens(req.user.sub, req.user.refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout' })
    logout(@Request() req: any) {
        return this.authService.logout(req.user.sub);
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
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request a password reset email' })
    forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Public()
    @Post('reset-password')
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

    @Public()
    @Get('test-email-config')
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
