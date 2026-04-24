
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'express';
import * as net from 'net';
import { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { Logger as PinoLogger } from 'nestjs-pino';
import { ErrorLoggerService } from './common/services/error-logger.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { XssValidationPipe } from './common/pipes/xss-validation.pipe';

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
        } catch { }
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

    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });

    // GAP-03: Graceful shutdown — drain BullMQ jobs and close connections on SIGTERM
    app.enableShutdownHooks();

    app.useLogger(app.get(PinoLogger));

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 4000);
    const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');

    // Manual production validation removed in favor of Zod validateEnv()

    // Security Hardening
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginOpenerPolicy: { policy: "same-origin" },
        crossOriginEmbedderPolicy: { policy: "require-corp" },
        contentSecurityPolicy: configService.get('NODE_ENV') === 'production' ? {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"], // Removed 'unsafe-inline' and 'unsafe-eval'
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https://api.allplan.net.tr"], // Restrict endpoints
                frameSrc: ["'self'"],
            }
        } : false,
        hsts: true,
        noSniff: true,
        xssFilter: true,
        hidePoweredBy: true,
    }));

    app.use(compression());

    app.use(cookieParser());

    // Payload Limit restriction
    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ extended: true, limit: '10mb' }));

    // CSRF & Security Middlewares
    app.use((req: Request, res: Response, next: NextFunction) => {
        let csrfToken = req.cookies['XSRF-TOKEN'];
        if (!csrfToken) {
            csrfToken = crypto.randomBytes(32).toString('hex');
            res.cookie('XSRF-TOKEN', csrfToken, {
                httpOnly: false, // Frontend needs to read this to include in header
                secure: configService.get('NODE_ENV') === 'production',
                sameSite: 'lax',
                path: '/',
                domain: configService.get('NODE_ENV') === 'production' ? '.allplan.net.tr' : undefined,
            });

        }

        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            const headerToken = req.headers['x-xsrf-token'];

            if (!headerToken || headerToken !== csrfToken) {
                logger.warn(`CSRF double-submit validation failed from origin: ${req.headers.origin}`);
                return res.status(403).json({
                    statusCode: 403,
                    message: 'CSRF validation failed: Invalid XSRF token',
                    error: 'Forbidden'
                });
            }

            const requestedWith = req.headers['x-requested-with'];
            if (!requestedWith || requestedWith !== 'XMLHttpRequest') {
                logger.warn(`CSRF validation failed: Missing X-Requested-With header from origin: ${req.headers.origin}`);
                return res.status(403).json({
                    statusCode: 403,
                    message: 'CSRF validation failed: Missing X-Requested-With header',
                    error: 'Forbidden'
                });
            }
        }
        next();
    });

    // Note: Double-submit CSRF and Custom Header (X-Requested-With) 
    // mechanisms are implemented manually above to replace deprecated csurf.

    const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://allplan.net.tr',
        'https://api.allplan.net.tr',
        ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
        ...(frontendUrl.includes(',') ? frontendUrl.split(',') : [frontendUrl]),
    ];

    // CORS
    app.enableCors({
        origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
            // Production'da !origin izin vermiyoruz (SSRF bypass mitigation)
            if (!origin) {
                if (nodeEnv === 'production') {
                    logger.warn(`CORS blocked for missing origin request`);
                    return callback(new Error('Not allowed by CORS (Missing Origin)'));
                }
                return callback(null, true);
            }

            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                logger.warn(`CORS blocked for origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-CSRF-Token', 'X-XSRF-TOKEN'],
    });

    // Global API prefix
    app.setGlobalPrefix('api/v1');

    // Validation
    app.useGlobalPipes(
        new XssValidationPipe(),
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Global Exception Filter (GAP-20: proper imports instead of require())
    const httpAdapterHost = app.get(HttpAdapterHost);
    const errorLogger = app.get(ErrorLoggerService);
    app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost, errorLogger));

    // GAP-08: Swagger Production Constraints & Export
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Aluplan Support Desk API')
        .setDescription('Controlled Knowledge Automation Engine')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    // Save OpenAPI JSON spec for external tools/API Gateways
    fs.writeFileSync('./openapi.json', JSON.stringify(document));

    if (configService.get('NODE_ENV') === 'production') {
        const swaggerPassword = configService.get('SWAGGER_PASSWORD');
        if (!swaggerPassword) {
            throw new Error('SWAGGER_PASSWORD environment variable is absolutely required in production.');
        }
        app.use(['/api/docs', '/api/docs-json'], (req: Request, res: Response, next: NextFunction) => {
            const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
            const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
            if (login === 'admin' && password === swaggerPassword) return next();
            res.set('WWW-Authenticate', 'Basic realm="Aluplan API"');
            res.status(401).send('Authentication required');
        });
    }

    SwaggerModule.setup('api/docs', app, document, {
        jsonDocumentUrl: 'api/docs-json',
    });
    logger.log(`📖 Swagger: http://localhost:${port}/api/docs`);

    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Backend running on http://localhost:${port}/api/v1`);
    logger.log(`🛡️  Audit Logging System: INITIALIZED`);
}

bootstrap();
