import { NestFactory } from '@nestjs/core';
import { AppModule } from './apps/backend/src/app.module';
import { TicketsService } from './apps/backend/src/tickets/tickets.service';
import { PrismaService } from './apps/backend/src/prisma/prisma.service';
import { AuthService } from './apps/backend/src/auth/auth.service';
import { io } from 'socket.io-client';

async function bootstrap() {
    console.log('Bootstrapping NestJS test app...');
    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
    await app.listen(0); // Random port
    const url = await app.getUrl();
    console.log('App listening on', url);

    const prisma = app.get(PrismaService);
    const authService = app.get(AuthService);
    const ticketsService = app.get(TicketsService);

    // Find an admin and a customer
    let adminUser = await prisma.user.findFirst({ where: { role: { name: 'admin' } } });
    if (!adminUser) adminUser = await prisma.user.findFirst({ where: { role: { name: 'ADMIN' } } });
    const customerUser = await prisma.user.findFirst({ where: { role: { name: 'customer' } } });

    if (!adminUser || !customerUser) {
        console.error('Missing admin or customer user in DB. Aborting test.');
        await app.close();
        return;
    }

    // Login as admin to get token
    console.log(`Getting token for ADMIN: ${adminUser.email}`);
    // generate token manually
    const adminRole = await prisma.role.findUnique({ where: { id: adminUser.roleId as string }, include: { permissions: { include: { permission: true } } } });
    const permissions = adminRole?.permissions.map(p => p.permission.name) || ['*'];
    const payload = { sub: adminUser.id, email: adminUser.email, fullName: adminUser.fullName, role: adminRole?.name || 'admin', permissions };
    const token = await app.get('JwtService').signAsync(payload, { secret: app.get('ConfigService').get('JWT_SECRET') });

    // Connect WebSocket as Admin
    console.log('Connecting socket...');
    const wsUrl = url.replace('http', 'ws') + '/ws';
    const socket = io(wsUrl, {
        auth: { token },
        transports: ['websocket']
    });

    socket.on('connect', () => {
        console.log('🟢 Socket connected as ADMIN! ID:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('🔴 Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
        console.error('Socket connect error:', err.message);
    });

    // Listen for the event!
    socket.on('ticket:created', (data: any) => {
        console.log('🚀 SUCCESS! Client received ticket:created event via WebSocket!');
        console.dir(data, { depth: null, colors: true });
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Simulating Ticket Creation by Customer...');
    try {
        await ticketsService.create({
            subject: 'WS Test Ticket',
            description: 'This is an automated test for WebSocket notifications',
            departmentId: null as any
        }, customerUser.id);
    } catch (e) {
        console.error('Failed to create ticket', e);
    }

    console.log('Waiting for socket events...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Cleaning up...');
    socket.disconnect();
    await app.close();
    process.exit(0);
}

bootstrap().catch(console.error);
