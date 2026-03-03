import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { json, urlencoded } from 'express';
import * as net from 'net';
import { AppModule } from './app.module';

async function checkConnection(host: string, port: number, timeout = 3000): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const timer = setTimeout(() => {
            socket.destroy();
            resolve(false);
        }, timeout);

        socket.connect(port, host, () => {
            clearTimeout(timer);
            socket.destroy();
            resolve(true);
        });

        socket.on('error', () => {
            clearTimeout(timer);
            socket.destroy();
            resolve(false);
        });
    });
}

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    // Pre-boot Network Audit
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const dbUrl = process.env.DATABASE_URL || '';
    const dbMatch = dbUrl.match(/@([^:/]+):(\d+)/);
    const dbHost = dbMatch ? dbMatch[1] : '';
    const dbPort = dbMatch ? parseInt(dbMatch[2], 10) : 5432;

    logger.log(`[NetCheck] 🔍 Auditing Internal Infrastructure Connectivity...`);
    const redisOk = await checkConnection(redisHost, redisPort);
    const dbOk = dbHost ? await checkConnection(dbHost, dbPort) : false;

    logger.log(`[NetCheck] 🔴 Redis (${redisHost}:${redisPort}): ${redisOk ? 'REACHABLE ✅' : 'UNREACHABLE ❌'}`);
    if (dbHost) {
        logger.log(`[NetCheck] 🐘 Database (${dbHost}:${dbPort}): ${dbOk ? 'REACHABLE ✅' : 'UNREACHABLE ❌'}`);
    }

    const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn', 'debug'] });

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3001);
    const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');

    // Security
    app.use(helmet());
    app.use(compression());

    // Payload Limit increase for massive CSV JSON arrays
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    // CORS
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    // Global API prefix
    app.setGlobalPrefix('api/v1');

    // Validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Swagger (only in development)
    if (configService.get('NODE_ENV') !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Aluplan Support Desk API')
            .setDescription('Controlled Knowledge Automation Engine')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
        logger.log(`📖 Swagger: http://localhost:${port}/api/docs`);
    }

    await app.listen(port);
    logger.log(`🚀 Backend running on http://localhost:${port}/api/v1`);
    logger.log(`🛡️  Audit Logging System: INITIALIZED`);
}

bootstrap();
