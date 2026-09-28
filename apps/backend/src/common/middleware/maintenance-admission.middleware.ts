import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MaintenanceWorkService } from '../services/maintenance-work.service';

/** New HTTP admission only; next/response close do not prove business completion. */
@Injectable()
export class MaintenanceAdmissionMiddleware implements NestMiddleware {
    constructor(private readonly work: MaintenanceWorkService) {}

    use(_request: Request, response: Response, next: NextFunction): void {
        try {
            this.work.assertAdmissionOpen();
        } catch {
            // Reply directly: exception filters may themselves write to the DB.
            response.setHeader('Cache-Control', 'no-store');
            response.status(503).json({
                statusCode: 503,
                code: 'MAINTENANCE',
                message: 'Service temporarily unavailable',
            });
            return;
        }
        // Keep this outside the catch; preserve downstream errors and streaming.
        next();
    }
}
