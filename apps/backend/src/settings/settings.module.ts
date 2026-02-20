import { Module, Global } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { CryptoService } from '../utils/crypto.service';

@Global()
@Module({
    providers: [SettingsService, CryptoService],
    controllers: [SettingsController],
    exports: [SettingsService, CryptoService],
})
export class SettingsModule { }
