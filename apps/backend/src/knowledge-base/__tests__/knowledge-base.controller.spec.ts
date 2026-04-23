import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeBaseController } from '../knowledge-base.controller';
import { KnowledgeBaseService } from '../knowledge-base.service';

describe('KnowledgeBaseController', () => {
    let controller: KnowledgeBaseController;
    let kbService: any;

    beforeEach(async () => {
        kbService = {
            listCategories: jest.fn(),
            createCategory: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            submitFeedback: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [KnowledgeBaseController],
            providers: [{ provide: KnowledgeBaseService, useValue: kbService }],
        }).compile();

        controller = module.get<KnowledgeBaseController>(KnowledgeBaseController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('listCategories', () => {
        it('should return categories', async () => {
            const expected = [{ id: 'c1', name: 'General' }];
            kbService.listCategories.mockResolvedValue(expected);
            const result = await controller.listCategories();
            expect(result).toEqual(expected);
        });
    });

    describe('createCategory', () => {
        it('should create a category', async () => {
            const body = { name: 'FAQ', parentId: 'c1' };
            const expected = { id: 'c2', ...body };
            kbService.createCategory.mockResolvedValue(expected);
            const result = await controller.createCategory(body);
            expect(result).toEqual(expected);
            expect(kbService.createCategory).toHaveBeenCalledWith(body);
        });
    });

    describe('findAll', () => {
        it('should list articles for staff', async () => {
            const expected = { data: [], total: 0 };
            kbService.findAll.mockResolvedValue(expected);
            const req = { user: { role: 'AGENT' } };
            const result = await controller.findAll({}, req);
            expect(kbService.findAll).toHaveBeenCalledWith(
                expect.objectContaining({ includeInternal: true }),
            );
            expect(result).toEqual(expected);
        });

        it('should list articles for customers without internal', async () => {
            const expected = { data: [], total: 0 };
            kbService.findAll.mockResolvedValue(expected);
            const req = { user: { role: 'CUSTOMER' } };
            const result = await controller.findAll({ status: 'PUBLISHED', page: '2', limit: '10' }, req);
            expect(kbService.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'PUBLISHED',
                    page: 2,
                    limit: 10,
                    includeInternal: false,
                }),
            );
        });
    });

    describe('findOne', () => {
        it('should return article by id', async () => {
            const expected = { id: 'a1', title: 'Test Article' };
            kbService.findOne.mockResolvedValue(expected);
            const result = await controller.findOne('a1');
            expect(result).toEqual(expected);
            expect(kbService.findOne).toHaveBeenCalledWith('a1');
        });
    });

    describe('create', () => {
        it('should create an article', async () => {
            const dto = { title: 'New Article', content: 'Content', categoryId: 'c1' };
            const expected = { id: 'a1', ...dto };
            kbService.create.mockResolvedValue(expected);
            const req = { user: { sub: 'u1' } };
            const result = await controller.create(dto as any, req);
            expect(result).toEqual(expected);
            expect(kbService.create).toHaveBeenCalledWith(dto, 'u1');
        });
    });

    describe('update', () => {
        it('should update an article', async () => {
            const dto = { title: 'Updated' };
            const expected = { id: 'a1', title: 'Updated' };
            kbService.update.mockResolvedValue(expected);
            const req = { user: { sub: 'u1' } };
            const result = await controller.update('a1', dto as any, req);
            expect(result).toEqual(expected);
            expect(kbService.update).toHaveBeenCalledWith('a1', dto, 'u1');
        });
    });

    describe('remove', () => {
        it('should delete an article', async () => {
            const expected = { id: 'a1' };
            kbService.remove.mockResolvedValue(expected);
            const result = await controller.remove('a1');
            expect(result).toEqual(expected);
            expect(kbService.remove).toHaveBeenCalledWith('a1');
        });
    });

    describe('submitFeedback', () => {
        it('should submit feedback', async () => {
            const dto = { rating: 5, comment: 'Great!' };
            const expected = { id: 'f1', ...dto };
            kbService.submitFeedback.mockResolvedValue(expected);
            const req = { user: { sub: 'u1' } };
            const result = await controller.submitFeedback('a1', dto as any, req);
            expect(result).toEqual(expected);
            expect(kbService.submitFeedback).toHaveBeenCalledWith('a1', dto, 'u1');
        });
    });
});
