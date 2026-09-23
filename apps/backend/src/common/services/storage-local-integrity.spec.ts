import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StorageService } from './storage.service';

jest.mock('../../settings/settings.service', () => ({ SettingsService: class {} }));

describe('real local storage attachment integrity', () => {
    let directory: string;
    beforeEach(async () => { directory = await mkdtemp(join(tmpdir(), 'aluplan-storage-integrity-')); });
    afterEach(async () => {
        jest.restoreAllMocks();
        // Only this test's freshly allocated synthetic directory is removed.
        await rm(directory, { recursive: true, force: true });
    });

    it('retains both byte sequences when same-name uploads share a millisecond', async () => {
        const service = new StorageService({ get: () => ({ type: 'LOCAL', localPath: directory }) } as never, {} as never);
        jest.spyOn(Date, 'now').mockReturnValue(123456789);
        const first = Buffer.from([0, 1, 255]);
        const second = Buffer.from([128, 2, 3]);
        const file = (buffer: Buffer) => ({ originalname: 'same.bin', mimetype: 'application/octet-stream', buffer }) as Express.Multer.File;
        const keys = await Promise.all([
            service.uploadFile(file(first), 'tickets/synthetic/messages/example'),
            service.uploadFile(file(second), 'tickets/synthetic/messages/example'),
        ]);
        expect(keys[0]).not.toBe(keys[1]);
        expect(await readFile(join(directory, keys[0]))).toEqual(first);
        expect(await readFile(join(directory, keys[1]))).toEqual(second);
        expect(await service.getFile(keys[0])).toEqual(first);
        expect(await service.getFile(keys[1])).toEqual(second);
    });

    it.each(['a'.repeat(220) + '.bin', 'ö'.repeat(110) + '.png'])('keeps long UTF-8 filenames writable and readable: %s', async name => {
        const service = new StorageService({ get: () => ({ type: 'LOCAL', localPath: directory }) } as never, {} as never);
        const buffer = Buffer.from('synthetic long filename');
        const key = await service.uploadFile({ originalname: name, mimetype: 'application/octet-stream', buffer } as Express.Multer.File, 'tickets/example');
        expect(Buffer.byteLength(key.split('/').at(-1)!)).toBeLessThanOrEqual(255);
        expect(key.endsWith(name.slice(-4))).toBe(true);
        expect(await service.getFile(key)).toEqual(buffer);
    });
});
