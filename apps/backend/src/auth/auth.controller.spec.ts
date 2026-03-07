import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: any;

    const mockAuthService = {
        login: jest.fn(),
        refreshTokens: jest.fn(),
        logout: jest.fn(),
        lookupEmail: jest.fn(),
        forgotPassword: jest.fn(),
        resetPassword: jest.fn(),
        getProfile: jest.fn(),
        verifyEmail: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
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
            const dto: LoginDto = { email: 'test@example.com', password: 'password123' };
            const expectedResult = { access_token: 'token', user: { id: '1' } };
            mockAuthService.login.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.login(dto);

            // Assert
            expect(mockAuthService.login).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('refresh', () => {
        it('should call authService.refreshTokens with user id and refresh token', async () => {
            // Arrange
            const req = { user: { sub: 'user1', refreshToken: 'refreshToken123' } };
            const expectedResult = { access_token: 'new-acs', refresh_token: 'new-ref' };
            mockAuthService.refreshTokens.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.refresh(req);

            // Assert
            expect(mockAuthService.refreshTokens).toHaveBeenCalledWith('user1', 'refreshToken123');
            expect(result).toEqual(expectedResult);
        });
    });

    describe('logout', () => {
        it('should call authService.logout with user id', async () => {
            // Arrange
            const req = { user: { sub: 'user1' } };
            mockAuthService.logout.mockResolvedValue({ success: true });

            // Act
            const result = await controller.logout(req);

            // Assert
            expect(mockAuthService.logout).toHaveBeenCalledWith('user1');
            expect(result).toEqual({ success: true });
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
});
