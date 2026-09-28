import { Injectable } from '@nestjs/common';
import {
    EventEmitter2,
    EventEmitterModule,
    OnEvent,
} from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';
import { TicketsService } from './tickets.service';

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((fulfill) => {
        resolve = fulfill;
    });
    return { promise, resolve };
}

@Injectable()
class HeldTicketListener {
    readonly started = deferred();
    readonly release = deferred();
    readonly finished = deferred();
    hasStarted = false;

    @OnEvent('ticket.created', { async: true, promisify: true })
    async handle() {
        this.hasStarted = true;
        this.started.resolve();
        await this.release.promise;
        this.finished.resolve();
    }
}

// Actual ticket persistence/fan-out boundary; external IO is mocked. The single
// discovered synthetic consumer is NOT proof that all five domain consumers or
// their nested translation/AI branches return their entire operation promise.
describe('ticket creation work accounting', () => {
    let module: TestingModule;
    let tracker: MaintenanceWorkService;
    let listener: HeldTicketListener;
    let service: TicketsService;
    let prisma: any;
    let ai: any;
    const ticket = {
        id: 'synthetic-ticket',
        ticketNumber: 'SUP-00001',
        status: 'NEW',
    };
    const dto = { subject: 'Synthetic support question' };
    const holds: ReturnType<typeof deferred>[] = [];
    const responses: Promise<unknown>[] = [];

    function hold() {
        const value = deferred();
        holds.push(value);
        return value;
    }

    function create(input = dto) {
        const response = service.create(input, 'synthetic-user');
        responses.push(response);
        return response;
    }

    beforeEach(async () => {
        holds.length = 0;
        responses.length = 0;
        tracker = new MaintenanceWorkService();
        module = await Test.createTestingModule({
            imports: [EventEmitterModule.forRoot()],
            providers: [HeldTicketListener],
        }).compile();
        await module.init();
        listener = module.get(HeldTicketListener);
        prisma = {
            $queryRaw: jest.fn().mockResolvedValue([{ nextval: 1n }]),
            product: {
                findFirst: jest.fn().mockResolvedValue({ id: 'product-1' }),
            },
            ticket: {
                create: jest.fn().mockResolvedValue(ticket),
                update: jest.fn().mockResolvedValue(ticket),
            },
        };
        ai = {
            smartTagTicket: jest
                .fn()
                .mockResolvedValue({ tags: ['synthetic-category'] }),
        };
        service = new TicketsService(
            prisma as never,
            { calculateDeadlines: jest.fn().mockResolvedValue({}) } as never,
            { maskSensitiveData: (text: string) => text } as never,
            module.get(EventEmitter2),
            ai as never,
            {} as never,
            {} as never,
            tracker,
        );
    });

    afterEach(async () => {
        for (const value of holds) value.resolve();
        listener.release.resolve();
        await Promise.allSettled(responses);
        await new Promise<void>((resolve) => setImmediate(resolve));
        if (listener.hasStarted) await listener.finished.promise;
        tracker.closeAdmission();
        await tracker.waitForIdle(1000);
        await module.close();
    });

    it('rejects a new create with 503 before persistence after admission closes', async () => {
        tracker.closeAdmission();
        await expect(create()).rejects.toMatchObject({ status: 503 });
        expect(prisma.$queryRaw).not.toHaveBeenCalled();
        expect(prisma.ticket.create).not.toHaveBeenCalled();
        expect(listener.hasStarted).toBe(false);
    });

    it('returns the committed ticket while its scheduled event child still prevents drain', async () => {
        const response = create();
        const result = await Promise.race([
            response,
            new Promise<'pending'>((resolve) =>
                setImmediate(() => resolve('pending')),
            ),
        ]);
        expect(result).toEqual(ticket);
        tracker.closeAdmission();
        await listener.started.promise;
        const heldWork = await tracker.waitForIdle(0);
        expect(heldWork.drained).toBe(false);
        expect(heldWork.activeCount).toBeGreaterThan(0);
        listener.release.resolve();
        await expect(tracker.waitForIdle(1000)).resolves.toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('lets an already admitted database operation spawn its event child after the fence', async () => {
        const database = hold();
        const started = hold();
        prisma.ticket.create.mockImplementationOnce(async () => {
            started.resolve();
            await database.promise;
            return ticket;
        });
        const response = create();
        await started.promise;
        tracker.closeAdmission();
        const beforeCommit = await tracker.waitForIdle(0);
        expect(beforeCommit.drained).toBe(false);
        expect(beforeCommit.activeCount).toBeGreaterThan(0);
        database.resolve();
        await expect(response).resolves.toEqual(ticket);
        await listener.started.promise;
        expect((await tracker.waitForIdle(0)).drained).toBe(false);
        listener.release.resolve();
        await expect(tracker.waitForIdle(1000)).resolves.toEqual({
            drained: true,
            activeCount: 0,
        });
    });

    it('keeps a later autotag database update counted without delaying the ticket response', async () => {
        const write = hold();
        const started = hold();
        prisma.ticket.update.mockImplementationOnce(async () => {
            started.resolve();
            await write.promise;
            return ticket;
        });
        listener.release.resolve();
        const response = create({
            ...dto,
            productId: 'product-1',
        } as typeof dto);
        const result = await Promise.race([
            response,
            new Promise<'pending'>((resolve) =>
                setImmediate(() => resolve('pending')),
            ),
        ]);
        expect(result).toEqual(ticket);
        await started.promise;
        tracker.closeAdmission();
        const heldWork = await tracker.waitForIdle(0);
        expect(heldWork.drained).toBe(false);
        expect(heldWork.activeCount).toBeGreaterThan(0);
        expect(prisma.ticket.update).toHaveBeenCalledWith({
            where: { id: ticket.id },
            data: { suggestedCategories: ['synthetic-category'] },
        });
        write.resolve();
        await expect(tracker.waitForIdle(1000)).resolves.toEqual({
            drained: true,
            activeCount: 0,
        });
    });
});
