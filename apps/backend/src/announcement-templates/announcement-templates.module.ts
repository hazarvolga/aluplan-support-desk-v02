import { Module } from '@nestjs/common';
import { AnnouncementTemplatesService } from './announcement-templates.service';
import { AnnouncementTemplatesController } from './announcement-templates.controller';

@Module({
    controllers: [AnnouncementTemplatesController],
    providers: [AnnouncementTemplatesService],
    exports: [AnnouncementTemplatesService],
})
export class AnnouncementTemplatesModule { }
