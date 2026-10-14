import { ForbiddenException } from '@nestjs/common';
import { OutboundUrlSafetyService } from './outbound-url-safety.service';

describe('OutboundUrlSafetyService', () => {
    it('accepts an allocated public IPv6 destination', async () => {
        const service = new OutboundUrlSafetyService(
            jest.fn().mockResolvedValue([{ address: '2001:4860:4860::8888', family: 6 }]),
        );

        await expect(service.validatePublicHttpsUrl('https://public-v6.example/v1'))
            .resolves.toEqual(expect.objectContaining({ httpsAgent: expect.anything() }));
    });

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
        const privateNetwork = new OutboundUrlSafetyService(
            jest.fn().mockResolvedValue([{ address: '::ffff:10.0.0.1', family: 6 }]),
        );
        const hexEncodedPrivateNetwork = new OutboundUrlSafetyService(
            jest.fn().mockResolvedValue([{ address: '::ffff:a00:1', family: 6 }]),
        );

        await expect(loopback.validatePublicHttpsUrl('https://attacker.example'))
            .rejects.toThrow('public IP');
        await expect(metadata.validatePublicHttpsUrl('https://attacker.example'))
            .rejects.toThrow('public IP');
        await expect(privateNetwork.validatePublicHttpsUrl('https://attacker.example'))
            .rejects.toThrow('public IP');
        await expect(hexEncodedPrivateNetwork.validatePublicHttpsUrl('https://attacker.example'))
            .rejects.toThrow('public IP');
    });

    it.each([
        '127.0.0.1',
        '10.20.30.40',
        '169.254.169.254',
        '::1',
        'fe80::1',
    ])('rejects every non-public address returned by DNS, including %s', async (address) => {
        const service = new OutboundUrlSafetyService(
            jest.fn().mockResolvedValue([{ address, family: address.includes(':') ? 6 : 4 }]),
        );

        await expect(service.validatePublicHttpsUrl('https://provider.example/v1'))
            .rejects.toThrow('public IP');
    });

    it.each([
        'fec0::1',
        '64:ff9b::a9fe:a9fe',
        '64:ff9b:1::a9fe:a9fe',
        '2002:7f00:1::',
        '::7f00:1',
        '2001:2::1',
        '2001:10::1',
        '2001:20::1',
        '4000::1',
    ])('rejects IPv6 local and IPv4-transition destination %s', async address => {
        const service = new OutboundUrlSafetyService(
            jest.fn().mockResolvedValue([{ address, family: 6 }]),
        );

        await expect(service.validatePublicHttpsUrl('https://transition.example/v1'))
            .rejects.toThrow('public IP');
    });

    it('rejects a hostname when any A or AAAA result is non-public', async () => {
        const service = new OutboundUrlSafetyService(jest.fn().mockResolvedValue([
            { address: '8.8.8.8', family: 4 },
            { address: '10.0.0.8', family: 4 },
            { address: '2001:4860:4860::8888', family: 6 },
        ]));

        await expect(service.validatePublicHttpsUrl('https://mixed.example/v1'))
            .rejects.toThrow('public IP');
    });

    it.each([
        'https://localhost/v1',
        'https://localhost./v1',
        'https://metadata/v1',
        'https://metadata.google.internal/computeMetadata/v1',
        'https://service.internal/v1',
        'https://printer.local/v1',
        'https://gateway.home.arpa/v1',
    ])('rejects reserved metadata or loopback hostname %s even if DNS appears public', async (url) => {
        const service = new OutboundUrlSafetyService(
            jest.fn().mockResolvedValue([{ address: '8.8.8.8', family: 4 }]),
        );

        await expect(service.validatePublicHttpsUrl(url)).rejects.toThrow('hostname');
    });

    it('fails closed when DNS resolution fails or returns no addresses', async () => {
        const dnsFailure = new OutboundUrlSafetyService(
            jest.fn().mockRejectedValue(new Error('synthetic DNS failure')),
        );
        await expect(dnsFailure.validatePublicHttpsUrl('https://provider.example/v1'))
            .rejects.toThrow('synthetic DNS failure');

        const empty = new OutboundUrlSafetyService(jest.fn().mockResolvedValue([]));
        await expect(empty.validatePublicHttpsUrl('https://provider.example/v1'))
            .rejects.toThrow('public IP');
    });
});
