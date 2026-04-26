import { Test, TestingModule } from '@nestjs/testing';
import { BrandingController } from '../branding.controller';
import { StorageService } from '../../common/services/storage.service';

describe('BrandingController', () => {
    let controller: BrandingController;
    let storageService: any;

    const mockStorageService = {
        isS3: jest.fn().mockReturnValue(true), // default: S3 mode
        getDownloadUrl: jest.fn(),
        getFile: jest.fn(),
        uploadFile: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BrandingController],
            providers: [{ provide: StorageService, useValue: mockStorageService }],
        }).compile();

        controller = module.get<BrandingController>(BrandingController);
        storageService = module.get<StorageService>(StorageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAsset', () => {
        it('should redirect to the presigned download URL', async () => {
            const presignedUrl = 'https://s3.example.com/brand/logos/logo.png?token=abc';
            mockStorageService.isS3.mockReturnValue(true);
            mockStorageService.getDownloadUrl.mockResolvedValue(presignedUrl);

            const res = {
                redirect: jest.fn().mockReturnValue(undefined),
            } as any;

            await controller.getAsset('brand/logos/logo.png', res);

            expect(storageService.getDownloadUrl).toHaveBeenCalledWith('brand/logos/logo.png');
            expect(res.redirect).toHaveBeenCalledWith(presignedUrl);
        });

        it('should return 404 when storage service throws an error', async () => {
            mockStorageService.isS3.mockReturnValue(true);
            mockStorageService.getDownloadUrl.mockRejectedValue(new Error('Not found'));

            const mockSend = jest.fn().mockReturnValue(undefined);
            const res = {
                status: jest.fn().mockReturnValue({ send: mockSend }),
                send: jest.fn(),
            } as any;

            await controller.getAsset('missing.png', res);

            expect(storageService.getDownloadUrl).toHaveBeenCalledWith('missing.png');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(mockSend).toHaveBeenCalledWith('Asset not found');
        });
    });

    describe('uploadLogo', () => {
        it('should upload file to brand/logos and return proxy endpoint url', async () => {
            const file = { originalname: 'logo.png', buffer: Buffer.from('') } as any;
            mockStorageService.uploadFile.mockResolvedValue('brand/logos/uuid-logo.png');

            const result = await controller.uploadLogo(file);

            expect(storageService.uploadFile).toHaveBeenCalledWith(file, 'brand/logos');
            expect(result).toEqual({
                url: '/api/v1/branding/assets/brand/logos/uuid-logo.png',
                filename: 'brand/logos/uuid-logo.png',
            });
        });
    });
});
