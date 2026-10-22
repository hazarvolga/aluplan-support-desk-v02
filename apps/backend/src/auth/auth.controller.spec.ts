import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { ROLES_KEY } from '../rbac/decorators/rbac.decorators';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: any;

    const mockAuthService = {
        login: jest.fn(),
        refreshTokens: jest.fn(),
        logout: jest.fn(),
        logoutRefreshSession: jest.fn(),
        forceLogout: jest.fn(),
        lookupEmail: jest.fn(),
        forgotPassword: jest.fn(),
        resendVerification: jest.fn(),
        resetPassword: jest.fn(),
        getProfile: jest.fn(),
        verifyEmail: jest.fn(),
        testEmailConfig: jest.fn(),
    };
    const mockConfigService = {
        get: jest.fn().mockReturnValue('test'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);

        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should call authService.login and return the result', async () => {
            // Arrange
            const dto: LoginDto = { email: 'test@example.com', password: 'password123', rememberMe: false };
            const expectedResult = { access_token: 'token', refresh_token: 'refresh', session_marker: 'marker', user: { id: '1' } };
            mockAuthService.login.mockResolvedValue(expectedResult);

            // Act
            const mockRes = { cookie: jest.fn() } as any;
            const result = await controller.login(dto, mockRes);

            // Assert
            expect(mockAuthService.login).toHaveBeenCalledWith(dto);
            expect(result).toEqual({ user: { id: '1' } });
            expect(JSON.stringify(result)).not.toMatch(/access_token|refresh_token|token|refresh/);
            expect(mockRes.cookie).toHaveBeenNthCalledWith(1, 'alu_at', 'token', {
                httpOnly: true, secure: false, sameSite: 'lax', path: '/',
            });
            expect(mockRes.cookie).toHaveBeenNthCalledWith(2, 'alu_rt', 'refresh', {
                httpOnly: true, secure: false, sameSite: 'lax', path: '/api/v1/auth/refresh',
            });
            expect(mockRes.cookie).toHaveBeenNthCalledWith(3, 'alu_session', 'marker', {
                httpOnly: true, secure: false, sameSite: 'lax', path: '/',
            });
        });

        it('persists refresh and middleware marker cookies for 30 days when remember me is selected', async () => {
            const dto: LoginDto = { email: 'test@example.com', password: 'password123', rememberMe: true };
            mockAuthService.login.mockResolvedValue({
                access_token: 'token', refresh_token: 'refresh', session_marker: 'marker',
                remember_me_expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
                user: { id: '1' },
            });
            const res = { cookie: jest.fn() } as any;

            await controller.login(dto, res);

            expect(res.cookie).toHaveBeenNthCalledWith(1, 'alu_at', 'token', expect.not.objectContaining({ maxAge: expect.anything() }));
            expect(res.cookie).toHaveBeenNthCalledWith(2, 'alu_rt', 'refresh', expect.objectContaining({
                maxAge: expect.closeTo(30 * 24 * 60 * 60 * 1000, -3),
            }));
            expect(res.cookie).toHaveBeenNthCalledWith(3, 'alu_session', 'marker', expect.objectContaining({
                maxAge: expect.closeTo(30 * 24 * 60 * 60 * 1000, -3),
            }));
        });
    });

    describe('refresh', () => {
        it('should call authService.refreshTokens with user id and refresh token', async () => {
            // Arrange
            const absoluteExpiry = Date.now() + 20 * 24 * 60 * 60 * 1000;
            const req = { user: { sub: 'user1', refreshToken: 'refreshToken123', rememberMe: true, rememberMeExpiresAt: absoluteExpiry } };
            const expectedResult = { access_token: 'new-acs', refresh_token: 'new-ref', session_marker: 'new-marker', remember_me_expires_at: absoluteExpiry };
            mockAuthService.refreshTokens.mockResolvedValue(expectedResult);

            // Act
            const mockRes = { cookie: jest.fn() } as any;
            const result = await controller.refresh(req, mockRes);

            // Assert
            expect(mockAuthService.refreshTokens).toHaveBeenCalledWith('user1', 'refreshToken123', 0, true, absoluteExpiry);
            expect(result).toEqual({ success: true });
            expect(result).not.toHaveProperty('access_token');
            expect(result).not.toHaveProperty('refresh_token');
            expect(mockRes.cookie).toHaveBeenNthCalledWith(1, 'alu_at', 'new-acs', {
                httpOnly: true, secure: false, sameSite: 'lax', path: '/',
            });
            expect(mockRes.cookie).toHaveBeenNthCalledWith(2, 'alu_rt', 'new-ref', {
                httpOnly: true, secure: false, sameSite: 'lax', path: '/api/v1/auth/refresh',
                maxAge: expect.closeTo(20 * 24 * 60 * 60 * 1000, -3),
            });
            expect(mockRes.cookie).toHaveBeenNthCalledWith(3, 'alu_session', 'new-marker', {
                httpOnly: true, secure: false, sameSite: 'lax', path: '/',
                maxAge: expect.closeTo(20 * 24 * 60 * 60 * 1000, -3),
            });
        });
    });

    describe('production cookies', () => {
        it('sets secure scoped cookies for login in production', async () => {
            mockConfigService.get.mockImplementation((key: string) => key === 'NODE_ENV' ? 'production' : undefined);
            mockAuthService.login.mockResolvedValue({
                access_token: 'access', refresh_token: 'refresh', session_marker: 'marker',
                remember_me_expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
                user: { id: '1' },
            });
            const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;

            await controller.login({ email: 'test@example.com', password: 'password123', rememberMe: true }, res);

            expect(res.clearCookie).toHaveBeenCalledWith('alu_at', {
                domain: '.allplan.net.tr', path: '/', secure: true, sameSite: 'lax',
            });
            expect(res.clearCookie).toHaveBeenCalledWith('alu_rt', {
                domain: '.allplan.net.tr', path: '/api/v1/auth/refresh', secure: true, sameSite: 'lax',
            });
            expect(res.cookie).toHaveBeenNthCalledWith(1, 'alu_at', 'access', expect.objectContaining({
                httpOnly: true, secure: true, sameSite: 'lax', path: '/',
            }));
            expect(res.cookie.mock.calls[0][2]).not.toHaveProperty('domain');
            expect(res.cookie).toHaveBeenNthCalledWith(2, 'alu_rt', 'refresh', expect.objectContaining({
                httpOnly: true, secure: true, sameSite: 'lax', path: '/api/v1/auth/refresh',
            }));
            expect(res.cookie.mock.calls[1][2]).not.toHaveProperty('domain');
            expect(res.cookie).toHaveBeenNthCalledWith(3, 'alu_session', 'marker', expect.objectContaining({
                httpOnly: true, secure: true, sameSite: 'lax', domain: '.allplan.net.tr', path: '/',
            }));
        });

        it('clears legacy parent-domain API cookies before rotating production cookies', async () => {
            mockConfigService.get.mockImplementation((key: string) => key === 'NODE_ENV' ? 'production' : undefined);
            const absoluteExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
            mockAuthService.refreshTokens.mockResolvedValue({
                access_token: 'new-access', refresh_token: 'new-refresh', session_marker: 'new-marker',
                remember_me_expires_at: absoluteExpiry,
            });
            const res = { cookie: jest.fn(), clearCookie: jest.fn() } as any;

            await controller.refresh({
                user: {
                    sub: 'user1', refreshToken: 'old-refresh', sessionVersion: 2,
                    rememberMe: true, rememberMeExpiresAt: absoluteExpiry,
                },
            }, res);

            expect(res.clearCookie).toHaveBeenCalledWith('alu_at', {
                domain: '.allplan.net.tr', path: '/', secure: true, sameSite: 'lax',
            });
            expect(res.clearCookie).toHaveBeenCalledWith('alu_rt', {
                domain: '.allplan.net.tr', path: '/api/v1/auth/refresh', secure: true, sameSite: 'lax',
            });
            expect(res.cookie).toHaveBeenCalledWith('alu_at', 'new-access', expect.not.objectContaining({
                domain: expect.anything(),
            }));
            expect(res.cookie).toHaveBeenCalledWith('alu_rt', 'new-refresh', expect.not.objectContaining({
                domain: expect.anything(),
            }));
        });
    });

    describe('logout', () => {
        it('passes the verified access-token expiry to logout', async () => {
            // Arrange
            const req = { user: { sub: 'user1', jti: 'jti-abc', exp: 1_800_000_000, sessionVersion: 4 } };
            mockAuthService.logout.mockResolvedValue({ success: true });

            // Act
            const mockRes = { clearCookie: jest.fn() } as any;
            const result = await controller.logout(req, mockRes);

            // Assert
            expect(mockAuthService.logout).toHaveBeenCalledWith('user1', 'jti-abc', 1_800_000_000, 4);
            expect(result).toEqual({ success: true });
            // Cookie name changed to 'alu_at'
            expect(mockRes.clearCookie).toHaveBeenCalledWith('alu_at', expect.any(Object));
            expect(mockRes.clearCookie).toHaveBeenCalledWith('alu_session', expect.any(Object));
        });

        it('clears legacy parent-domain API cookies after production logout', async () => {
            mockConfigService.get.mockImplementation((key: string) => key === 'NODE_ENV' ? 'production' : undefined);
            mockAuthService.logout.mockResolvedValue({ success: true });
            const res = { clearCookie: jest.fn() } as any;

            await controller.logout({
                user: { sub: 'user1', jti: 'jti-abc', exp: 1_800_000_000, sessionVersion: 4 },
            }, res);

            expect(res.clearCookie).toHaveBeenCalledWith('alu_at', {
                domain: '.allplan.net.tr', path: '/', secure: true, sameSite: 'lax',
            });
            expect(res.clearCookie).toHaveBeenCalledWith('alu_rt', {
                domain: '.allplan.net.tr', path: '/api/v1/auth/refresh', secure: true, sameSite: 'lax',
            });
        });

        it('revokes an expired-access session through the verified refresh token', async () => {
            const req = {
                user: { sub: 'user1', refreshToken: 'refresh-token', sessionVersion: 4 },
            };
            const res = { clearCookie: jest.fn() } as any;
            mockAuthService.logoutRefreshSession.mockResolvedValue({ success: true });

            const result = await controller.logoutRefreshSession(req, res);

            expect(mockAuthService.logoutRefreshSession).toHaveBeenCalledWith(
                'user1',
                'refresh-token',
                4,
            );
            expect(result).toEqual({ success: true });
            expect(res.clearCookie).toHaveBeenCalledWith(
                'alu_rt',
                expect.objectContaining({ path: '/api/v1/auth/refresh' }),
            );
            expect(res.clearCookie).toHaveBeenCalledWith('alu_session', expect.any(Object));
        });
    });

    describe('lookup', () => {
        it('should call authService.lookupEmail', async () => {
            // Arrange
            const email = 'test@example.com';
            mockAuthService.lookupEmail.mockResolvedValue({ action: 'NEW' });

            // Act
            const result = await controller.lookup(email);

            // Assert
            expect(mockAuthService.lookupEmail).toHaveBeenCalledWith(email);
            expect(result).toEqual({ action: 'NEW' });
        });
    });

    describe('forgotPassword', () => {
        it('should call authService.forgotPassword', async () => {
            // Arrange
            const email = 'test@example.com';
            mockAuthService.forgotPassword.mockResolvedValue({ success: true });

            // Act
            const result = await controller.forgotPassword(email);

            // Assert
            expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(email);
            expect(result).toEqual({ success: true });
        });
    });

    describe('resendVerification', () => {
        it('delegates without revealing account state', async () => {
            mockAuthService.resendVerification.mockResolvedValue({ success: true });
            await expect(controller.resendVerification('test@example.com')).resolves.toEqual({ success: true });
            expect(mockAuthService.resendVerification).toHaveBeenCalledWith('test@example.com');
        });
    });

    describe('resetPassword', () => {
        it('should call authService.resetPassword', async () => {
            // Arrange
            const dto: ResetPasswordDto = { token: 'token123', newPassword: 'new123' };
            mockAuthService.resetPassword.mockResolvedValue({ success: true });

            // Act
            const result = await controller.resetPassword(dto);

            // Assert
            expect(mockAuthService.resetPassword).toHaveBeenCalledWith('token123', 'new123');
            expect(result).toEqual({ success: true });
        });
    });

    describe('me', () => {
        it('should call authService.getProfile', async () => {
            // Arrange
            const req = { user: { id: 'user1' } };
            const expectedProfile = { id: 'user1', email: 'test@test.com' };
            mockAuthService.getProfile.mockResolvedValue(expectedProfile);

            // Act
            const result = await controller.me(req);

            // Assert
            expect(mockAuthService.getProfile).toHaveBeenCalledWith('user1');
            expect(result).toEqual(expectedProfile);
        });
    });

    describe('adminForceLogout', () => {
        it('should call authService.forceLogout with userId', async () => {
            // Arrange
            const userId = 'user-to-kick';
            mockAuthService.forceLogout.mockResolvedValue({ success: true, message: 'All sessions invalidated', userId });

            // Act
            const result = await controller.adminForceLogout(userId);

            // Assert
            expect(mockAuthService.forceLogout).toHaveBeenCalledWith(userId);
            expect(result).toEqual({ success: true, message: 'All sessions invalidated', userId });
        });
    });

    describe('testEmailConfig', () => {
        it('is admin-only and not public', () => {
            const publicMetadata = Reflect.getMetadata(
                IS_PUBLIC_KEY,
                AuthController.prototype.testEmailConfig,
            );
            const guards = Reflect.getMetadata(
                '__guards__',
                AuthController.prototype.testEmailConfig,
            );
            const roles = Reflect.getMetadata(
                ROLES_KEY,
                AuthController.prototype.testEmailConfig,
            );

            expect(publicMetadata).toBeUndefined();
            expect(guards).toEqual([JwtAuthGuard, RbacGuard]);
            expect(roles).toEqual(['ADMIN']);
        });

        it('delegates admin email config diagnostics to authService', async () => {
            const expectedResult = { config: { env: { hasResendKey: true } } };
            mockAuthService.testEmailConfig.mockResolvedValue(expectedResult);

            const result = await controller.testEmailConfig();

            expect(mockAuthService.testEmailConfig).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedResult);
        });
    });
});
