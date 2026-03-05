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
    const redisUrlString = process.env.REDIS_URL || '';
    let redisHost = process.env.REDIS_HOST || 'localhost';
    let redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

    if (redisUrlString.startsWith('redis://') || redisUrlString.startsWith('rediss://')) {
        try {
            const urlObj = new URL(redisUrlString);
            redisHost = urlObj.hostname;
            redisPort = parseInt(urlObj.port) || 6379;
        } catch (e) { }
    }
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
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false, // Relaxed for API stability in production
    }));
    app.use(compression());

    // Payload Limit increase for massive CSV JSON arrays
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    const allowedOrigins = [
        'http://localhost:3000',
        'https://allplan.net.tr',
        'https://api.allplan.net.tr',
        ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
        ...(frontendUrl.includes(',') ? frontendUrl.split(',') : [frontendUrl]),
    ];

    // CORS
    app.enableCors({
        origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
            // If no origin (like mobile apps or curl requests), allow it
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
                callback(null, true);
            } else {
                logger.warn(`CORS blocked for origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
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

    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Backend running on http://localhost:${port}/api/v1`);
    logger.log(`🛡️  Audit Logging System: INITIALIZED`);
}

bootstrap();
