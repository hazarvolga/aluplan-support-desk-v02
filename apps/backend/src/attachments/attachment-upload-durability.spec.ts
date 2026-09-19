import { ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { StorageService } from '../common/services/storage.service';
import { HotinfoParserService } from '../customers/hotinfo-parser.service';

jest.mock('./attachments.service', () => ({ AttachmentsService: class {} }));
jest.mock('../common/services/storage.service', () => ({ StorageService: class {} }));
jest.mock('../customers/hotinfo-parser.service', () => ({ HotinfoParserService: class {} }));
jest.mock('../rbac/rbac.guard', () => ({ RbacGuard: class {} }));

describe('AttachmentsController physical upload before metadata', () => {
    const user = { id: 'synthetic-customer' };
    const messageId = '11111111-1111-4111-8111-111111111111';
    const attachments = { assertCanCreateForMessage: jest.fn(), create: jest.fn() };
    const storage = { uploadFile: jest.fn() };
    const parser = { parseHotinfo: jest.fn() };
    const file = (originalname: string) => ({ originalname, size: 7, mimetype: 'text/plain', buffer: Buffer.from('fixture') }) as Express.Multer.File;
    const controller = new AttachmentsController(
        attachments as unknown as AttachmentsService,
        storage as unknown as StorageService,
        parser as unknown as HotinfoParserService,
    );
    beforeEach(() => {
        jest.resetAllMocks();
        attachments.assertCanCreateForMessage.mockResolvedValue(undefined);
        attachments.create.mockResolvedValue({ id: 'attachment-fixture', url: 'tickets/fixture' });
        storage.uploadFile.mockResolvedValue('tickets/fixture');
        parser.parseHotinfo.mockReturnValue({ version: 'synthetic' });
    });
    it.each(['fixture.txt', 'fixture_hotinf_test.hxl', 'fixture_hotinfo_test.hxl'])('does not parse or persist metadata after storage failure for %s', async (name) => {
        const error = new ServiceUnavailableException('File storage is temporarily unavailable. Please retry.');
        storage.uploadFile.mockRejectedValue(error);
        await expect(controller.uploadFile(messageId, { user }, file(name))).rejects.toBe(error);
        expect(parser.parseHotinfo).not.toHaveBeenCalled();
        expect(attachments.create).not.toHaveBeenCalled();
    });
    it('preserves successful upload response and metadata contract', async () => {
        const result = await controller.uploadFile(messageId, { user }, file('fixture.txt'));
        expect(result).toEqual({ id: 'attachment-fixture', url: 'tickets/fixture' });
        expect(attachments.create).toHaveBeenCalledWith({ messageId, fileName: 'fixture.txt', fileSize: 7, mimeType: 'text/plain', url: 'tickets/fixture' }, null, user);
    });
    it('preserves hotinfo parsing after successful storage', async () => {
        await controller.uploadFile(messageId, { user }, file('fixture_hotinf_test.hxl'));
        expect(parser.parseHotinfo).toHaveBeenCalledWith('fixture');
        expect(attachments.create).toHaveBeenCalledWith(expect.objectContaining({ url: 'tickets/fixture' }), { version: 'synthetic' }, user);
    });
    it('preserves a stored attachment even when optional hotinfo parsing fails', async () => {
        parser.parseHotinfo.mockImplementation(() => { throw new Error('synthetic parse failure'); });
        await expect(controller.uploadFile(messageId, { user }, file('fixture_hotinf_test.hxl'))).resolves.toMatchObject({ id: 'attachment-fixture' });
        expect(attachments.create).toHaveBeenCalledWith(expect.objectContaining({ url: 'tickets/fixture' }), null, user);
    });
    it('does not write storage when message authorization fails', async () => {
        attachments.assertCanCreateForMessage.mockRejectedValue(new ForbiddenException());
        await expect(controller.uploadFile(messageId, { user }, file('fixture.txt'))).rejects.toBeInstanceOf(ForbiddenException);
        expect(storage.uploadFile).not.toHaveBeenCalled();
        expect(attachments.create).not.toHaveBeenCalled();
    });
});
