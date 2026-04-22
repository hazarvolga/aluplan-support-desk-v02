import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(private readonly metrics: MetricsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const route = req.route?.path || req.url;

        return next.handle().pipe(
            tap(() => {
                const duration = (Date.now() - now) / 1000;
                const res = context.switchToHttp().getResponse();
                this.metrics.recordHttpDuration(method, route, res.statusCode, duration);
            }),
        );
    }
}
