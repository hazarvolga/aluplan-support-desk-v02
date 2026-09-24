import { BadRequestException, Controller, Get, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ClientRequest, request } from 'node:http';
import { AddressInfo } from 'node:net';
import { Request, Response, NextFunction } from 'express';
import { GlobalExceptionFilter } from './global-exception.filter';
import { ErrorLoggerService } from '../services/error-logger.service';
import { MaintenanceWorkService } from '../services/maintenance-work.service';

@Controller('failure')
class FailureController {
    @Get()
    fail() {
        throw new BadRequestException('Invalid input');
    }
}

async function bounded(signal: Promise<void>): Promise<void> {
    let timer!: ReturnType<typeof setTimeout>;
    try {
        await Promise.race([
            signal,
            new Promise<never>((_resolve, reject) => {
                timer = setTimeout(
                    () => reject(new Error('HTTP phase timed out')),
                    1000,
                );
            }),
        ]);
    } finally {
        clearTimeout(timer);
    }
}

it('keeps the actual error logger write counted after real HTTP disconnect', async () => {
    let release!: () => void;
    let entered!: () => void;
    let closed!: () => void;
    const held = new Promise<void>((resolve) => {
        release = resolve;
    });
    let failStart!: (error: Error) => void;
    const started = new Promise<void>((resolve, reject) => {
        entered = resolve;
        failStart = reject;
    });
    const disconnected = new Promise<void>((resolve) => {
        closed = resolve;
    });
    const create = jest.fn(() => {
        entered();
        return held;
    });
    const work = new MaintenanceWorkService();
    const errorLogger = new ErrorLoggerService({
        auditLog: { create },
    } as never);
    const module = await Test.createTestingModule({
        controllers: [FailureController],
    }).compile();
    const app = module.createNestApplication();
    const log = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
    let client: ClientRequest | undefined;
    let destroying = false;
    app.use((_req: Request, res: Response, next: NextFunction) => {
        res.once('close', closed);
        next();
    });
    const adapterHost = app.get(HttpAdapterHost);
    const reply = jest.spyOn(adapterHost.httpAdapter, 'reply');
    app.useGlobalFilters(
        new GlobalExceptionFilter(adapterHost, errorLogger, work),
    );
    try {
        await app.listen(0, '127.0.0.1');
        const { port } = app.getHttpServer().address() as AddressInfo;
        client = request({ hostname: '127.0.0.1', port, path: '/failure' });
        client.on('error', (error) => {
            if (!destroying) failStart(error);
        });
        client.end();
        await bounded(started);
        work.closeAdmission();
        destroying = true;
        client.destroy();
        await bounded(disconnected);
        expect(await work.waitForIdle(0)).toEqual({
            drained: false,
            activeCount: 1,
        });
        expect(create).toHaveBeenCalledTimes(1);
        expect(reply).not.toHaveBeenCalled();
        release();
        expect(await work.waitForIdle(1000)).toEqual({
            drained: true,
            activeCount: 0,
        });
        await new Promise<void>((resolve) => setImmediate(resolve));
        expect(reply).not.toHaveBeenCalled();
    } finally {
        destroying = true;
        client?.destroy();
        release();
        work.closeAdmission();
        await work.waitForIdle(1000);
        try {
            await app.close();
        } finally {
            reply.mockRestore();
            log.mockRestore();
        }
    }
});
