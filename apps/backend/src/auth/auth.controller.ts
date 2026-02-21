import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { Public } from './decorators/public.decorator';

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

    @UseGuards(JwtAuthGuard)
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user' })
    me(@Request() req: any) {
        return this.authService.getProfile(req.user.id);
    }
}
