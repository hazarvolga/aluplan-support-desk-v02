import { ForbiddenException } from '@nestjs/common';
import { OutboundUrlSafetyService } from './outbound-url-safety.service';

describe('OutboundUrlSafetyService', () => {
    it('accepts exact public HTTPS LearnNow and rejects lookalike or private resolution', async () => {
        const publicLookup = jest.fn().mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
        const service = new OutboundUrlSafetyService(publicLookup);

        await expect(service.validateLearnNowUrl('https://learnnow.allplan.com/help'))
            .resolves.toEqual(expect.objectContaining({ httpsAgent: expect.anything() }));
        await expect(service.validateLearnNowUrl('https://learnnow.allplan.com.evil.test/help'))
            .rejects.toBeInstanceOf(ForbiddenException);

        const privateService = new OutboundUrlSafetyService(
            jest.fn().mockResolvedValue([{ address: '10.0.0.2', family: 4 }]),
        );
        await expect(privateService.validatePublicHttpsUrl('https://docs.example.com/help'))
            .rejects.toThrow('public IP');
    });

    it('allows only Vimeo-owned HTTPS transcript hosts', async () => {
        const service = new OutboundUrlSafetyService(
            jest.fn().mockResolvedValue([{ address: '8.8.4.4', family: 4 }]),
        );

        await expect(service.validateVimeoUrl('https://captions.vimeo.com/captions/1.vtt'))
            .resolves.toEqual(expect.objectContaining({ httpsAgent: expect.anything() }));
        await expect(service.validateVimeoUrl('https://vimeo.example.com/captions/1.vtt'))
            .rejects.toThrow('Vimeo-owned');
    });

    it('pins the validated address into the actual HTTPS agent lookup', async () => {
        const lookup = jest.fn().mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
        const service = new OutboundUrlSafetyService(lookup);
        const validation = await service.validatePublicHttpsUrl('https://docs.example.com/help');
        const pinnedLookup = (validation.httpsAgent as any).options.lookup;
        const callback = jest.fn();

        pinnedLookup('docs.example.com', {}, callback);

        expect(callback).toHaveBeenCalledWith(null, '8.8.8.8', 4);
        expect(lookup).toHaveBeenCalledTimes(1);
    });

    it('rejects IPv4-mapped IPv6 private and link-local destinations', async () => {
        const loopback = new OutboundUrlSafetyService(
            jest.fn().mockResolvedValue([{ address: '::ffff:127.0.0.1', family: 6 }]),
        );
        const metadata = new OutboundUrlSafetyService(
            jest.fn().mockResolvedValue([{ address: '::ffff:169.254.169.254', family: 6 }]),
        );

        await expect(loopback.validatePublicHttpsUrl('https://attacker.example'))
            .rejects.toThrow('public IP');
        await expect(metadata.validatePublicHttpsUrl('https://attacker.example'))
            .rejects.toThrow('public IP');
    });
});
