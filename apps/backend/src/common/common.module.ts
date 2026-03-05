import { Global, Module } from '@nestjs/common';
import { ErrorLoggerService } from './services/error-logger.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
    imports: [PrismaModule],
    providers: [ErrorLoggerService],
    exports: [ErrorLoggerService],
})
export class CommonModule { }
