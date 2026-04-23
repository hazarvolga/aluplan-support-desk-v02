import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AnnouncementTemplatesService } from '../announcement-templates.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AnnouncementTemplatesService', () => {
    let service: AnnouncementTemplatesService;
    let prisma: any;

    beforeEach(async () => {
        const mockPrismaService = {
            announcementTemplate: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            user: {
                findFirst: jest.fn().mockResolvedValue({ id: 'admin-1' }),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AnnouncementTemplatesService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<AnnouncementTemplatesService>(AnnouncementTemplatesService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an announcement template', async () => {
            const dto = { name: 'Welcome', subject: 'Welcome!', contentMjml: '<mjml><mj-body>Hello</mj-body></mjml>' };
            const expected = { id: 'tpl-1', ...dto };

            prisma.announcementTemplate.create.mockResolvedValue(expected);

            const result = await service.create(dto as any);

            expect(result).toEqual(expected);
            expect(prisma.announcementTemplate.create).toHaveBeenCalledWith({ data: dto });
        });
    });

    describe('findAll', () => {
        it('should return all announcement templates', async () => {
            const templates = [
                { id: 'tpl-1', name: 'Welcome', subject: 'Welcome!' },
            ];
            prisma.announcementTemplate.findMany.mockResolvedValue(templates);

            const result = await service.findAll();

            expect(result).toEqual(templates);
            expect(prisma.announcementTemplate.findMany).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a template by id', async () => {
            const template = { id: 'tpl-1', name: 'Welcome' };
            prisma.announcementTemplate.findUnique.mockResolvedValue(template);

            const result = await service.findOne('tpl-1');

            expect(result).toEqual(template);
            expect(prisma.announcementTemplate.findUnique).toHaveBeenCalledWith({
                where: { id: 'tpl-1' },
                include: { author: true },
            });
        });

        it('should throw NotFoundException when template does not exist', async () => {
            prisma.announcementTemplate.findUnique.mockResolvedValue(null);

            await expect(service.findOne('tpl-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a template by id', async () => {
            const dto = { name: 'Updated Welcome' };
            const expected = { id: 'tpl-1', ...dto };

            prisma.announcementTemplate.update.mockResolvedValue(expected);

            const result = await service.update('tpl-1', dto as any);

            expect(result).toEqual(expected);
            expect(prisma.announcementTemplate.update).toHaveBeenCalledWith({
                where: { id: 'tpl-1' },
                data: dto,
            });
        });
    });

    describe('delete', () => {
        it('should delete a template by id', async () => {
            const expected = { id: 'tpl-1' };

            prisma.announcementTemplate.delete.mockResolvedValue(expected);

            const result = await service.delete('tpl-1');

            expect(result).toEqual(expected);
            expect(prisma.announcementTemplate.delete).toHaveBeenCalledWith({
                where: { id: 'tpl-1' },
            });
        });
    });
});
