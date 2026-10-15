import { SettingsController } from '../settings.controller';

describe('SettingsController', () => {
    const plaintextSecret = 'plaintext-secret';
    let settingsService: {
        getAll: jest.Mock;
        get: jest.Mock;
        delete: jest.Mock;
    };
    let controller: SettingsController;

    beforeEach(() => {
        settingsService = {
            getAll: jest.fn((decrypt = false) => [{
                key: 'ai.openai.api_key',
                value: decrypt ? plaintextSecret : '********',
                isSecret: true,
            }]),
            get: jest.fn((_key: string, decrypt = false) => ({
                key: 'ai.openai.api_key',
                value: decrypt ? plaintextSecret : '********',
                isSecret: true,
            })),
            delete: jest.fn().mockResolvedValue({ key: 'email.smtp.pass', deleted: true }),
        };

        controller = new SettingsController(
            settingsService as never,
            { testCustomConnection: jest.fn() } as never,
        );
    });

    it('never decrypts the settings collection when a decrypt query value is supplied', async () => {
        const result = await (controller.findAll as unknown as (decrypt?: string) => Promise<Array<{ value: string }>>)('true');

        expect(settingsService.getAll).toHaveBeenCalledWith(false);
        expect(result[0]?.value).toBe('********');
        expect(result[0]?.value).not.toBe(plaintextSecret);
    });

    it('never decrypts an individual setting when a decrypt query value is supplied', async () => {
        const result = await (controller.findOne as unknown as (key: string, decrypt?: string) => Promise<{ value: string }>)('ai.openai.api_key', 'true');

        expect(settingsService.get).toHaveBeenCalledWith('ai.openai.api_key', false);
        expect(result.value).toBe('********');
        expect(result.value).not.toBe(plaintextSecret);
    });

    it('returns only deletion metadata for secret settings', async () => {
        const result = await controller.remove('email.smtp.pass');

        expect(settingsService.delete).toHaveBeenCalledWith('email.smtp.pass');
        expect(result).toEqual({ key: 'email.smtp.pass', deleted: true });
        expect(JSON.stringify(result)).not.toContain(plaintextSecret);
    });
});
