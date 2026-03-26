import { Test, TestingModule } from '@nestjs/testing';
import { EmailValidatorService } from './email-validator.service';
import { SyntaxValidator } from './validators/syntax.validator';
import { DnsValidator } from './validators/dns.validator';
import { SmtpValidator } from './validators/smtp.validator';
import { ConfigService } from '@nestjs/config';

describe('EmailValidator Logic', () => {
    let service: EmailValidatorService;
    let syntaxValidator: SyntaxValidator;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailValidatorService,
                SyntaxValidator,
                {
                    provide: DnsValidator,
                    useValue: {
                        validate: jest.fn().mockResolvedValue({ isValid: true, mxRecords: ['mx.example.com'], isDisposable: false }),
                        isDisposable: jest.fn().mockReturnValue(false)
                    },
                },
                {
                    provide: SmtpValidator,
                    useValue: { validate: jest.fn().mockResolvedValue({ isValid: true, canConnect: true, isGreyListed: false, log: '' }) },
                },
                {
                    provide: ConfigService,
                    useValue: { get: jest.fn() },
                },
            ],
        }).compile();

        service = module.get<EmailValidatorService>(EmailValidatorService);
        syntaxValidator = module.get<SyntaxValidator>(SyntaxValidator);
    });

    describe('SyntaxValidator', () => {
        it('should validate standard email', () => {
            const result = syntaxValidator.validate('test@example.com');
            expect(result.isValid).toBe(true);
        });

        it('should reject invalid format', () => {
            const result = syntaxValidator.validate('test@example@com');
            expect(result.isValid).toBe(false);
        });

        it('should detect typos via dedicated method', () => {
            const result = syntaxValidator.suggestCorrection('user@gamil.com');
            expect(result).toBe('user@gmail.com');
        });

        it('should handle Internationalized Domain Names (IDN)', () => {
            const result = syntaxValidator.validate('user@öxample.com');
            expect(result.isValid).toBe(true);
            expect(result.normalized).toContain('xn--');
        });
    });

    describe('Score Calculation (Orchestration)', () => {
        it('should give high score for valid syntax + DNS + SMTP', async () => {
            const result = await service.validate('valid@example.com');
            expect(result.score).toBe(80); // 100 - 20 (catch-all detected by design in mock)
            expect(result.status).toBe('VALID');
        });

        it('should give low score for syntax error', async () => {
            const result = await service.validate('invalid-email');
            expect(result.score).toBe(0);
            expect(result.status).toBe('INVALID');
        });
    });
});
