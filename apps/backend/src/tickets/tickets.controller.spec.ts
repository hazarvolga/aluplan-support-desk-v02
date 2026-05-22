import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { TicketStatus, TicketPriority } from '@aluplan/database';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { EscalateTicketDto } from './dto/escalate-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';

describe('TicketsController', () => {
    let controller: TicketsController;
    let service: any;
    let gateway: any;

    const mockTicketsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findByNumber: jest.fn(),
        update: jest.fn(),
        bulkUpdate: jest.fn(),
        transition: jest.fn(),
        assign: jest.fn(),
        getAssignableAgents: jest.fn(),
        escalate: jest.fn(),
        linkTicket: jest.fn(),
        submitFeedback: jest.fn(),
        addMessage: jest.fn(),
        getSlaStats: jest.fn(),
    };

    const mockNotificationsGateway = {
        emitTicketCreated: jest.fn(),
        emitTicketUpdated: jest.fn(),
        emitTicketEscalated: jest.fn(),
        emitBulkUpdate: jest.fn(),
        emitNewMessage: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TicketsController],
            providers: [
                { provide: TicketsService, useValue: mockTicketsService },
                { provide: NotificationsGateway, useValue: mockNotificationsGateway },
            ],
        }).compile();

        controller = module.get<TicketsController>(TicketsController);
        service = module.get<TicketsService>(TicketsService);
        gateway = module.get<NotificationsGateway>(NotificationsGateway);

        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a ticket and emit notification', async () => {
            // Arrange
            const dto: CreateTicketDto = { subject: 'Issue', departmentId: 'dep1' };
            const req = { user: { sub: 'user1' } };
            const expectedResult = { id: 'tik1', subject: 'Issue' };
            mockTicketsService.create.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.create(dto, req);

            // Assert
            expect(mockTicketsService.create).toHaveBeenCalledWith(dto, 'user1');
            expect(mockNotificationsGateway.emitTicketCreated).toHaveBeenCalledWith(expectedResult);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('findAll', () => {
        it('should not apply SLA breach filter when query param is omitted', async () => {
            const req = { user: { sub: 'admin1', role: 'ADMIN' } };
            const expectedResult = { data: [], total: 0 };
            mockTicketsService.findAll.mockResolvedValue(expectedResult);

            const result = await controller.findAll({ assignedTo: 'agent1', limit: '100' }, req);

            expect(mockTicketsService.findAll).toHaveBeenCalledWith(expect.objectContaining({
                assignedTo: 'agent1',
                isSlaBreached: undefined,
                limit: 100,
            }));
            expect(result).toEqual(expectedResult);
        });

        it('should apply explicit SLA breach filter when query param is provided', async () => {
            const req = { user: { sub: 'admin1', role: 'ADMIN' } };
            const expectedResult = { data: [], total: 0 };
            mockTicketsService.findAll.mockResolvedValue(expectedResult);

            await controller.findAll({ isSlaBreached: 'false' }, req);

            expect(mockTicketsService.findAll).toHaveBeenCalledWith(expect.objectContaining({
                isSlaBreached: false,
            }));
        });
    });

    describe('transition', () => {
        it('should transition status and emit notification', async () => {
            // Arrange
            const req = { user: { sub: 'user1' } };
            const expectedResult = { id: 'tik1', status: TicketStatus.RESOLVED };
            mockTicketsService.transition.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.transition('tik1', TicketStatus.RESOLVED, req);

            // Assert
            expect(mockTicketsService.transition).toHaveBeenCalledWith('tik1', TicketStatus.RESOLVED, 'user1');
            expect(mockNotificationsGateway.emitTicketUpdated).toHaveBeenCalledWith(expectedResult);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('assign', () => {
        it('should assign user and emit notification', async () => {
            // Arrange
            const req = { user: { sub: 'admin1' } };
            const expectedResult = { id: 'tik1', assignedTo: 'agent1' };
            mockTicketsService.assign.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.assign('tik1', 'agent1', req);

            // Assert
            expect(mockTicketsService.assign).toHaveBeenCalledWith('tik1', 'agent1', 'admin1');
            expect(mockNotificationsGateway.emitTicketUpdated).toHaveBeenCalledWith(expectedResult);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('getAssignableAgents', () => {
        it('should list agents eligible for assignment', async () => {
            const expectedResult = [{ id: 'agent1', fullName: 'Agent One' }];
            mockTicketsService.getAssignableAgents.mockResolvedValue(expectedResult);

            const result = await controller.getAssignableAgents('tik1');

            expect(mockTicketsService.getAssignableAgents).toHaveBeenCalledWith('tik1');
            expect(result).toEqual(expectedResult);
        });
    });

    describe('addMessage', () => {
        it('should add message and emit notification', async () => {
            // Arrange
            const dto: AddMessageDto = { message: 'Hello' };
            const req = { user: { sub: 'user1', role: 'agent' } };
            const expectedResult = { id: 'msg1', message: 'Hello' };
            mockTicketsService.addMessage.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.addMessage('tik1', dto, req);

            // Assert
            expect(mockTicketsService.addMessage).toHaveBeenCalledWith('tik1', dto, 'user1', 'agent');
            expect(mockNotificationsGateway.emitNewMessage).toHaveBeenCalledWith('tik1', expectedResult);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('escalate', () => {
        it('should escalate ticket priority and emit notification', async () => {
            // Arrange
            const dto: EscalateTicketDto = { toPriority: TicketPriority.URGENT, reason: 'Too slow' };
            const req = { user: { sub: 'agent1' } };
            const expectedResult = { id: 'tik1', priority: TicketPriority.URGENT };
            mockTicketsService.escalate.mockResolvedValue(expectedResult);

            // Act
            const result = await controller.escalate('tik1', dto, req);

            // Assert
            expect(mockTicketsService.escalate).toHaveBeenCalledWith('tik1', dto, 'agent1');
            expect(mockNotificationsGateway.emitTicketEscalated).toHaveBeenCalledWith(expectedResult);
            expect(result).toEqual(expectedResult);
        });
    });
});
